import {
  emailValidationExp,
  nameValidationExp,
  sshKeyValidationExp,
  urlValidationExp,
  tmosAdminPasswordValidationExp
} from "./constants.js";
import {
  isIpv4CidrOrAddress,
  revision,
  splat,
  keys,
  contains,
  getObjectFromArray,
  validPortRange
} from "lazy-z";

/**
 * validate name
 * @param {string} str string
 * @returns {boolean} true if name does match
 */
function validName(str) {
  if (str) return str.match(nameValidationExp) !== null;
  else return false;
}

/**
 * validate url
 * @param {string} str
 * @returns {boolean} true if it is a valid url
 */
function validUrl(str) {
  return str.match(urlValidationExp) !== null;
}

/**
 * validate sshKey
 * @param {string} str
 * @returns {boolean} true if it is a valid sshKey
 */
function validSshKey(str) {
  return str.match(sshKeyValidationExp) !== null;
}

/**
 * validate for value length >= 6
 * @param {string} str string
 * @returns {boolean} true if valid length
 */
function minStringSize(str) {
  return str.length >= 6;
}

/**
 * valid ip or cidr
 * @param {*} str
 * @returns {boolean} true if is valid
 */
function validIpCidr(str) {
  return isIpv4CidrOrAddress(str);
}

/**
 * verifies tmos admin password
 * @param {str} password
 * @returns {boolean} true when state.tmos_admin_password is valid
 */
function validTmosAdminPassword(password) {
  if (isNotNullOrEmptyString(password)) {
    return password.match(tmosAdminPasswordValidationExp) !== null;
  }
  return true;
}

/**
 * url value is valid and not empty
 * @param {str} url
 * @returns {boolean} true when url is empty, false when invalid
 */
function isEmptyOrValidUrl(url) {
  return isNotNullOrEmptyString(url) && url !== "null" ? validUrl(url) : true;
}

/**
 * return true if value is not null or empty string
 * @param {*} value
 * @returns {boolean} true if not null or empty string
 */
function isNotNullOrEmptyString(value) {
  return value !== null && value !== "";
}

/**
 * validate rule data
 * @param {Object} rule
 * @param {boolean} isIcmp
 * @param {boolean} isSecurityGroup
 * @param {validRuleDataCallback} callback
 * @returns {boolean} true if valid
 */
function validateRuleData(rule, isIcmp, isSecurityGroup, callback) {
  // list of fields
  let fields = isIcmp
    ? ["type", "code"] // icmp fields
    : isSecurityGroup
    ? ["port_min", "port_max"] // no source port for sg
    : ["port_min", "port_max", "source_port_min", "source_port_max"];

  let isValid = true;
  fields.forEach(field => {
    if (isNotNullOrEmptyString(rule[field])) {
      if (!validPortRange(field, rule[field] || -1)) {
        if (callback) callback(field);
        isValid = false;
      }
    }
  });
  return isValid;
}

/**
 * get all names for a given component
 * @param {string} componentName name
 * @param {Object} componentProps
 * @returns {Array<string>} list of names
 */
function getAllNames(componentName, componentProps) {
  let allNames = [];
  if (componentName === "default_routing_table_name") {
    allNames = splat(
      componentProps.slz.store.configDotJson.vpcs,
      "default_routing_table_name"
    );
  } else if (componentName === "network_acls") {
    new revision(componentProps.slz.store.configDotJson)
      .child(
        "vpcs",
        componentProps.isModal
          ? componentProps.vpc_name
          : componentProps.arrayParentName,
        "prefix"
      )
      .then(data => {
        allNames = splat(data.network_acls, "name");
      });
  } else if (componentName === "cos_keys") {
    new revision(componentProps.slz.store.configDotJson)
      .child("cos", componentProps.arrayParentName)
      .then(instance => {
        allNames = splat(instance.keys, "name");
      });
  } else if (componentName === "kms_key") {
    allNames = splat(
      componentProps.slz.store.configDotJson.key_management.keys,
      "name"
    );
  } else if (componentName === "ssh_keys") {
    allNames = splat(componentProps.slz.store.configDotJson.ssh_keys, "name");
  } else if (componentName === "ssh_public_keys") {
    allNames = splat(
      componentProps.slz.store.configDotJson.ssh_keys,
      "public_key"
    );
  } else if (componentName === "subnetTiers") {
    allNames = splat(
      componentProps.slz.store.subnetTiers[componentProps.vpc_name],
      "name"
    );
  } else if (componentName === "worker_pools") {
    new revision(componentProps.slz.store.configDotJson)
      .child("clusters", componentProps.arrayParentName)
      .then(data => {
        allNames = splat(data.worker_pools, "name");
      });
  } else if (componentName === "policies") {
    new revision(componentProps.slz.store.configDotJson)
      .child("access_groups", componentProps.arrayParentName)
      .then(data => {
        allNames = splat(data.policies, "name");
      });
  } else if (componentName === "dynamic_policies") {
    new revision(componentProps.slz.store.configDotJson)
      .child("access_groups", componentProps.arrayParentName)
      .then(data => {
        allNames = splat(data.dynamic_policies, "name");
      });
  } else if (componentName === "buckets") {
    allNames = componentProps.slz.store.cosBuckets;
  } else if (componentName === "vpcs") {
    allNames = componentProps.slz.store.vpcList;
  } else if (componentName === "networking_rule" && componentProps.isAclForm) {
    new revision(componentProps.slz.store.configDotJson)
      .child("vpcs", componentProps.vpc_name, "prefix")
      .child("network_acls", componentProps.parent_name)
      .then(data => {
        allNames = splat(data.rules, "name");
      });
  } else if (componentName === "networking_rule" && !componentProps.vsiName) {
    new revision(componentProps.slz.store.configDotJson)
      .child("security_groups", componentProps.parent_name)
      .then(data => {
        allNames = splat(data.rules, "name");
      });
  } else if (componentProps.vsiName) {
    new revision(componentProps.slz.store.configDotJson)
      .child(
        componentProps.isTeleport ? "teleport_vsi" : "vsi",
        componentProps.vsiName
      )
      .then(data => {
        allNames = splat(data.security_group.rules, "name");
      });
  } else if (componentName === "vsi") {
    allNames = splat(componentProps.slz.store.configDotJson.vsi, "name").concat(
      splat(componentProps.slz.store.configDotJson.teleport_vsi, "name")
    );
  } else if (componentName === "security_groups") {
    let allSgNames = splat(
      componentProps.slz.store.configDotJson.security_groups,
      "name"
    );
    componentProps.slz.store.configDotJson.vsi.forEach(instance => {
      allSgNames.push(instance.security_group.name);
    });
    componentProps.slz.store.configDotJson.teleport_vsi.forEach(instance => {
      allSgNames.push(instance.security_group.name);
    });
    allNames = allSgNames;
  } else {
    allNames = splat(
      componentProps.slz.store.configDotJson[componentName],
      componentName === "virtual_private_endpoints" ? "service_name" : "name"
    );
  }
  return allNames;
}

