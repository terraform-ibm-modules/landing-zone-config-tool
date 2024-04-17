import { contains, eachKey, splat, isEmpty, flatten } from "lazy-z";
import {
  emailValidationExp,
  nameValidationExp,
  f5fields
} from "./constants.js";
import {
  hasInvalidName,
  hasInvalidResourceGroup,
  hasInvalidVpc,
  hasInvalidEncryptionKey,
  hasInvalidCosBucket,
  vpcNameFieldsCheck,
  hasInvalidSshPublicKey,
  hasInvalidWorkers,
  iamAccountSettingsInvalidRange,
  iamAccountSettingsInvalidNumber,
  iamAccountSettingsInvalidIpString
} from "./error-text-utils.js";
import {
  minStringSize,
  validateRuleData,
  validIpCidr,
  validTmosAdminPassword,
  validUrl
} from "./lib-utils.js";
import { checkNullorEmptyString } from "./store/utils.js";

/**
 * tests if name and resource group are invalid
 * @param {string} componentName
 * @param {string} name
 * @param {string} resourceGroupName
 * @param {*} componentProps
 * @param {boolean=} useData
 * @returns {boolean} true if invalid (should be disabled)
 */
function nameAndRgTest(
  componentName,
  name,
  resourceGroupName,
  componentProps,
  useData
) {
  let invalidName = hasInvalidName(componentName, name, componentProps, useData)
    .invalid;
  let invalidRg = hasInvalidResourceGroup(resourceGroupName, componentProps);
  return invalidName || invalidRg;
}

/**
 * tests if name, rg, or vpc are invalid
 * @param {string} componentName
 * @param {string} name
 * @param {string} resourceGroupName
 * @param {*} componentProps
 * @param {boolean=} useData
 * @returns {boolean} true if invalid (should be disabled)
 */
function nameRgAndVpcTest(
  componentName,
  name,
  resourceGroupName,
  vpcName,
  componentProps,
  useData
) {
  let nameOrRgInvalid = nameAndRgTest(
    componentName,
    name,
    resourceGroupName,
    componentProps,
    useData
  );
  let invalidVpc = hasInvalidVpc(vpcName, componentProps);
  return nameOrRgInvalid || invalidVpc;
}

/**
 * all disable save functions
 */
