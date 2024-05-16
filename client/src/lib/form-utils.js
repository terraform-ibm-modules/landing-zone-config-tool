import {
  contains,
  distinct,
  splat,
  allFieldsNull,
  transpose,
  getObjectFromArray,
  flatten,
  revision,
  arraySplatIndex,
  splatContains,
  prettyJSON,
  eachZone,
  parseIntFromZone,
  numberToZoneList
} from "lazy-z";
import { buildSubnet } from "./builders.js";
import {
  reservedSubnetNameExp,
  maskFieldsExpStep1ReplacePublicKey,
  maskFieldsExpStep2ReplaceTmosAdminPassword,
  maskFieldsExpStep3ReplaceLicensePassword,
  maskFieldsExpStep4HideValue
} from "./constants.js";
import {
  hasInvalidEncryptionKey,
  hasInvalidResourceGroup,
  hasInvalidVpc
} from "./error-text-utils.js";
import {
  validSshKey,
  validName,
  subnetTierHasValueFromSubnets,
  getTierSubnetsFromVpcData
} from "./lib-utils.js";
import { propsMatchState } from "./props-match-state.js";

/**
 * add margin bottom to subform chevron
 * @param {*} componentProps
 * @returns {string} additional classNames
 */
function toggleMarginBottom(hide) {
  if (hide === false) return " marginBottomSmall";
  else return "";
}

/**
 * create classname for sub form chevron save button
 * @param {*} componentProps
 * @returns {string} classNames for button
 */
function saveChangeButtonClass(componentProps) {
  let className = "forceTertiaryButtonStyles";
  if (componentProps.noDeleteButton !== true) className += " marginRightSmall";
  if (componentProps.disabled !== true) className += " tertiaryButtonColors";
  return className;
}

/**
 * check if use appid
 * @param {*} componentProps
 * @returns {boolean} true if using
 */
function appIdIsDisabled(componentProps) {
  return componentProps.slz.store.configDotJson.appid.use_appid === false;
}

/**
 * show non toggle array form
 * depending on the submission field name the code looks determines if the form should be open based on the data passed by componentProps
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should show
 */
function forceShowForm(stateData, componentProps) {
  if (componentProps.submissionFieldName === "key_management") {
    return (
      componentProps.slz.store.configDotJson.key_management.resource_group ===
      null
    );
  } else if (componentProps.submissionFieldName === "transit_gateway") {
    return (
      componentProps.slz.store.configDotJson.transit_gateway_resource_group ===
      null
    );
  } else if (componentProps.submissionFieldName === "atracker") {
    return (
      componentProps.slz.store.configDotJson.atracker.resource_group === null ||
      componentProps.slz.store.configDotJson.atracker.collector_bucket_name ===
        null ||
      componentProps.slz.store.atrackerKey === null
    );
  } else if (
    contains(
      [
        "cos",
        "vpcs",
        "security_groups",
        "virtual_private_endpoints",
        "ssh_keys",
        "vsi",
        "clusters",
        "buckets",
        "vpn_gateways"
      ],
      componentProps.submissionFieldName
    )
  ) {
    let invalidRg = hasInvalidResourceGroup(
      componentProps.data.resource_group,
      componentProps
    );
    let invalidVpc = hasInvalidVpc(
      componentProps.data.vpc_name,
      componentProps
    );

    if (componentProps.submissionFieldName == "cos") {
      return invalidRg;
    } else if (componentProps.submissionFieldName === "buckets") {
      return hasInvalidEncryptionKey(
        componentProps.data.kms_key,
        componentProps
      );
    } else if (componentProps.submissionFieldName === "vpcs") {
      return componentProps.innerForm.name === "VpcNaclForm"
        ? false
        : invalidRg || componentProps.data.flow_logs_bucket_name === null;
    } else if (componentProps.submissionFieldName === "security_groups") {
      return invalidRg || invalidVpc;
    } else if (
      componentProps.submissionFieldName === "virtual_private_endpoints"
    ) {
      return invalidRg;
    } else if (componentProps.submissionFieldName === "ssh_keys") {
      return invalidRg || !validSshKey(componentProps.data.public_key);
    } else if (componentProps.submissionFieldName === "vsi") {
      return (
        invalidRg || invalidVpc || componentProps.data.ssh_keys.length === 0
      );
    } else if (componentProps.submissionFieldName === "clusters") {
      return (
        invalidRg ||
        hasInvalidEncryptionKey(
          componentProps.data.kms_config.crk_name,
          componentProps
        ) ||
        !validName(componentProps.data.cos_name) ||
        invalidVpc
      );
    } else {
      // last else is for vpn gateway
      return invalidRg || invalidVpc;
    }
  } else if (!appIdIsDisabled(componentProps)) {
    return componentProps.slz.store.configDotJson.appid.resource_group === null;
  } else if (componentProps.submissionFieldName === "teleport_config") {
    return appIdIsDisabled(componentProps);
  } else return stateData.show;
}

