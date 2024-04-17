import {
  setUnfoundResourceGroup,
  pushAndUpdate,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild
} from "./store.utils.js";

/**
 * init state store
 * @param {slzState} slz
 */
function accessGroupInit(slz) {
  slz.store.configDotJson.access_groups = [];
}

/**
 * on store update
 * @param {slzState} slz
 */
function accessGroupOnStoreUpdate(slz) {
  // for each access group
  slz.store.configDotJson.access_groups.forEach(group => {
    // for each policy in that group
    group.policies.forEach(policy => {
      setUnfoundResourceGroup(slz, policy.resources);
    });
  });
}
/**
 * create new access group
 * @param {slzState} slz
 * @param {object} stateData component state data
 * @param {string} stateData.name name of access group
 * @param {string} stateData.description access group description
 */
function accessGroupCreate(slz, stateData) {
  pushAndUpdate(slz, "access_groups", {
    name: stateData.name,
    description: stateData.description,
    policies: [],
    dynamic_policies: [],
    invite_users: []
  });
}
/**
 * save access group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupSave(slz, stateData, componentProps) {
  updateChild(slz, "access_groups", stateData, componentProps);
}

/**
 * delete access group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDelete(slz, stateData, componentProps) {
  carveChild(slz, "access_groups", componentProps);
}

/**
 * create new access group policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} stateData.resources resource object for access group policy
 * @param {object} componentProps props from component form
 */
function accessGroupPolicyCreate(slz, stateData, componentProps) {
  pushToChildField(slz, "access_groups", "policies", stateData, componentProps);
}

/**
 * update access group policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupPolicySave(slz, stateData, componentProps) {
  updateSubChild(slz, "access_groups", "policies", stateData, componentProps);
}

/**
 * delete access group policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupPolicyDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "access_groups", "policies", componentProps);
}

/**
 * create access group dynamic policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicyCreate(slz, stateData, componentProps) {
  pushToChildField(
    slz,
    "access_groups",
    "dynamic_policies",
    stateData,
    componentProps
  );
}

/**
 * save access group dynamic policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicySave(slz, stateData, componentProps) {
  updateSubChild(
    slz,
    "access_groups",
    "dynamic_policies",
    stateData,
    componentProps
  );
}

/**
 * delete access group dynamic policy
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicyDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "access_groups", "dynamic_policies", componentProps);
}

export {
  accessGroupInit,
  accessGroupOnStoreUpdate,
  accessGroupCreate,
  accessGroupSave,
  accessGroupDelete,
  accessGroupPolicyCreate,
  accessGroupPolicySave,
  accessGroupPolicyDelete,
  accessGroupDynamicPolicyCreate,
  accessGroupDynamicPolicySave,
  accessGroupDynamicPolicyDelete
};
