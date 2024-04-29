import { transpose, eachKey } from "lazy-z";
import { setUnfoundResourceGroup } from "./store.utils.js";

/**
 * initialize atracker
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function atrackerInit(slz) {
  // set cos bind key. in slz key is mapped to bucket in a weird way so
  // this is how we have to store it.
  slz.store.atrackerKey = "cos-bind-key";

  // initialize config.json atracker for default paterns
  slz.store.configDotJson.atracker = {
    collector_bucket_name: "atracker-bucket",
    receive_global_events: true,
    resource_group: "service-rg",
    add_route: true
  };
}

/**
 * atracker on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.atracker
 */
function atrackerOnStoreUpdate(slz) {
  let atracker = slz.store.configDotJson.atracker;
  slz.updateUnfound("cosBuckets", atracker, "collector_bucket_name");
  slz.updateUnfound("cosKeys", slz.store, "atrackerKey");
  setUnfoundResourceGroup(slz, atracker);
}

/**
 * save atracker
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.atracker
 * @param {string} slz.store.atrackerKey
 * @param {object} stateData component state data
 * @param {string} stateData.atracker_key
 */
function atrackerSave(slz, stateData) {
  delete stateData.showFsModal;
  let atrackerParams = {};
  let atrackerKey;
  // for each key in state that isn't atracker key transpose onto object
  eachKey(stateData, key => {
    if (key !== "atracker_key") atrackerParams[key] = stateData[key];
    else atrackerKey = stateData[key];
  });
  if (atrackerKey) {
    slz.store.atrackerKey = atrackerKey;
  }
  transpose(atrackerParams, slz.store.configDotJson.atracker);
}

export {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave
};