/**
 * get name from props for toggle form
 * @param {*} componentProps
 * @returns {string} component name for toggle form
 */
function toggleFormComponentName(componentProps) {
  if (componentProps.addText === "Create a VPC") {
    return componentProps.data.prefix;
  } else if (
    componentProps.addText === "Create a Network Access Control List"
  ) {
    return componentProps.data.prefix + " VPC";
  } else if (componentProps.addText === "Create a virtual private endpoint") {
    return componentProps.data.service_name;
  } else if (componentProps.addText === "Create a Claim to Roles") {
    return componentProps.data.email;
  } else {
    return componentProps.data.name;
  }
}

/**
 * disable delete message for components
 * @param {*} componentProps
 * @returns {string} message or false
 */
function disableDeleteMessage(componentProps) {
  if (componentProps.submissionFieldName === "ssh_keys") {
    return "Cannot delete SSH Key. This key is currently used by virtual servers.";
  } else if (componentProps.addText === "Create a VPC") {
    return "Cannot delete VPC. At least one VPC is required";
  } else if (componentProps.submissionFieldName === "resource_groups") {
    return "Cannot delete resource group. At least one resource group is required";
  } else {
    return undefined;
  }
}

/**
 * should disable delete
 * @param {*} componentProps
 * @returns {boolean} true if delete should be disabled
 */
