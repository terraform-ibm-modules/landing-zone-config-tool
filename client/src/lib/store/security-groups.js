import pkg from "lazy-z";
const { transpose, revision, buildNetworkingRule } = pkg;
import { defaultSecurityGroups } from "./defaults.js";
import {
  setUnfoundResourceGroup,
  hasUnfoundVpc,
  pushAndUpdate,
  updateChild,
  carveChild,
  pushToChildField,
  deleteSubChild
} from "./store.utils.js";
import { formatNetworkingRule, updateNetworkingRule } from "./utils.js";

/**
 * initialize security groups
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function securityGroupInit(slz) {
  slz.store.configDotJson.security_groups = defaultSecurityGroups();
  slz.store.securityGroups = {};
}

/**
 * on security group store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.security_groups
 * @param {Array<string>} slz.store.vpcList
 */
function securityGroupOnStoreUpdate(slz) {
  let newSgMap = {}; // new security groups
  // set an empty array at each vpc key
  slz.store.vpcList.forEach(vpc => {
    newSgMap[vpc] = [];
  });
  // for each security group
  slz.store.configDotJson.security_groups.forEach(group => {
    setUnfoundResourceGroup(slz, group);
    if (hasUnfoundVpc(slz, group)) {
      group.vpc_name = null;
    }
    // if group vpc name isn't null
    if (group.vpc_name !== null) {
      // add name to group
      newSgMap[group.vpc_name].push(group.name);
    }
  });
  // set security groups
  slz.store.securityGroups = newSgMap;
}

/**
 * create a new security group
 * @param {slzStateStore} slz
 * @param {Object} stateData state data from component
 */
function securityGroupCreate(slz, stateData) {
  let sg = { resource_group: null, rules: [] };
  transpose(stateData, sg);
  pushAndUpdate(slz, "security_groups", sg);
}

/**
 * update security group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function securityGroupSave(slz, stateData, componentProps) {
  updateChild(slz, "security_groups", stateData, componentProps);
}

/**
 * delete security group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function securityGroupDelete(slz, stateData, componentProps) {
  carveChild(slz, "security_groups", componentProps);
}

/**
 * create security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {string} stateData.direction
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 */
function securityGroupRulesCreate(slz, stateData, componentProps) {
  stateData.inbound = stateData.direction === "inbound" ? true : false;
  let rule = buildNetworkingRule(stateData);
  pushToChildField(slz, "security_groups", "rules", rule, {
    arrayParentName: componentProps.parent_name,
    data: componentProps.data
  });
}

/**
 * update security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {string} stateData.direction
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 * @param {string} componentProps.data.name old name of rule
 */
function securityGroupRulesSave(slz, stateData, componentProps) {
  let networkRule = stateData;
  formatNetworkingRule(slz, networkRule, componentProps);
  new revision(slz.store.configDotJson)
    .child("security_groups", componentProps.parent_name) // get security group
    .child("rules", componentProps.data.name) // get rule
    .then(data => {
      // update rule and update parent
      updateNetworkingRule(false, data, stateData);
    });
}

/**
 * delete security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 * @param {string} componentProps.data.name old name of rule
 */
function securityGroupRulesDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "security_groups", "rules", {
    arrayParentName: componentProps.parent_name,
    data: componentProps.data
  });
}

export {
  securityGroupDelete,
  securityGroupRulesCreate,
  securityGroupRulesSave,
  securityGroupRulesDelete,
  securityGroupInit,
  securityGroupOnStoreUpdate,
  securityGroupCreate,
  securityGroupSave
};
