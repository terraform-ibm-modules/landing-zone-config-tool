import {
  contains,
  isIpv4CidrOrAddress,
  isWholeNumber,
  validPortRange,
  isInRange
} from "lazy-z";
import {
  reservedSubnetNameExp,
  commaSeparatedIpListExp,
  nameValidationExp,
} from "./constants.js";
import {
  validName,
  getAllNames,
  duplicateCheck,
  isNotNullOrEmptyString,
  validSshKey
} from "./lib-utils.js";
const nonArrayForms = ["key_management", "appid", "secrets_manager"];

/**
 * check to see if a component has a valid name
 * @param {string} componentName ex: resource_groups
 * @param {string} value name value. ex: management-rg
 * @param {*} componentProps component props
 * @param {boolean=} useData get resource grom data
 * @returns {Object} boolean invalid and text invalidText
 */
function hasInvalidName(componentName, value, componentProps, useData) {
  let returnData = {
    invalidText: `Invalid name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/`
  };

  // if using data, send only no name provided
  if (useData) {
    returnData.invalid = value.length === 0;
    returnData.invalidText = `Invalid name. No name provided.`;
  } else {
    returnData.invalid =
      validName(value) === false || value.match(/[A-Z]{2,}/g) !== null; // fix edge case where all caps string matches
  }

  // if not array form, check for duplicate names
  if (returnData.invalid !== true && !contains(nonArrayForms, componentName)) {
    returnData.invalid = hasDuplicateName(componentName, value, componentProps);
    if (returnData.invalid)
      returnData.invalidText = `Name ${value} already in use.`;
  }

  // for subnet tiers check if reserved
  if (
    componentName === "subnetTiers" &&
    returnData.invalid !== true && // if rule not already invalid
    value.match(reservedSubnetNameExp) !== null && // the name is reserved
    componentProps.vpc_name !== componentProps.slz.store.edge_vpc_prefix // and the vpc is not the edge vpc
  ) {
    returnData.invalid = true;
    returnData.invalidText = `Subnet tier name ${value} is reserved.`;
  }

  if (useData && value.match(/[^\-_\s\d\w]/i)) {
    returnData.invalidText = "Invalid name";
    returnData.invalid = true;
  }
  return returnData;
}

/**
 * test function for duplicate name
 * @param {string} componentName name of component
 * @param {string} value string value for name
 * @param {*} componentProps props
 * @returns {Object} string invalidText boolean invalid
 */
function hasDuplicateName(componentName, value, componentProps) {
  let names = getAllNames(componentName, componentProps);
  let resourceName = "";
  // if vpc and not modal
  if (componentProps.data && componentName === "vpcs")
    resourceName = componentProps.data.prefix;
  // if networking rule
  else if (componentProps.data && componentName === "networking_rule")
    resourceName = componentProps.data.name;
  // if subnet tier
  else if (componentName === "subnetTiers")
    resourceName = componentProps.tier.name;
  // if vpe
  else if (componentName === "virtual_private_endpoints")
    resourceName = componentProps.data.service_name;
  // if vsi sg
  else if (
    componentName === "security_groups" &&
    (componentProps.addText === "Create a Virtual Server Instance Deployment" ||
      componentProps.isTeleport)
  ) {
    resourceName = componentProps.data.security_group?.name || "";
  } else if (componentName === "default_routing_table_name")
    resourceName = componentProps.default_routing_table_name;
  // if resource data provided otherwise
  else if (componentProps.data) resourceName = componentProps.data.name;
  return duplicateCheck(names, resourceName, value);
}

/**
 * invalid from field from store list
 * @param {string} field name of the field
 * @param {string} value
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidFromStoreList(field, value, componentProps) {
  return contains(componentProps.slz.store[field], value) === false;
}

/**
 * check if a resource has an invalid resource group
 * @param {string} value name value. ex: management-rg
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 **/
function hasInvalidResourceGroup(value, componentProps) {
  return invalidFromStoreList("resourceGroups", value, componentProps);
}

/**
 * check if a resource has an invalid vpc name
 * @param {string} value name value
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 **/
function hasInvalidVpc(value, componentProps) {
  return invalidFromStoreList("vpcList", value, componentProps);
}

/**
 * check if a resource has an invalid encryption key name
 * @param {string} value name value
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 **/
function hasInvalidEncryptionKey(value, componentProps) {
  return invalidFromStoreList("encryptionKeys", value, componentProps);
}

/**
 * check if a resource has an invalid cos bucket
 * @param {string} value name value
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 **/
function hasInvalidCosBucket(value, componentProps) {
  return invalidFromStoreList("cosBuckets", value, componentProps);
}

/**
 * check vpc valid
 * @param {string} field name to check
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object} invalid boolean invalidText string
 */
function vpcFieldCheck(field, stateData, componentProps) {
  let secondaryInvalidNames;
  if (isNotNullOrEmptyString(stateData[field])) {
    if (field === "default_network_acl_name") {
      secondaryInvalidNames = hasInvalidName("network_acls", stateData[field], {
        arrayParentName: componentProps.data.prefix,
        slz: componentProps.slz
      });
    } else if (field === "default_security_group_name") {
      secondaryInvalidNames = hasInvalidName(
        "security_groups",
        stateData[field],
        {
          slz: componentProps.slz,
          data: {
            name: ""
          }
        }
      );
    } else {
      secondaryInvalidNames = hasInvalidName(
        "default_routing_table_name",
        stateData[field],
        {
          default_routing_table_name:
            componentProps.data.default_routing_table_name,
          slz: componentProps.slz
        }
      );
    }
  }
  return secondaryInvalidNames || { invalid: false };
}