const disableSaveFunctions = {
  /**
   * disable access group save
   * @param {slzState} slz
   * @param {Object} stateData
   * @param {string} stateData.name name of access group
   * @param {string} stateData.description access group description
   * @param {Object} componentProps
   * @returns {boolean} true if disabled
   */
  access_groups: function(stateData, componentProps) {
    return hasInvalidName("access_groups", stateData.name, componentProps)
      .invalid;
  },

  /**
   * disable access group policy save
   * checks for valid name
   * @param {slzState} slz
   * @param {Object} stateData
   * @param {string} stateData.name name of access group policy
   * @param {Array<string>} stateData.roles list of roles
   * @param {Object=} stateData.resources additional params
   * @param {string=} stateData.resources.resource_group resource group name
   * @param {string=} stateData.resources.resource_type Name of the resource type for the policy ex. "resource-group"
   * @param {string=} stateData.resources.resource The resource of the policy definition
   * @param {string=} stateData.resources.service Name of the service type for the policy ex. "cloud-object-storage"
   * @param {string=} stateData.resources.resource_instance_id ID of a service instance to give permissions
   * @param {Object} componentProps
   * @param {string} componentProps.arrayParentName name of parent where rule will be created
   * @returns {boolean} true if disabled
   */
  policies: function(stateData, componentProps) {
    return hasInvalidName("policies", stateData.name, componentProps).invalid;
  },

  /**
   * disable access group dynamic policy save
   * checks for valid name and the min string size of identity provider
   * @param {slzState} slz
   * @param {Object} stateData
   * @param {string} stateData.name name of access group dynamic policy
   * @param {string} stateData.identity_provider URI for identity provider
   * @param {string} stateData.expiration How many hours authenticated users can work before refresh
   * @param {Object=} stateData.conditions additional params
   * @param {string=} stateData.conditions.claim Key value to evaluate the condition against
   * @param {string=} stateData.conditions.operator The operation to perform on the claim
   * @param {string=} stateData.conditions.value Value to be compared against
   * @param {Object} componentProps
   * @param {string} componentProps.arrayParentName name of parent where rule will be created
   * @returns {boolean} true if disabled
   */
  dynamic_policies: function(stateData, componentProps) {
    return (
      hasInvalidName("dynamic_policies", stateData.name, componentProps)
        .invalid || !minStringSize(stateData.identity_provider)
    );
  },

  /**
   * disable network acl
   * checks for valid name
   * @param {Object} stateData
   * @param {string} stateData.name name of the acl
   * @param {Object} componentProps props
   * @param {string} componentProps.arrayParentName name of the parent
   * @param {Object} componentProps.data
   * @param {string} componentProps.data.name old name
   * @param {Object} componentProps.slz slz state store
   * @param {slzStateStore} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.vpcs
   * @param {Array<Object>} componentProps.slz.store.configDotJson.vpcs.network_acls
   * @returns {boolean} true if disabled
   */
  acl: function(stateData, componentProps) {
    return hasInvalidName("network_acls", stateData.name, componentProps)
      .invalid;
  },

  /**
   * disable appid save
   * checks for valid name and resource group
   * @param {Object} stateData
   * @param {boolean} stateData.use_appid
   * @param {string} stateData.resource_group
   * @param {boolean} stateData.use_data
   * @param {string} stateData.name
   * @returns {boolean} true if disabled
   */
  appid: function(stateData, componentProps) {
    return nameAndRgTest(
      "appid",
      stateData.name,
      stateData.resource_group,
      componentProps,
      stateData.use_data
    );
  },

  /**
   * disable bucket save
   * checks for valid name & encryption key
   * @param {Object} stateData
   * @param {string} stateData.name bucket name
   * @param {string} stateData.kms_key encryption key
   * @param {Object} componentProps
   * @param {Object} componentProps.slz slz state store
   * @param {slzStateStore} componentProps.slz.store slz store
   * @param {Array<string>} componentProps.slz.store.cosBuckets list of cos buckets
   * @param {Object} componentProps
   * @param {Object} componentProps.data
   * @param {string} componentProps.data.name bucket old name before update
   * @returns {boolean} true if disabled
   */
  buckets: function(stateData, componentProps) {
    return (
      hasInvalidName("buckets", stateData.name, componentProps).invalid ||
      hasInvalidEncryptionKey(stateData.kms_key, componentProps)
    );
  },

  /**
   * disable cos
   * checks for valid name and resource group
   * @param {Object} stateData
   * @param {string} stateData.name new cos name
   * @param {string} stateData.resource_group
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.cos
   * @returns {boolean} true if disabled
   */
  cos: function(stateData, componentProps) {
    return nameAndRgTest(
      "cos",
      stateData.name,
      stateData.resource_group,
      componentProps,
      stateData.useData
    );
  },

  /**
   * disable cos
   * checks for valid name
   * @param {Object} stateData state data
   * @param {string} stateData.name name of instance
   * @param {Object} componentProps component props
   * @returns {boolean} true if disabled
   */
  cos_keys: function(stateData, componentProps) {
    return hasInvalidName("cos_keys", stateData.name, componentProps).invalid;
  },

  /**
   * disable cluster save
   * checks valid name and resource group
   * checks number of workers based off of kube_type
   * checks if encryption keys are valid
   * checks that kubernetes type is selected
   * checks that a subnet is selected
   * @param {Object} stateData
   * @param {Object} stateData.cluster
   * @param {string} stateData.cluster.name
   * @param {string} stateData.cluster.kube_type
   * @param {string} stateData.cluster.cos_name
   * @param {string} stateData.cluster.resource_group
   * @param {string} stateData.cluster.vpc_name
   * @param {Array<string>} stateData.cluster.subnet_names
   * @param {Array<string>} stateData.cluster.subnets
   * @param {number} stateData.cluster.workers_per_subnet
   * @param {Object} componentProps
   * @param {Object} componentProps.cluster
   * @param {string} componentProps.cluster.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.clusters
   */
  clusters: function(stateData, componentProps) {
    let cluster = stateData.cluster;
    if (
      cluster.kube_type === "openshift" &&
      cluster.cos_name.match(nameValidationExp) === null
    ) {
      return true;
    } else if (hasInvalidWorkers(stateData).invalid) {
      return true;
    } else {
      return (
        nameRgAndVpcTest(
          "clusters",
          cluster.name,
          cluster.resource_group,
          cluster.vpc_name,
          componentProps
        ) ||
        hasInvalidEncryptionKey(cluster.kms_config.crk_name, componentProps) ||
        cluster.subnet_names.length === 0 ||
        cluster.kube_type === ""
      );
    }
  },

  /**
   * disable kms save
   * checks that name and resource group are valid
   * @param {Object} stateData
   * @param {boolean} stateData.useData
   * @param {string} stateData.name
   * @param {string} stateData.resource_group
   * @returns {boolean} true if disabled
   */
  key_management: function(stateData, componentProps) {
    return nameAndRgTest(
      "key_management",
      stateData.name,
      stateData.resource_group,
      componentProps,
      stateData.useData
    );
  },

  /**
   * disable encryption keys
   * checks if name is valid
   * @param {Object} stateData
   * @param {string} stateData.name
   * @param {Object} componentProps
   * @param {Object} componentProps.data
   * @param {string} componentProps.data.name old name
   * @param {Object} componentProps.slz slz state store
   * @param {slzStateStore} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Object} componentProps.slz.store.configDotJson.key_management
   * @param {Array<Object>} componentProps.slz.store.configDotJson.key_management.keys
   * @returns {boolean} true if disabled
   */
  kms_key: function(stateData, componentProps) {
    return hasInvalidName("kms_key", stateData.name, componentProps).invalid;
  },

  /**
   * disable networking rule save
   * checks if rule data is valid
   * checks valid name
   * checks if source/dest are valid cidr
   * @param {Object} stateData
   * @param {string} stateData.name
   * @param {Object} stateData.rule
   * @param {string} stateData.ruleProtocol
   * @param {string} stateData.source
   * @param {string} stateData.destination
   * @param {Object} componentProps
   * @param {boolean=} componentProps.isSecurityGroup
   * @returns {boolean} true if disabled
   */
  networking_rule: function(stateData, componentProps) {
    if (
      validateRuleData(
        stateData.rule,
        stateData.ruleProtocol === "icmp",
        componentProps.isSecurityGroup || false
      ) === true
    ) {
      return (
        hasInvalidName("networking_rule", stateData.name, componentProps)
          .invalid ||
        validIpCidr(stateData.source) === false ||
        (componentProps.isAclForm &&
        validIpCidr(stateData.destination) === false
          ? true
          : false)
      );
    } else {
      return true;
    }
  },

  /**
   * disable resource group
   * checks for valid name
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.create
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.resource_groups
   * @returns {boolean} true if disabled
   */
  resource_groups: function(stateData, componentProps) {
    return hasInvalidName(
      "resource_groups",
      stateData.name,
      componentProps,
      stateData.create === false || stateData.use_prefix === false
    ).invalid;
  },

  /**
   * disable security group
   * checks for valid name, rg, and vpc
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.resource_group
   * @param {string} stateData.vpc_name
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.security_groups
   * @returns {boolean} true if disabled
   */
  security_groups: function(stateData, componentProps) {
    return nameRgAndVpcTest(
      "security_groups",
      stateData.name,
      stateData.resource_group,
      stateData.vpc_name,
      componentProps
    );
  },

  /**
   * disable secrets manager save
   * checks for valid name and resource group
   * checks for valid encryption key
   * @param {Object} stateData
   * @param {boolean} stateData.use_secrets_manager
   * @param {string} stateData.name
   * @param {string} stateData.resource_group
   * @param {string} stateData.kms_key_name
   * @returns {boolean} true if disabled
   */
  secrets_manager: function(stateData, componentProps) {
    if (stateData.use_secrets_manager === true) {
      return (
        nameAndRgTest(
          "secrets_manager",
          stateData.name,
          stateData.resource_group,
          componentProps
        ) || hasInvalidEncryptionKey(stateData.kms_key_name, componentProps)
      );
    } else {
      return false;
    }
  },

  /**
   * disable ssh keys
   * checks for valid resource group and name
   * checks for valid ssh public key
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.resource_group
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.ssh_keys
   * @returns {boolean} true if disabled
   */
  ssh_keys: function(stateData, componentProps) {
    if (hasInvalidSshPublicKey(stateData, componentProps).invalid) {
      return true;
    } else {
      return nameAndRgTest(
        "ssh_keys",
        stateData.name,
        stateData.resource_group,
        componentProps
      );
    }
  },

  /**
   * disable subnet tiers
   * checks that a network acl is selected
   * checks for a valid name
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.networkAcl
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {string} componentProps.slz.store.edge_vpc_prefix
   * @param {Object} componentProps.slz.store.subnetTiers
   * @returns {boolean} true if disabled
   */
  subnet_tiers: function(stateData, componentProps) {
    if (stateData.networkAcl === "") return true;
    return hasInvalidName("subnetTiers", stateData.name, componentProps)
      .invalid;
  },

  /**
   * check able to submit teleport config
   * checks for a valid cos bucket
   * checks for valid cos / app id keys
   * checks that hostname is valid length
   * @param {Object} stateData
   * @param {Object} stateData.teleport_config
   * @param {string} stateData.teleport_config.cos_bucket_name
   * @param {string} stateData.teleport_config.cos_key_name
   * @param {string} stateData.teleport_config.app_id_key_name
   * @param {string} stateData.teleport_config.hostname
   * @param {Array<string>} stateData.keys
   * @param {Object} componentProps
   * @returns {boolean} true if disabled
   */
  teleport_config: function(stateData, componentProps) {
    let invalidBucket = hasInvalidCosBucket(
      stateData.teleport_config.cos_bucket_name,
      componentProps
    );
    if (
      invalidBucket ||
      checkNullorEmptyString(stateData.teleport_config.cos_key_name)
    ) {
      return true;
    } else if (
      checkNullorEmptyString(stateData.teleport_config.app_id_key_name)
    ) {
      return true;
    } else {
      return minStringSize(stateData.teleport_config.hostname || "") === false;
    }
  },

  /**
   * validate claim to roles
   * checks that email is valid
   * checks roles are valid
   * @param {*} stateData
   * @param {string} stateData.email
   * @param {Array} stateData.roles
   */
  claims_to_roles: function(stateData) {
    return (
      stateData.email.match(emailValidationExp) === null ||
      stateData.roles.length === 0 ||
      stateData.roles[0].length < 6
    );
  },

  /**
   * vpc disable save
   * checks that no other vpcs have classic access
   * checks if vpc name and resource group are valid
   * checks if default vpc fields are valid
   * @param {Object} stateData
   * @param {Object} stateData.prefix
   * @param {boolean} stateData.classic_access
   * @param {string} stateData.flow_logs_bucket_name
   * @param {string} stateData.resource_group
   * @param {Object} componentProps
   * @param {Object} componentProps.data
   * @param {string} componentProps.data.prefix old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Array<string>} componentProps.slz.store.vpcList
   * @returns {boolean} true if disabled
   */
  vpcs: function(stateData, componentProps) {
    let classicAccessVpcs = splat(
      componentProps.slz.store.configDotJson.vpcs,
      "classic_access"
    );
    if (
      (contains(classicAccessVpcs, true) &&
        stateData.classic_access === true &&
        componentProps.data.classic_access === false) ||
      stateData.flow_logs_bucket_name === null
    ) {
      return true;
    } else {
      if (vpcNameFieldsCheck(stateData, componentProps)) return true;
      else
        return (
          nameAndRgTest(
            "vpcs",
            stateData.prefix,
            stateData.resource_group,
            componentProps
          ) ||
          hasInvalidCosBucket(stateData.flow_logs_bucket_name, componentProps)
        );
    }
  },

  /**
   * vpe disable save
   * checks that a vpc is selected
   * checks name and resource group are valid
   * @param {Object} stateData
   * @param {Object} stateData.vpe
   * @param {Object} stateData.vpcData
   * @param {Object} componentProps
   * @param {Object} componentProps.vpe
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Array<string>} componentProps.slz.store.vpcList
   * @returns {boolean} true if disabled
   */
  virtual_private_endpoints: function(stateData, componentProps) {
    if (stateData.vpe.vpcs.length === 0) {
      return true;
    }
    let emptySubnetFieldVpcs = [];
    eachKey(stateData.vpcData, key => {
      if (
        stateData.vpcData[key].subnets.length === 0 ||
        stateData.vpcData[key].security_group_name === null
      ) {
        emptySubnetFieldVpcs.push(key);
      }
    });
    if (emptySubnetFieldVpcs.length === 0) {
      return nameAndRgTest(
        "virtual_private_endpoints",
        stateData.vpe.service_name,
        stateData.vpe.resource_group,
        componentProps
      );
    } else {
      return true;
    }
  },

  /**
   * disable vpn_gateways
   * checks that name, rg, and vpc are valid
   * checks that a subnet is selected
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.resource_group
   * @param {string} stateData.vpc_name
   * @param {string} stateData.subnet_name
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.vpn_gateways
   * @returns {boolean} true if disabled
   */
  vpn_gateways: function(stateData, componentProps) {
    return (
      nameRgAndVpcTest(
        "vpn_gateways",
        stateData.name,
        stateData.resource_group,
        stateData.vpc_name,
        componentProps
      ) || checkNullorEmptyString(stateData.subnet_name)
    );
  },

  /**
   * disable vsi
   * checks that security group name is valid
   * checks that there is a subnet selected if teleport vsi
   * checks that an ssh key is selected
   * checks if name, rg, and vpc are valid
   * checks if encryption key is valid
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {string} stateData.resource_group
   * @param {Object} stateData.security_group
   * @param {string} stateData.security_group.name
   * @param {Array} stateData.subnet_names
   * @param {string} stateData.subnet_name
   * @param {Array} stateData.ssh_keys
   * @param {Number} stateData.vsi_per_subnet
   * @param {string} stateData.boot_volume_encryption_key_name
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {boolean} componentProps.isTeleport
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.vsi
   * @returns {boolean} true if disabled
   */
  vsi: function(stateData, componentProps) {
    if (
      stateData.security_group &&
      hasInvalidName(
        "security_groups",
        stateData.security_group.name,
        componentProps
      ).invalid
    ) {
      return true;
    } else if (
      !componentProps.isTeleport &&
      stateData.subnet_names.length === 0
    ) {
      return true;
    } else if (stateData.subnet_name === "" && componentProps.isTeleport) {
      return true;
    } else {
      let vsiIsInvalid =
        stateData.ssh_keys.length === 0 || stateData.vsi_per_subnet === 0;

      return (
        nameRgAndVpcTest(
          "vsi",
          stateData.name,
          stateData.resource_group,
          stateData.vpc_name,
          componentProps
        ) ||
        hasInvalidEncryptionKey(
          stateData.boot_volume_encryption_key_name,
          componentProps
        ) ||
        vsiIsInvalid
      );
    }
  },

  /**
   * tests if f5 vsi should be disabled
   * checks if ssh key is selected
   * @param {Object} stateData
   * @param {string} stateData.name new name
   * @param {Array} stateData.ssh_keys
   * @param {Object} componentProps
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @param {Array<Object>} componentProps.slz.store.configDotJson.vsi
   * @returns {boolean} true if disabled
   */
  f5_vsi: function(stateData) {
    return stateData.ssh_keys.length === 0;
  },
  f5_vsi_config: function(stateData) {
    return stateData.ssh_keys.length === 0;
  },

  /**
   * worker pool disable save
   * checks if name is valid and worker pool has a subnet
   * @param {Object} stateData
   * @param {Object} stateData.pool
   * @param {string} stateData.pool.name
   * @param {Array} stateData.pool.subnet_names
   * @param {string} stateData.pool.flavor
   * @param {Object} componentProps
   * @param {string} componentProps.arrayParentName
   * @param {Object} componentProps.data
   * @param {string} componentProps.data.name old name
   * @param {slzStateStore} componentProps.slz slz state store
   * @param {Object} componentProps.slz.store slz store
   * @param {Object} componentProps.slz.store.configDotJson
   * @returns {boolean} true if disabled
   */
  worker_pools: function(stateData, componentProps) {
    return (
      hasInvalidName("worker_pools", stateData.pool.name, componentProps)
        .invalid ||
      stateData.pool.subnet_names.length === 0 ||
      !minStringSize(stateData.pool.flavor)
    );
  },

  /**
   * disable transit gateway
   * checks if resource group is valid
   * checks if transit gateway has connections
   * @param {Object} stateData
   * @param {boolean} stateData.enable_transit_gateway
   * @param {string} stateData.transit_gateway_resource_group
   * @param {Array} stateData.transit_gateway_connections
   * @param {Object} componentProps
   * @returns {boolean} true if disabled
   */
  transit_gateway: function(stateData, componentProps) {
    if (stateData.enable_transit_gateway === false) {
      return false;
    }
    if (
      hasInvalidResourceGroup(
        stateData.transit_gateway_resource_group,
        componentProps
      )
    ) {
      return true;
    } else return isEmpty(stateData.transit_gateway_connections);
  },

  /**
   * disable atracker
   * checks if resource group is invalid
   * checks if cos bucket is invalid
   * checks if atracker has a key
   * @param {Object} stateData
   * @param {string} stateData.resource_group
   * @param {string} stateData.collector_bucket_name
   * @param {string} stateData.atracker_key
   * @param {Object} componentProps
   * @returns {boolean} true if disabled
   */
  atracker: function(stateData, componentProps) {
    return (
      hasInvalidResourceGroup(stateData.resource_group, componentProps) ||
      hasInvalidCosBucket(stateData.collector_bucket_name, componentProps) ||
      checkNullorEmptyString(stateData.atracker_key)
    );
  },

  /**
   * f5 template data disable
   * validates optional/non optional f5 fields
   * depending on license type
   * @param {Object} stateData
   * @param {string} stateData.license_type
   * @param {string} stateData.tmos_admin_password
   * @param {string} stateData.template_version
   * @param {string} stateData.template_source
   * @param {string} stateData.byol_license_basekey
   * @param {string} stateData.license_username
   * @param {string} stateData.license_host
   * @param {string} stateData.license_pool
   * @param {string} stateData.license_unit_of_measure
   * @param {string} stateData.license_sku_keyword_1
   * @param {string} stateData.license_sku_keyword_2
   * @param {string} stateData.phone_home_url
   * @param {string} stateData.do_declaration_url
   * @param {string} stateData.as3_declaration_url
   * @param {string} stateData.ts_declaration_url
   * @param {string} stateData.tgstandby_url
   * @param {string} stateData.tgrefresh_url
   * @param {string} stateData.tgactive_url
   * @returns {boolean} true if disabled
   */
  f5_template_data: function(stateData) {
    let invalid = [];
    function isValid(field) {
      if (
        (field === "license_type" &&
          f5fields.license_types.includes(stateData[field])) ||
        (field === "tmos_admin_password" &&
          validTmosAdminPassword(stateData[field])) ||
        (f5fields.urls.includes(field) && validUrl(stateData[field])) ||
        f5fields.license_fields.includes(field)
      ) {
        return true;
      } else return false;
    }
    eachKey(stateData, field => {
      if (
        // license password is the only conditional field that is not required
        ["license_type", "template_version", "template_source"]
          .concat(f5fields.conditional_fields[stateData.license_type])
          .includes(field) &&
        field !== "license_password"
      ) {
        /* required fields: disable when null/empty or invalid */
        if (checkNullorEmptyString(stateData[field]) || !isValid(field)) {
          invalid.push(field);
        }
      } else if (
        /* optional fields: disable when not null/empty and invalid */
        /* non-required conditional fields: do not affect save */
        flatten(Object.values(f5fields.conditional_fields)).includes(field) ===
          false &&
        !(
          checkNullorEmptyString(stateData[field]) ||
          stateData[field] === "null"
        ) &&
        !isValid(field)
      ) {
        invalid.push(field);
      }
    });

    return isEmpty(invalid) === false;
  },

  /**
   * iam account settings enable
   * checks if number inputs (if match, max sessions) are invalid
   * checks if session invalidation and expiration are in range
   * checks if the IP addresses are a valid string of IP addresses
   * @param {Object} stateData
   * @param {string} stateData.if_match
   * @param {string} stateData.max_sessions_per_identity
   * @param {string} stateData.session_invalidation_in_seconds
   * @param {string} stateData.session_expiration_in_seconds
   * @param {string} stateData.allowed_ip_addresses
   * @param {Object} componentProps
   * @returns {boolean} true if disabled
   */
  iam_account_settings: function(stateData) {
    return (
      iamAccountSettingsInvalidNumber(stateData.if_match).invalid ||
      iamAccountSettingsInvalidNumber(stateData.max_sessions_per_identity)
        .invalid ||
      iamAccountSettingsInvalidRange(
        stateData.session_invalidation_in_seconds,
        900,
        7200
      ).invalid ||
      iamAccountSettingsInvalidRange(
        stateData.session_expiration_in_seconds,
        900,
        86400
      ).invalid ||
      iamAccountSettingsInvalidIpString(stateData.allowed_ip_addresses).invalid
    );
  }
};

/**
 * disable save for a component
 * @param {string} componentName component name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if disabled
 */
function disableSave(componentName, stateData, componentProps) {
  return disableSaveFunctions[
    componentName === "teleport_vsi" ? "vsi" : componentName
  ](stateData, componentProps, componentName === "teleport_vsi");
}

export { disableSave };
