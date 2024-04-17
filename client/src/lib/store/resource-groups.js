import { splat } from "lazy-z";
import { pushAndUpdate, updateChild, carveChild } from "./store.utils.js";

/**
 * initialize resource groups
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function resourceGroupInit(slz) {
  slz.store.configDotJson.resource_groups = [
    {
      create: true,
      name: "service-rg",
      use_prefix: true
    },
    {
      create: true,
      name: "management-rg",
      use_prefix: true
    },
    {
      create: true,
      name: "workload-rg",
      use_prefix: true
    }
  ];
  resourceGroupOnStoreUpdate(slz);
}

/**
 * on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function resourceGroupOnStoreUpdate(slz) {
  slz.store.resourceGroups = splat(
    slz.store.configDotJson.resource_groups,
    "name"
  );
}

/**
 * create a new resource group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 */
function resourceGroupCreate(slz, stateData) {
  pushAndUpdate(slz, "resource_groups", stateData);
}

/**
 * update existing resource group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupSave(slz, stateData, componentProps) {
  updateChild(slz, "resource_groups", stateData, componentProps);
}

/**
 * delete resource group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function resourceGroupDelete(slz, stateData, componentProps) {
  carveChild(slz, "resource_groups", componentProps);
}

export {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
};
