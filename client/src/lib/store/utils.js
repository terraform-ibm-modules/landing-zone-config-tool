import {
  contains,
  eachKey,
  transpose,
  splatContains,
  arraySplatIndex,
  containsKeys,
  eachZone
} from "lazy-z";
import { reservedSubnetNameExp, nameValidationExp } from "../constants.js";

/**
 * update networking rule
 * @param {boolean} isAcl true for acl, false for security group
 * @param {Object} rule rule object
 * @param {Object} params params object
 */
function updateNetworkingRule(isAcl, rule, params) {
  let defaultRuleStyle = isAcl
    ? // acl rule style
      {
        icmp: {
          type: null,
          code: null
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    : // security group rule style
      {
        icmp: {
          type: null,
          code: null
        },
        tcp: {
          port_min: null,
          port_max: null
        },
        udp: {
          port_min: null,
          port_max: null
        }
      };
  eachKey(params, key => {
    if (isAcl && key === "allow") {
      // set action
      rule.action = params[key] ? "allow" : "deny";
    } else if (key === "inbound") {
      // set direction
      rule.direction = params[key] ? "inbound" : "outbound";
    } else if (key === "ruleProtocol" && params[key] === "all") {
      // if all protocol, hard reset
      transpose(defaultRuleStyle, rule);
    } else if (key === "ruleProtocol") {
      // if key is rule protocol, transpose rule
      transpose(defaultRuleStyle, rule);
      transpose(params.rule, rule[params.ruleProtocol]);
      eachKey(rule[params.ruleProtocol], key => {
        if (rule[params.ruleProtocol][key] !== null) {
          rule[params.ruleProtocol][key] = parseInt(
            rule[params.ruleProtocol][key]
          );
        }
      });
    } else if (key !== "rule") {
      // otherwise set value
      rule[key] = params[key];
    }
  });
}

/**
 * check to see if two IPV4 CIDR blocks contain overlapping addresses
 * @param {string} cidrA cidr block
 * @param {string} cidrB cidr block
 * @returns {boolean} true if two CIDR blocks contain one or more of the same addresses, false otherwise
 */
function cidrBlocksOverlap(cidrA, cidrB) {
  if (cidrA === cidrB) {
    return true;
  }

  // split cidr to get prefixes
  var cidrATokens = cidrA.split("/");
  var cidrBTokens = cidrB.split("/");

  // find smaller cidr block (bigger prefix means smaller range)
  if (cidrATokens[1] < cidrBTokens[1]) {
    var smallerBlock = cidrB;
    var largerBlock = cidrA;
  } else {
    var smallerBlock = cidrA;
    var largerBlock = cidrB;
  }

  // get first and last address in hex
  var smallCidr = getFirstLastAddress(smallerBlock);
  var bigCidr = getFirstLastAddress(largerBlock);

  // generate all ips from first to last and store in array for cidr blocks
  var smallerIps = generateIpRange(
    smallCidr.firstAddress,
    smallCidr.lastAddress
  );
  var biggerIps = generateIpRange(bigCidr.firstAddress, bigCidr.lastAddress);

  // loop through all ips and check if they are in the larger cidr block
  for (let i = 0; i < smallerIps.length; i++) {
    if (contains(biggerIps, smallerIps[i])) {
      return true;
    }
  }
  return false;
}

/**
 * make ip from 32 bit number
 * @param {int} num 32 bit number
 * @returns {string} ip address string
 */
function makeIP(num) {
  return [
    // for each number (octet) between the "." (16 bits) shift (>>) to the correct position for big-endian
    // then do bitwise and (&) to ensure unsigned value since 0xFF is 255 or max value for octet
    (num >> 24) & 0xff,
    (num >> 16) & 0xff,
    (num >> 8) & 0xff,
    num & 0xff
  ].join(".");
}

/**
 * get 32 bit unsigned int of ip address and the mask in hex for both blocks then get first and last address
 * @param {string} cidr cidr block string
 * @returns {object} first and last address of given cidr block in hex
 */
function getFirstLastAddress(cidr) {
  // split address from cidr prefix and get 32 bit unsigned int of ip
  var mCidr = cidr.match(/\d+/g);
  var block32 = mCidr.slice(0, 4).reduce(function(a, o) {
    return ((+a << 8) >>> 0) + +o;
  });
  // calculate mask from cidr prefix
  var mask = (~0 << (32 - +mCidr[4])) >>> 0;
  // get first and last address from int representation and mask bit manipulation
  var firstAddress = (block32 & mask) >>> 0;
  var lastAddress = (block32 | ~mask) >>> 0;
  return { firstAddress, lastAddress };
}

/**
 * generate all ips from first to last and store in array for cidr block
 * @param {string} firstHex first address in hex format
 * @param {string} lastHex last address in hex format
 * @returns {Array<string>} array of all ips in a cidr block range
 */
function generateIpRange(firstHex, lastHex) {
  var ips = [];
  for (let i = firstHex; i <= lastHex; i++) {
    ips.push(makeIP(i));
  }
  return ips;
}

/**
 * shortcut for ["icmp", "tcp", "udp"].forEach
 * @param {eachProtocolCallback} eachProtocolCallback
 */
function eachRuleProtocol(eachProtocolCallback) {
  ["icmp", "tcp", "udp"].forEach(protocol => {
    eachProtocolCallback(protocol);
  });
}

/**
 * @callback eachProtocolCallback callback to run for the protocol
 * @param {string} protocol name of zone
 */

/**
 * validate subnet names
 * @param {string} subnetName
 * @returns {boolean} true if valid
 */
function validSubnetName(subnetName) {
  if (subnetName.length < 1) {
    return false;
  } else if (contains(subnetName, "zone")) {
    return false;
  } else if (subnetName.match(reservedSubnetNameExp) !== null) {
    return false;
  } else {
    return subnetName.match(nameValidationExp) !== null;
  }
}

/**
 * build subnet tiers for a vpc
 * @param {*} vpcObject vpc object
 * @returns {Array<Object>} list of subnet tiers in that vpc
 */
function buildSubnetTiers(vpcObject) {
  let subnetTiers = []; // list of tiers to return
  let smallestZoneCidr = 0; // smallest zone cidr used to order tiers

  // for each zone
  eachZone(3, zone => {
    let zoneSubnets = vpcObject.subnets[zone]; // ref for zone subnets

    // for each subnet
    zoneSubnets.forEach(subnet => {
      // if is part of a tier
      if (subnet.name.match(/^[a-z0-9-]+-zone-\d$/)) {
        let tierName = subnet.name.replace(/-zone-\d/g, ""); // get tier name by replacing zone
        let arrayMethod = "push";
        // in order to make sure that subnet tiers are translated to be in
        // the correct order, array method is set to add new tiers. `push` is used to add to the end
        // and `unshift` is used to add to the beginning
        let subnetOrderCidr = parseInt(
          // replace everything that is not the zone determined portion of the CIDR
          // and convert to number
          subnet.cidr.replace(/\.\d+\/\d+/g, "").replace(/10\.\d+\./g, "")
        );
        if (smallestZoneCidr === 0) {
          // if just initialized, set to subnet order cidr
          smallestZoneCidr = subnetOrderCidr;
        } else if (subnetOrderCidr < smallestZoneCidr) {
          // if the cidr block is less than the previous one, set array method to unshift
          smallestZoneCidr = smallestZoneCidr;
          arrayMethod = "unshift";
        }

        if (!splatContains(subnetTiers, "name", tierName)) {
          // if the subnet tier does not exist in the list, add to list
          subnetTiers[arrayMethod]({
            name: tierName,
            zones: 1
          });
        } else {
          // otherwise, increase number of zones
          let tierIndex = arraySplatIndex(subnetTiers, "name", tierName);
          subnetTiers[tierIndex].zones++;
        }
      }
    });
  });
  return subnetTiers;
}

function isNotInitialized(parent, field) {
  return containsKeys(parent.store.configDotJson, field) === false;
}

/**
 * validate rule
 * @param {slzStateStore} slz
 * @param {Object} networkRule
 * @param {Object} componentProps
 */
function formatNetworkingRule(slz, networkRule, componentProps) {
  if (networkRule.showDeleteModal !== undefined)
    delete networkRule.showDeleteModal;
  if (networkRule.ruleProtocol) {
    if (networkRule.ruleProtocol === "icmp") {
      delete networkRule.rule.port_max;
      delete networkRule.rule.port_min;
    } else if (networkRule.ruleProtocol !== "all") {
      delete networkRule.rule.type;
      delete networkRule.rule.code;
    }
    if (networkRule.ruleProtocol !== "all" && componentProps.isSecurityGroup) {
      delete networkRule.rule.source_port_max;
      delete networkRule.rule.source_port_min;
    }
  }
}

/**
 * check if input is null or empty string
 * check if supplied value is not null or NOT_SET
 * @param {*} value state value to check
 * @returns {boolean}} true or false depending on supplied value
 */
function notUnset(value) {
  return value != null && value != "NOT_SET";
}

/** check if input is null or empty string
 * @param {string} input
 * @returns {boolean} true if str null or ""
 */
function checkNullorEmptyString(input) {
  if (input === null || input === "") return true;
  else return false;
}

/**
 * preprend [""] to an existing array if check is true
 * @param {*} value check value if it is null or empty string
 * @param {Array<string>} arr
 */
function prependEmptyStringToArrayOnNullOrEmptyString(value, arr) {
  let arrayCheck = checkNullorEmptyString(value);
  let prependArray = arrayCheck ? [""] : [];
  return prependArray.concat(arr);
}

/**
 * if a value is null, return "", otherwise return value
 * @param {string} value
 * @returns {string} "" if value is null, otherwise value
 */
function defaultToEmptyStringIfValueNull(value) {
  if (value === null || value === undefined) return "";
  else return value;
}

/**
 * if a value is string "null", return "", otherwise return value
 * @param {string} value
 * @returns {string} "" if value is "null", otherwise value
 */
function defaultToEmptyStringIfNullString(value) {
  if (value === "null") return "";
  else return value;
}

export {
  defaultToEmptyStringIfValueNull,
  defaultToEmptyStringIfNullString,
  updateNetworkingRule,
  cidrBlocksOverlap,
  eachRuleProtocol,
  validSubnetName,
  buildSubnetTiers,
  isNotInitialized,
  formatNetworkingRule,
  notUnset,
  checkNullorEmptyString,
  prependEmptyStringToArrayOnNullOrEmptyString
};