function toggleFormDeleteDisabled(componentProps) {
  if (componentProps.submissionFieldName === "ssh_keys") {
    return contains(
      distinct(
        flatten(
          splat(
            componentProps.slz.store.configDotJson.vsi.concat(
              componentProps.slz.store.configDotJson.teleport_vsi
            ),
            "ssh_keys"
          )
        )
      ),
      componentProps.data.name
    );
  } else if (
    componentProps.addText === "Create a VPC" &&
    componentProps.slz.store.configDotJson.vpcs.length === 1
  ) {
    return true;
  } else if (
    componentProps.submissionFieldName === "resource_groups" &&
    componentProps.slz.store.configDotJson.resource_groups.length === 1
  ) {
    return true;
  } else if (
    componentProps.submissionFieldName === "vsi" &&
    componentProps.readOnly
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * create a composed class name
 * @param {string} className name of classes to add
 * @param {*} props arbitrary props
 * @param {string=} props.className additional classnames
 */
function addClassName(className, props) {
  let composedClassName = className;
  if (props?.className) {
    composedClassName += " " + props.className;
    if (props.noMarginRight === true) {
      composedClassName = composedClassName.replace(/\s?marginRight\b/g, "");
    }
  }
  return composedClassName;
}

/**
 * dynamically get rule protocol
 * @param {*} rule rule object
 * @returns {string} all, tcp, icmp, or udp
 */
function getRuleProtocol(rule) {
  let protocol = "all";
  // for each possible protocol
  ["icmp", "tcp", "udp"].forEach(field => {
    // set protocol to that field if not all fields are null
    if (allFieldsNull(rule[field]) === false) {
      protocol = field;
    }
  });
  return protocol;
}

/**
 * create sub rule
 * @param {boolean} isSecurityGroup
 * @param {*} rule rule object
 * @param {string} protocol all, tcp, icmp, or udp
 * @returns {Object} default rule object
 */
function getSubRule(isSecurityGroup, rule, protocol) {
  let defaultRule = {
    port_max: null,
    port_min: null,
    source_port_max: null,
    source_port_min: null,
    type: null,
    code: null
  };
  if (isSecurityGroup) {
    delete defaultRule.source_port_min;
    delete defaultRule.source_port_max;
  }
  if (protocol !== "all") {
    transpose(rule[protocol], defaultRule);
  }
  return defaultRule;
}

// Map route to JSON key
const panelMap = {
  "/activityTracker": "atracker",
  "/objectStorage": "cos",
  "/resourceGroups": "resource_groups",
  "/vpcs": "vpcs",
  "/nacls": "network_acls",
  "/keyManagement": "key_management",
  "/sshKeys": "ssh_keys",
  "/clusters": "clusters",
  "/vsi": "vsi",
  "/transitGateway": "tgw",
  "/vpe": "virtual_private_endpoints",
  "/appID": "appid",
  "/secretsManager": "secrets_manager",
  "/securityGroups": "security_groups",
  "/vpn": "vpn_gateways",
  "/f5BigIP": "f5_vsi",
  "/teleportConfig": "teleport_config",
  "/iamAccountSettings": "iam_account_settings",
  "/accessGroups": "access_groups"
};

/**
 * create an object to display data in the codemirror window
 * @param {string} pathname pathname to render json
 * @param {Object} configDotJson json configuration object
 * @returns {Object} data to display in codemirror
 */
function getCodeMirrorDisplay(pathname, configDotJson) {
  if (pathname === "/vpcs") {
    let codeMirrorVpcs = [];
    configDotJson.vpcs.forEach(vpc => {
      let vpcView = {};
      [
        "prefix",
        "flow_logs_bucket_name",
        "classic_access",
        "default_network_acl_name",
        "default_routing_table_name",
        "default_security_group_name",
        "use_public_gateways",
        "resource_group"
      ].forEach(field => {
        vpcView[field] = vpc[field];
      });
      codeMirrorVpcs.push(vpcView);
    });
    return codeMirrorVpcs;
  } else if (pathname === "/transitGateway") {
    return {
      enable_transit_gateway: configDotJson.enable_transit_gateway,
      transit_gateway_connections: configDotJson.transit_gateway_connections,
      transit_gateway_resource_group:
        configDotJson.transit_gateway_resource_group
    };
  } else if (pathname === "/f5BigIP") {
    return {
      f5_template_data: configDotJson.f5_template_data,
      f5_vsi: configDotJson.f5_vsi
    };
  } else if (pathname === "/teleport") {
    return {
      teleport_config: configDotJson.teleport_config,
      teleport_vsi: configDotJson.teleport_vsi
    };
  } else if (pathname === "/subnets") {
    let returnObject = {};
    configDotJson.vpcs.forEach(network => {
      returnObject[network.prefix] = network.subnets;
    });
    return returnObject;
  } else if (pathname === "/nacls") {
    let returnObject = {};
    configDotJson.vpcs.forEach(network => {
      returnObject[network.prefix] = network.network_acls;
    });
    return returnObject;
  } else {
    return configDotJson[panelMap[pathname]];
  }
}

/**
 * create a composed component name based on prefix and component
 * @param {string} prefix slz prefix
 * @param {string} name component name
 * @param {Object} options arbitrary options
 * @param {boolean=} options.useData if useData is true, name will not be mutated
 * @param {string=} options.parentName parent name
 * @param {string=} options.suffix suffix
 * @returns {string} composed component name
 */
function buildComposedComponentNameHelperText(prefix, name, options) {
  let composedName = "Composed name: ";

  // if use data is true, return name unmutated
  if (options?.useData) return composedName + name;

  let parentName = "";
  let suffix = "";
  if (options?.parentName) parentName = `-${options.parentName}`;
  if (options?.suffix) suffix = `-${options.suffix}`;

  return `${composedName}${prefix}${parentName}-${name}${suffix}`;
}

/**
 * get form operators
 * @param {Object} props component props
 * @param {string} props.configDotJsonField field name
 * @param {string=} props.configDotJsonSubField get a sub field of an array
 */
function getFormCrudOperations(props) {
  let crudOps = {};
  let fieldToFunctionMap = {
    create: "onSubmit",
    save: "onSave",
    delete: "onDelete"
  };
  ["create", "save", "delete"].forEach(field => {
    crudOps[fieldToFunctionMap[field]] = props.configDotJsonSubField
      ? props.slz[props.configDotJsonField][props.configDotJsonSubField][field]
      : props.slz[props.configDotJsonField][field];
  });
  return crudOps;
}

/**
 * get array data form array form
 * @param {*} props
 * @param {slzStateStore} props.slz
 * @param {string} props.configDotJsonField
 * @param {string=} props.configDotJsonSubField
 * @param {string=} props.arrayParentName
 * @returns {Array<object>} objects to render
 */
function getSlzArrayFormArrayData(props) {
  // get config data for array
  let arrayData = props.slz.store.configDotJson[props.configDotJsonField];
  // if the component is a subfield of an array
  if (props.configDotJsonSubField && props.arrayParentName) {
    // get the data from array object
    arrayData = new revision(props.slz.store.configDotJson).child(
      props.configDotJsonField, // field name
      props.arrayParentName, // parent instance name
      props.configDotJsonField === "vpcs" ? "prefix" : "name" // lookup by name unless vpcs
    ).data[props.configDotJsonSubField];
  } else if (props.configDotJsonSubField) {
    // if it is a sub field of an object, set as data
    arrayData =
      props.slz.store.configDotJson[props.configDotJsonField][
        props.configDotJsonSubField
      ];
  }
  return arrayData;
}
/**
 * compose name from multi-word input with underscores or spaces
 * @param {string} field field name
 * @returns {string} composed field name
 */
function formatFieldName(field) {
  let splitField = field.split(/_|\s/g);
  let fieldWords = "";
  splitField.forEach(word => {
    if (fieldWords === "") {
      fieldWords += word;
    } else {
      fieldWords += " " + word;
    }
  });
  return fieldWords.replace(/vpc/g, "VPC");
}

/**
 * test if subnet should be disabled
 * @param {*} componentProps
 * @param {slzStateStore} componentProps.slz
 * @param {object} componentProps.subnet subnet object
 * @param {string} componentProps.prefix vpc prefix
 * @returns {boolean} true if gateway is not enabled
 */
function subnetGatewayToggleShouldBeDisabled(componentProps) {
  // replace everything up to `zone` in name
  let zone = componentProps.subnet.name.replace(/.+(?=zone)/g, "");
  let gatewayIsDisabled =
    new revision(componentProps.slz.store.configDotJson).child(
      "vpcs",
      componentProps.prefix,
      "prefix"
    ).data.use_public_gateways[zone] === false;
  return gatewayIsDisabled;
}

/**
 * test if all gateways in a vpc are disabled for subnet tier
 * @param {*} componentProps
 * @param {slzStateStore} componentProps.slz
 * @param {string} componentProps.vpc_name vpc prefix
 */
function subnetTierVpcHasNoEnabledGateways(componentProps) {
  let gateways = new revision(componentProps.slz.store.configDotJson).child(
    "vpcs",
    componentProps.vpc_name,
    "prefix"
  ).data.use_public_gateways;
  let allFalse = true;
  eachZone(3, zone => {
    if (gateways[zone]) allFalse = false;
  });
  return allFalse;
}

/**
 * cos key and bucket parent has random suffix
 * @param {*} componentProps
 * @returns
 */
function parentHasRandomSuffix(componentProps) {
  return getObjectFromArray(
    componentProps.slz.store.configDotJson.cos,
    "name",
    componentProps.arrayParentName
  ).random_suffix;
}

/**
 * initialize subnet tier form state needs to be done in separate function
 * since there is no true state component for subnet tier
 * @param {*} componentProps
 * @param {boolean=} componentProps.hide
 * @param {boolean=} componentProps.isModal
 * @param {string=} componentProps.vpc_name
 * @param {object} componentProps.tier
 * @param {string} componentProps.tier.name
 * @param {number} componentProps.tier.zone
 * @returns subnet tier state object
 */
function subnetTierInitState(componentProps) {
  if (componentProps.isModal) {
    return {
      name: "",
      zones: 1,
      networkAcl: "",
      addPublicGateway: false,
      hide: componentProps.hide,
      showDeleteModal: false
    };
  } else {
    return {
      name: componentProps.tier.name,
      zones: componentProps.tier.zones,
      networkAcl: subnetTierHasValueFromSubnets(
        componentProps.slz,
        componentProps.vpc_name,
        componentProps.tier.name,
        "acl_name"
      ),
      addPublicGateway: subnetTierHasValueFromSubnets(
        componentProps.slz,
        componentProps.vpc_name,
        componentProps.tier.name,
        "public_gateway"
      ),
      showDeleteModal: false,
      hide: componentProps.slz.store.cheatsEnabled ? false : true
    };
  }
}

/**
 * get a list of non-reserved subnet tiers
 * @param {*} componentProps
 * @param {string} componentProps.vpc_name
 * @param {slzStateStore} componentProps.slz
 * @returns Array of subnet tiers
 */
function nonReservedSubnetTierList(componentProps) {
  if (componentProps.slz.store.f5_on_management === true) {
    // if f5 on management, return list of non-reserved names
    return componentProps.slz.store.subnetTiers[componentProps.vpc_name].filter(
      tier => {
        if (tier.name.match(reservedSubnetNameExp) === null) return true;
      }
    );
  } else {
    return [];
  }
}

/**
 * get next index for subnet tier
 * @param {*} componentProps
 * @param {slzStateStore} componentProps.slz
 * @param {string} componentProps.vpc_name
 * @returns {number} next index for tier creation
 */
function nextSubnetTierIndex(componentProps) {
  let nonReservedTiers = nonReservedSubnetTierList(componentProps);
  if (
    nonReservedTiers.length === 0 &&
    componentProps.slz.store.f5_on_management
  ) {
    return 1;
  } else if (
    componentProps.vpc_name === componentProps.slz.store.edge_vpc_prefix &&
    componentProps.slz.store.f5_on_management == true
  ) {
    return nonReservedTiers.length;
  } else {
    return componentProps.slz.store.subnetTiers[componentProps.vpc_name].length;
  }
}

/**
 * get a list of subnet created by tier for subnetTier Modal
 * @param {*} stateData
 * @param {string} stateData.name
 * @param {number} stateData.zone
 * @param {boolean} stateData.addPublicGateway
 * @param {string} stateData.networkAcl
 * @param {string} componentProps.vpc_name
 * @param {slzStateStore} componentProps.slz
 * @returns {Array} array of subnets
 */
function subnetTierModalList(stateData, componentProps) {
  let nextSubnetIndex = nextSubnetTierIndex(componentProps);
  let vpcIndex = arraySplatIndex(
    componentProps.slz.store.configDotJson.vpcs,
    "prefix",
    componentProps.vpc_name
  );
  let nextTierSubnets = [];
  numberToZoneList(stateData.zones).forEach(zone => {
    nextTierSubnets.push(
      buildSubnet(
        vpcIndex,
        stateData.name,
        nextSubnetIndex,
        stateData.networkAcl,
        parseIntFromZone(zone),
        // automatically set to false if gw not enabled in zone
        componentProps.slz.store.configDotJson.vpcs[vpcIndex]
          .use_public_gateways[zone] === false
          ? false
          : stateData.addPublicGateway,
        // is edge vpc
        componentProps.vpc_name === componentProps.slz.store.edge_vpc_prefix &&
          !componentProps.slz.store.f5_on_management
      )
    );
  });
  return nextTierSubnets;
}

/**
 * get a list of subnet created by tier for subnetTier form
 * @param {*} stateData
 * @param {string} stateData.name
 * @param {number} stateData.zone
 * @param {boolean} stateData.addPublicGateway
 * @param {string} stateData.networkAcl
 * @param {string} componentProps.vpc_name
 * @param {slzStateStore} componentProps.slz
 * @returns {Array} array of subnets
 */
function subnetTierFormList(stateData, componentProps) {
  let vpcIndex = arraySplatIndex(
    componentProps.slz.store.configDotJson.vpcs,
    "prefix",
    componentProps.vpc_name
  );
  let vpcData = getTierSubnetsFromVpcData(
    componentProps.slz.store.configDotJson.vpcs[vpcIndex],
    componentProps.tier.name
  );
  let nextTierSubnets = [];
  let propsMatch = propsMatchState("subnetTiers", stateData, componentProps);
  // for each subnet
  vpcData.forEach(subnet => {
    if (propsMatch) {
      // add subnet if props match
      nextTierSubnets.push(subnet);
    } else {
      // otherwise add subnets that only have zone <= tier zones
      let zone = parseIntFromZone(subnet.name);
      if (zone <= stateData.zones) nextTierSubnets.push(subnet);
    }
  });
  // if props don't match
  if (!propsMatch) {
    // while next subnets length is less than zones
    while (nextTierSubnets.length < stateData.zones) {
      nextTierSubnets.push(
        // add a new subnty
        buildSubnet(
          vpcIndex,
          componentProps.tier.name,
          splat(
            // tier index
            componentProps.slz.store.subnetTiers[componentProps.vpc_name],
            "name"
          ).indexOf(componentProps.tier.name),
          stateData.networkAcl,
          nextTierSubnets.length + 1,
          // if no gw in zone, set to false
          componentProps.slz.store.configDotJson.vpcs[vpcIndex]
            .use_public_gateways[`zone-${nextTierSubnets.length + 1}`] === false
            ? false
            : stateData.addPublicGateway,
          // is edge vpc
          componentProps.vpc_name ===
            componentProps.slz.store.edge_vpc_prefix &&
            !componentProps.slz.store.f5_on_management
        )
      );
    }
  }
  return nextTierSubnets;
}

/**
 * create subnet tier name for title on subnet form
 * @param {string} tierName
 * @returns {string} composed name
 */
function subnetTierName(tierName) {
  if (contains(["vsi", "vpe", "vpn", "vpn-1", "vpn-2"], tierName)) {
    return tierName.toUpperCase() + " subnet tier";
  } else if (tierName === "") {
    return "New subnet tier";
  } else {
    return tierName + " subnet tier";
  }
}

/**
 * get cos keys list from slz data using cos bucket name
 * use in teleport config
 * @param {*} stateData state data
 * @param {*} componentProps props
 * @returns {Array<string>} list of cos keys
 */
function getCosKeysFromBucket(stateData, componentProps) {
  let bucket = stateData.teleport_config.cos_bucket_name;
  let keys = [];
  componentProps.slz.store.configDotJson.cos.forEach(instance => {
    if (splatContains(instance.buckets, "name", bucket)) {
      keys = splat(instance.keys, "name");
    }
  });
  return keys;
}

/**
 * get cos instance name from slz data using bucket name
 * use in teleport config
 * @param {*} stateData state data
 * @param {*} componentProps props
 * @returns {string} cos key name
 */
function getBucketInstance(bucket, componentProps) {
  let cosInstanceName = "";
  componentProps.slz.store.configDotJson.cos.forEach(instance => {
    if (splatContains(instance.buckets, "name", bucket)) {
      cosInstanceName = instance.name;
    }
  });
  return cosInstanceName;
}

/**
 * get pathname and state data to determine the value for CodeMirror
 * @param {*} pathname window.location.pathname
 * @param {*} stateData state data
 */
function codeMirrorJson(pathname, stateData) {
  return pathname === "/home"
    ? "" // prevent replace undefined value
    : prettyJSON(
        getCodeMirrorDisplay(pathname, stateData.store.configDotJson) || {}
      )
        .replace(maskFieldsExpStep1ReplacePublicKey, "public_key%%%%")
        .replace(
          maskFieldsExpStep2ReplaceTmosAdminPassword,
          stateData.store.configDotJson.f5_template_data.tmos_admin_password
            ? "tmos_admin_password%%%%"
            : "tmos_admin_password"
        )
        .replace(
          maskFieldsExpStep3ReplaceLicensePassword,
          stateData.store.configDotJson.f5_template_data.license_password !==
            "null"
            ? "license_password%%%%"
            : "license_password"
        )
        .replace(
          maskFieldsExpStep4HideValue,
          '": "****************************'
        );
}

export {
  toggleMarginBottom,
  saveChangeButtonClass,
  forceShowForm,
  toggleFormComponentName,
  disableDeleteMessage,
  toggleFormDeleteDisabled,
  addClassName,
  getRuleProtocol,
  getSubRule,
  getCodeMirrorDisplay,
  getTierSubnetsFromVpcData,
  buildComposedComponentNameHelperText,
  getFormCrudOperations,
  getSlzArrayFormArrayData,
  formatFieldName,
  subnetGatewayToggleShouldBeDisabled,
  subnetTierVpcHasNoEnabledGateways,
  parentHasRandomSuffix,
  subnetTierInitState,
  nonReservedSubnetTierList,
  nextSubnetTierIndex,
  subnetTierModalList,
  subnetTierFormList,
  subnetTierName,
  getCosKeysFromBucket,
  getBucketInstance,
  codeMirrorJson
};
