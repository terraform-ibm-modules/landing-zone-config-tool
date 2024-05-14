import {
  splat,
  contains,
  isEmpty,
  containsKeys,
  eachKey,
  revision,
  isBoolean
} from "lazy-z";
import { newTeleportConfig } from "./builders.js";
import { requiredOptionalFields } from "./constants.js";
import { validSshKey } from "./lib-utils.js";
import { eachRuleProtocol } from "./store/utils.js";

const simpleErrors = {
  invalidAtrackerBucket:
    "Activity Tracker must have a valid bucket name. Got `null`",
  unfoundAtrackerKey:
    "The COS instance where the Activity Tracker bucket is created must have at least one key. Got 0",
  noCosInstances: "At least one Object Storage Instance is required. Got 0",
  noOpenShiftCosInstance: clusterName => {
    return `OpenShift clusters require a cos instance. Cluster \`${clusterName}\` cos_name is null.`;
  },
  noVpeVpcs: serviceName => {
    return `Virtual private endpoints must have at least one VPC. Service name \`${serviceName}\` got 0.`;
  },
  noVpeSubnets: (serviceName, vpcName) => {
    return `Virtual private endpoints must have at least one VPC subnet. Service name \`${serviceName}\` VPC Name \`${vpcName}\` has 0.`;
  },
  noDeploymentSshKeys: deploymentName => {
    return `${deploymentName} must have at least one SSH Key, got 0.`;
  },
  noDeploymentPrimarySubnet: (deploymentName, subnetField) => {
    return `${deploymentName} must have a valid subnet at ${subnetField}, got null.`;
  },
  variableRemoved: (oldVariableName, newVariableName) => {
    return `${oldVariableName} has been removed. Use ${newVariableName} instead.`;
  }
};

/**
 * validate a json configuration object
 * @param {Object} configDotJson landing zone configuration json
 * @param {boolean} isDownload is download
 */