/**
 * check all vpc name fields for valid values
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function vpcNameFieldsCheck(stateData, componentProps) {
  let secondaryInvalidNames = false;
  [
    "default_network_acl_name",
    "default_routing_table_name",
    "default_security_group_name"
  ].forEach(field => {
    if (vpcFieldCheck(field, stateData, componentProps).invalid) {
      secondaryInvalidNames = true;
    }
  });
  return secondaryInvalidNames;
}

/**
 * check if ssh key is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object} invalid boolean invalidText string
 */
function hasInvalidSshPublicKey(stateData, componentProps) {
  let invalid = {
    invalid: false,
    invalidText:
      "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region"
  };
  if (!validSshKey(stateData.public_key)) {
    invalid.invalid = true;
  } else if (
    duplicateCheck(
      getAllNames("ssh_public_keys", componentProps),
      componentProps.data.public_key,
      stateData.public_key
    )
  ) {
    invalid.invalid = true;
    invalid.invalidText = "SSH Public Key in use";
  }
  return invalid;
}

/**
 * check roks cluster for workers
 * @param {*} stateData
 * @returns {Object} boolean invalid string invalidText
 */
function hasInvalidWorkers(stateData) {
  let invalidWorkers = {
    invalid: false,
    invalidText: ""
  };
  if (
    stateData.cluster.kube_type === "openshift" &&
    stateData.cluster.subnet_names.length *
      stateData.cluster.workers_per_subnet <
      2
  ) {
    invalidWorkers.invalid = true;
    invalidWorkers.invalidText =
      "OpenShift clusters require at least 2 worker nodes across any number of subnets";
  }
  return invalidWorkers;
}

/**
 * test for invalid range
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean} true if invalid
 */
function iamAccountSettingsInvalidRange(value, min, max) {
  let invalidRange = {
    invalid: false,
    invalidText: `Must be a whole number between ${min} and ${max}`
  };

  if (!isNotNullOrEmptyString(value)) return invalidRange;

  if (!isInRange(value, min, max) || !isWholeNumber(parseFloat(value))) {
    invalidRange.invalid = true;
  }
  return invalidRange;
}

/**
 * test for invalid IP string
 * @param {string} value
 * @returns {Object} invalid boolean invalidText string
 */
function iamAccountSettingsInvalidIpString(value) {
  let invalidIp = {
    invalid: false,
    invalidText:
      "Please enter a comma separated list of IP addresses or CIDR blocks"
  };
  if (
    isNotNullOrEmptyString(value) &&
    value.match(commaSeparatedIpListExp) === null
  ) {
    invalidIp.invalid = true;
  }
  return invalidIp;
}

/**
 * test for invalid number
 * @param {string} value
 * @returns {Object} invalid boolean invalidText string
 */
function iamAccountSettingsInvalidNumber(value) {
  let invalidNumber = {
    invalid: false,
    invalidText: "Must be a whole number greater than 0"
  };

  if (!isNotNullOrEmptyString(value)) return invalidNumber;
  if (value <= 0 || !isWholeNumber(parseFloat(value))) {
    invalidNumber.invalid = true;
  }
  return invalidNumber;
}

/**
 * Checks if there is an invalid value based on the rule protocol
 * and provides invalid text
 * @param {String} name name of the field
 * @param {String} value value to check
 * @returns {boolean} true if invalid
 */
function hasInvalidRuleProtocol(name, value) {
  let invalidRuleProtocol = {
    invalid: false,
    invalidText: ""
  };
  if (value !== null && value !== "") {
    if (validPortRange(name, value) === false) {
      invalidRuleProtocol.invalid = true;
      invalidRuleProtocol.invalidText = contains(["type", "code"], name)
        ? `0 to ${name === "type" ? 254 : 255}`
        : "1 to 65535";
    }
  }
  return invalidRuleProtocol;
}

/**
 * Provides invalid text and checks if invalid cidr/address
 * @param {String} value
 * @returns {boolean} true if invalid
 */
function hasInvalidCidrOrAddress(value) {
  let invalidData = {
    invalid: false,
    invalidText: "Please provide a valid IPV4 IP address or CIDR notation."
  };
  if (!isIpv4CidrOrAddress(value)) {
    invalidData.invalid = true;
  }
  return invalidData;
}

/**
 * invalid prefix
 * @param {string} prefix
 * @returns {object} boolean invalid and text invalidText
 */
function isInvalidPrefix(prefix) {
  let invalidPrefix = {
    invalid: false,
    invalidText:
      "Invalid prefix. Must match the regular expression: /[a-z][a-z0-9-]*[a-z0-9]/"
  };
  if (
    !(
      prefix.match(nameValidationExp) !== null &&
      prefix.toLowerCase() === prefix && // make sure the prefix is all lowercase
      prefix.match(/[^\w\-]|_/) === null && // edge case to check for non-word or underscore tokens, _ is part of the group \w
      prefix.length > 0
    )
  ) {
    invalidPrefix.invalid = true;
  }
  return invalidPrefix;
}

export {
  hasInvalidName,
  hasDuplicateName,
  hasInvalidResourceGroup,
  hasInvalidVpc,
  hasInvalidEncryptionKey,
  hasInvalidCosBucket,
  vpcNameFieldsCheck,
  vpcFieldCheck,
  hasInvalidSshPublicKey,
  hasInvalidWorkers,
  iamAccountSettingsInvalidRange,
  iamAccountSettingsInvalidIpString,
  iamAccountSettingsInvalidNumber,
  hasInvalidRuleProtocol,
  hasInvalidCidrOrAddress,
  isInvalidPrefix,
};