/**
 * check for a duplicate name in an array, return true if found otherwise
 * return false
 * @param {Array<string>} allNames
 * @param {string} oldName
 * @param {string} newName
 * @returns {boolean} true if should be disabled, else false
 */
function duplicateCheck(allNames, oldName, newName) {
  if (oldName !== newName && contains(allNames, newName)) {
    return true;
  } else {
    return false;
  }
}

/**
 * get tier subnets to render tiles from vpc data
 * @param {Object} vpcData configDotJson VPC object
 * @param {string} tierName name of the tier to search for
 * @returns {Array<string>} list of subnets
 */
function getTierSubnetsFromVpcData(vpcData, tierName) {
  let tierSubnets = [];
  let tierNameRegex = new RegExp(`^${tierName}-zone-\\d$`);
  keys(vpcData.subnets).forEach(zone => {
    vpcData.subnets[zone].forEach(subnet => {
      if (subnet.name.match(tierNameRegex)) {
        tierSubnets.push(subnet);
      }
    });
  });
  return tierSubnets;
}

/**
 * turn on gw toggle
 * @param {*} slz state store
 * @param {string} vpcName vpc name
 * @param {string} tierName tier name
 * @returns {boolean} true if two or more subnets have gw enabled or if all do
 */
function subnetTierHasValueFromSubnets(slz, vpcName, tierName, field) {
  let vpcData = getObjectFromArray(
    slz.store.configDotJson.vpcs,
    "prefix",
    vpcName
  );
  let tierSubnets = getTierSubnetsFromVpcData(vpcData, tierName);
  let allValues = splat(tierSubnets, field);
  if (field === "public_gateway") {
    let trueValues = [];
    allValues.forEach(gw => {
      if (gw === true) trueValues.push(gw);
    });
    return trueValues.length >= 2 || trueValues.length === tierSubnets.length;
  } else {
    let acls = [];
    allValues.forEach(acl => {
      if (acls.length === 0) {
        acls.push(acl);
      } else if (contains(acls, acl)) {
        acls.push(acl);
      }
    });
    return acls.length >= 2 || acls.length === tierSubnets.length
      ? acls[0]
      : "";
  }
}
/**
 * securely generates a random byte to be transformed into a character
 * @returns {byte} random byte
 */
function getRandomByte() {
  var result = new Uint8Array(1);
  result = window.crypto.getRandomValues(result); // cryptographically secure random number generation
  return result[0];
}

/**
 * Checks if the random byte character generated is a valid character in the charset
 * if it is, return the char, add it to the password String
 * @param {int} length
 * @returns {char} a valid char to go into the password
 */
function generatePassword(length) {
  const charset = /[a-zA-Z0-9_\-+!$%^&*#]/; // valid chars for the password string
  return Array.apply(null, { length: length }) // create an array of null of length specified
    .map(function() {
      // on each element
      var result;
      while (true) {
        result = String.fromCharCode(getRandomByte()); // generate a char until it is a valid char in the charset
        if (charset.test(result)) {
          return result; // char is in the charset
        }
      }
    }, this)
    .join(""); // join all array elements into a single string
}

/**
 * generates the password until it fits the validation expression
 * @param {int} length
 * @returns {string} password that fits the requirements of the validation expression
 */
function getValidAdminPassword(length) {
  var invalid = true;
  var count = 0;
  do {
    var result = generatePassword(length); // generate a password until it is valid
    if (tmosAdminPasswordValidationExp.test(result)) {
      // we are valid if this test passes
      invalid = false;
    } else {
      result = ""; // reset result
      count++;
    }
  } while (invalid && count <= 5); // only be more than 5 times if you specified an invalid length. dummy counter for unit
  return result;
}

export {
  minStringSize,
  validSshKey,
  validName,
  validUrl,
  validIpCidr,
  validateRuleData,
  isNotNullOrEmptyString,
  getAllNames,
  duplicateCheck,
  isEmptyOrValidUrl,
  subnetTierHasValueFromSubnets,
  getTierSubnetsFromVpcData,
  validTmosAdminPassword,
  generatePassword,
  getRandomByte,
  getValidAdminPassword
};