const validate = function(configDotJson, isDownload) {
  /**
   * validate something
   * @param {string} componentName name of component (ie Clusters)
   * @param {Object} component component
   * @param {string} addressName name of the address (ie resource group)
   * @param {string} componentAddress address of component (ie resource_group)
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component if child
   * @param {*=} testParams.overrideValue override tested value to arbitrary one
   * @param {string=} testParams.overrideName override tested component name
   * @param {string=} testParams.overrideNameField override field if not name
   */
  function validationTest(
    componentName,
    component,
    addressName,
    componentAddress,
    testParams
  ) {
    let params = testParams || {}; // set test params
    // if override value is in the params object, not testing other ways results in an
    // automatic failure if field is `null`
    let testValue = containsKeys(params, "overrideValue")
      ? params.overrideValue // set to override value
      : component[componentAddress];
    // parent name if any
    let parentName = params?.parentName ? params.parentName + " " : "";
    // plural require
    let pluralRequire = contains(
      [
        "Transit gateway",
        "App ID",
        "Secrets Manager",
      ],
      componentName
    )
      ? "requires"
      : "require";
    // set composed name
    let composedName =
      params?.overrideName ||
      `\`${
        component[params?.overrideNameField || "name"]
      }\` ${componentAddress}`;
    // if testValue is null
    if (testValue === null) {
      throw new Error(
        `${componentName} ${pluralRequire} a ${addressName}, ${parentName}${composedName} is null.`
      );
    }
  }

  /**
   * test a component for null resource_group value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object} testParams test params
   * @param {string} testParams.overrideValue override value
   * @param {string} testParams.overrideName override name
   */
  function nullResourceGroupTest(componentName, component, testParams) {
    let params = {};
    eachKey(testParams || {}, key => {
      params[key] = testParams[key];
    });
    validationTest(
      componentName,
      component,
      "resource group",
      "resource_group",
      params
    );
  }

  /**
   * test a component for null encryption key name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component
   */
  function nullEncryptionKeyTest(
    componentName,
    component,
    testParams,
    overrideField
  ) {
    validationTest(
      componentName,
      component,
      "encryption key",
      overrideField || "kms_key",
      testParams
    );
  }

  /**
   * test a component for null vpc name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   */
  function nullVpcNameTest(componentName, component) {
    validationTest(componentName, component, "VPC Name", "vpc_name");
  }

  /**
   * test a component for null vpc name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component
   */
  function emptySubnetNamesTest(componentName, component, testParams) {
    let params = testParams || {};
    if (isEmpty(component.subnet_names)) {
      throw new Error(
        `${componentName} require at least one subnet to provision, ${
          params?.parentName ? params.parentName + " " : ""
        }\`${component.name}\` subnet_names is [].`
      );
    }
  }

  /**
   * update objects in place to have networking rule defaults to allow
   * for conversion to list
   * @param {Array<object>} rules list of rules
   * @param {boolean=} isAcl is network acl
   */
  function updateNetworkingRulesForCompatibility(rules, isAcl) {
    rules.forEach(rule => {
      // for each rule type
      eachRuleProtocol(type => {
        // if the rule type is not part of the rule object
        if (!containsKeys(rule, type)) {
          // set rule
          if (type === "icmp") {
            rule[type] = {
              type: null,
              code: null
            };
          } else {
            rule[type] = {
              port_min: null,
              port_max: null
            };
            if (isAcl) {
              rule[type].source_port_max = null;
              rule[type].source_port_min = null;
            }
          }
        } else {
          eachKey(rule[type], key => {
            if (rule[type][key] !== null)
              rule[type][key] = parseInt(rule[type][key]);
          });
        }
      });
    });
  }

  // atracker must have bucket name
  if (configDotJson.atracker.collector_bucket_name === null) {
    throw new Error(simpleErrors.invalidAtrackerBucket);
  }

  // must have cos
  if (configDotJson.cos.length === 0) {
    throw new Error(simpleErrors.noCosInstances);
  }

  // cluster configuration
  configDotJson.clusters.forEach(cluster => {
    // if cluster is openshift and no cos name, throw error
    if (cluster.kube_type === "openshift" && cluster.cos_name === null) {
      throw new Error(simpleErrors.noOpenShiftCosInstance(cluster.name));
    }

    // cluster tests
    emptySubnetNamesTest("Clusters", cluster);
    nullVpcNameTest("Clusters", cluster);

    // test for empty pool subnets
    cluster.worker_pools.forEach(pool => {
      emptySubnetNamesTest("Worker pools", pool, {
        parentName: "`workload-cluster` worker_pool"
      });
    });
  });

  // security groups
  configDotJson.security_groups.forEach(group => {
    nullVpcNameTest("Security Groups", group);
    updateNetworkingRulesForCompatibility(group.rules);
  });

  // vpes
  configDotJson.virtual_private_endpoints.forEach(instance => {
    if (isEmpty(instance.vpcs)) {
      // throw an error if no vpcs
      throw new Error(simpleErrors.noVpeVpcs(instance.service_name));
    } else {
      instance.vpcs.forEach(vpc => {
        // throw an error if no vpc subnets
        if (isEmpty(vpc.subnets)) {
          throw new Error(
            simpleErrors.noVpeSubnets(instance.service_name, vpc.name)
          );
        }
      });
    }
  });

  // vpcs
  configDotJson.vpcs.forEach(network => {
    validationTest(
      "VPCs",
      network,
      "Flow Logs Bucket",
      "flow_logs_bucket_name",
      { overrideNameField: "prefix" }
    );
    // check that deleted variables are not still in use
    if (containsKeys(network, "clean_default_security_group")) {
      throw new Error(simpleErrors.variableRemoved("clean_default_security_group", "clean_default_sg_acl"));
    }
    if (containsKeys(network, "clean_default_acl")) {
      throw new Error(simpleErrors.variableRemoved("clean_default_acl", "clean_default_sg_acl"));
    }
    if (containsKeys(network, "use_manual_address_prefixes")) {
      throw new Error(simpleErrors.variableRemoved("use_manual_address_prefixes", "the address_prefixes map"));
    }
    // for each acl
    network.network_acls.forEach(acl => {
      updateNetworkingRulesForCompatibility(acl.rules, true);
    });
  });

  // vpn gateways
  configDotJson.vpn_gateways.forEach(gateway => {
    nullVpcNameTest("VPN gateways", gateway);
    validationTest("VPN gateways", gateway, "subnet name", "subnet_name");
  });

  /**
   * base tests for vsi, teleport vsi, and f5 vsi
   * @param {Object} deployment vpc deployment
   * @param {string=} type type of deployment if teleport or f5
   */
  function instanceTests(deployment, type) {
    let deploymentName = `${type ? type + " " : ""}VSIs`; // composed name
    // subnets to check
    let subnetField =
      type === "Teleport"
        ? "subnet_name"
        : type === "F5"
        ? "primary_subnet_name"
        : false;

    // vsi test
    nullVpcNameTest(deploymentName, deployment);

    // if no ssh keys
    if (isEmpty(deployment.ssh_keys)) {
      throw new Error(simpleErrors.noDeploymentSshKeys(deploymentName));
    }

    // if not vsi and no valid primary subnet name
    if (subnetField && deployment[subnetField] === null) {
      throw new Error(
        simpleErrors.noDeploymentPrimarySubnet(deploymentName, subnetField)
      );
    }

    /* istanbul ignore next */
    if (deployment.security_group?.rules)
      updateNetworkingRulesForCompatibility(deployment.security_group.rules);
  }

  // vsi
  configDotJson.vsi.forEach(deployment => {
    instanceTests(deployment);
    emptySubnetNamesTest("VSIs", deployment);
    if (!isBoolean(deployment.enable_floating_ip))
      deployment.enable_floating_ip = false;
  });

  // teleport vsi
  if (configDotJson?.teleport_vsi)
    configDotJson.teleport_vsi.forEach(deployment => {
      instanceTests(deployment, "Teleport");
    });

  // f5 vsi
  if (configDotJson?.f5_vsi)
    configDotJson.f5_vsi.forEach(deployment => {
      instanceTests(deployment, "F5");
    });

  /**
   * add unfound fields to objects to allow terraform to parse successfully
   * @param {Object} instance instance object
   * @param {Object} componentFields component fields object
   */
  function addUnfoundListFields(instance, componentFields) {
    eachKey(componentFields, action => {
      if (action !== "setToValue") {
        // value to set if not direct value
        let setValue =
          action === "setToNull"
            ? null
            : action === "setToEmptyList"
            ? []
            : false;
        // for each field to set
        componentFields[action].forEach(field => {
          if (!containsKeys(instance, field)) {
            instance[field] = setValue;
          }
        });
      } else {
        // for each key that is not set
        eachKey(componentFields[action], valueToSet => {
          // if the instance does not contain the value
          if (!containsKeys(instance, valueToSet)) {
            // set value to value to set
            instance[valueToSet] = componentFields[action][valueToSet];
          }
        });
      }
    });
  }

  configDotJson.ssh_keys = configDotJson.ssh_keys || [];

  // for each shallow component
  eachKey(requiredOptionalFields.shallowComponents, component => {
    // for each instance of that component
    configDotJson[component].forEach(instance => {
      // add unfound list fields
      addUnfoundListFields(
        instance,
        requiredOptionalFields.shallowComponents[component]
      );
      // if the component has nested components
      if (containsKeys(requiredOptionalFields.nestedComponents, component)) {
        // for each nested field
        eachKey(
          requiredOptionalFields.nestedComponents[component],
          subField => {
            // for each object in nested instance
            instance[subField].forEach(nestedInstance => {
              // add unfound list fields
              addUnfoundListFields(
                nestedInstance,
                requiredOptionalFields.nestedComponents[component][subField]
              );
            });
          }
        );
      }
    });
  });

  // unfound fields
  if (!configDotJson.appid) {
    configDotJson.appid = {
      use_appid: false,
      name: null,
      resource_group: null,
      use_data: false,
      keys: []
    };
  }

  if (!configDotJson.secrets_manager) {
    configDotJson.secrets_manager = {
      kms_key_name: null,
      name: null,
      resource_group: null,
      use_secrets_manager: false
    };
  }

  if (!configDotJson.f5_template_data) {
    new revision(configDotJson)
      .set("f5_template_data", {
        _no_default: ["tmos_admin_password"],
        _defaults: {
          license_type: "none",
          byol_license_basekey: "null",
          license_host: "null",
          license_password: "null",
          license_pool: "null",
          license_sku_keyword_1: "null",
          license_sku_keyword_2: "null",
          license_username: "null",
          license_unit_of_measure: "hourly",
          template_source:
            "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
          template_version: "20210201",
          app_id: "null",
          phone_home_url: "null",
          do_declaration_url: "null",
          as3_declaration_url: "null",
          ts_declaration_url: "null",
          tgstandby_url: "null",
          tgrefresh_url: "null",
          tgactive_url: "null"
        }
      })
      .set("f5_vsi", []);
  }

  if (!configDotJson.iam_account_settings) {
    configDotJson.iam_account_settings = {
      enable: false,
      mfa: null,
      allowed_ip_addresses: null,
      include_history: null,
      if_match: null,
      max_sessions_per_identity: null,
      restrict_create_service_id: null,
      restrict_create_platform_apikey: null,
      session_expiration_in_seconds: null,
      session_invalidation_in_seconds: null
    };
  }

  if (!configDotJson.key_management.use_data) {
    configDotJson.key_management.use_data = configDotJson.key_management
      .use_hs_crypto
      ? true
      : false;
  }

  configDotJson.key_management.keys.forEach(key => {
    if (!key.policies) {
      key.policies = {
        rotation: {
          interval_month: 12
        }
      };
    }
  });

  configDotJson.resource_groups.forEach(group => {
    if (group.use_prefix === null) group.use_prefix = false;
  });

  configDotJson.teleport_vsi = configDotJson.teleport_vsi || [];
  configDotJson.teleport_config = configDotJson.teleport_config || newTeleportConfig();
  configDotJson.access_groups = configDotJson.access_groups || [];

  if (isDownload) {
    nullResourceGroupTest("Atracker", configDotJson.atracker);
    nullResourceGroupTest("Key Management", configDotJson.key_management);
    nullResourceGroupTest(
      "Transit gateway",
      {},
      {
        overrideValue: configDotJson.transit_gateway_resource_group,
        overrideName: "transit_gateway_resource_group"
      }
    );
    // check cos for null resource groups
    configDotJson.cos.forEach(instance => {
      nullResourceGroupTest("Object Storage Instances", instance);
      // check each bucket for encryption key
      instance.buckets.forEach(bucket => {
        nullEncryptionKeyTest("Object Storage Buckets", bucket, {
          parentName: `\`${instance.name}\` bucket`
        });
      });
    });

    // cluster configuration
    configDotJson.clusters.forEach(cluster => {
      // cluster tests
      emptySubnetNamesTest("Clusters", cluster);
      nullVpcNameTest("Clusters", cluster);
      nullResourceGroupTest("Clusters", cluster);

      // allow for optional cluster encryption
      nullEncryptionKeyTest("Clusters", cluster, {
        overrideValue: cluster.kms_config.crk_name
      });
    });

    configDotJson.vpcs.forEach(network => {
      nullResourceGroupTest("VPCs", network, { overrideNameField: "prefix" });
      validationTest(
        "VPCs",
        network,
        "Flow Logs Bucket",
        "flow_logs_bucket_name",
        { overrideNameField: "prefix" }
      );
    });

    // vpn gateways
    configDotJson.vpn_gateways.forEach(gateway => {
      nullResourceGroupTest("VPN gateways", gateway);
      nullVpcNameTest("VPN gateways", gateway);
      validationTest("VPN gateways", gateway, "subnet name", "subnet_name");
    });

    if (configDotJson.secrets_manager.use_secrets_manager) {
      nullResourceGroupTest("Secrets Manager", configDotJson.secrets_manager, {
        overrideName: "Secrets Manager Resource Group"
      });
      nullEncryptionKeyTest(
        "Secrets Manager",
        configDotJson.secrets_manager,
        {},
        "kms_key_name"
      );
    }

    if (configDotJson.appid.use_appid) {
      nullResourceGroupTest("App ID", configDotJson.appid, {
        overrideName: "App ID resource_group"
      });
    }

    configDotJson.ssh_keys.forEach(key => {
      /* istanbul ignore next */
      if (!validSshKey(key.public_key)) {
        throw new Error(`SSH keys require a valid public key. Invalid public key for SSH key "${
          key.name
        }"`);
      }
    });
  }

  return configDotJson;
};

export { validate };
