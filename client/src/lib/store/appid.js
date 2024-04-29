import { revision } from "lazy-z";
import { newTeleportConfig } from "../builders.js";
import { setUnfoundResourceGroup } from "./store.utils.js";

/**
 * init app id store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function appidInit(slz) {
  slz.store.configDotJson.appid = {
    use_appid: false,
    name: null,
    resource_group: null,
    use_data: false,
    keys: []
  };
}

/**
 * update appid store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.appid
 */
function appidOnStoreUpdate(slz) {
  setUnfoundResourceGroup(slz, slz.store.configDotJson.appid);
}

/**
 * save appid configuration
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.appid
 * @param {Function}
 * @param {object} stateData component state data
 * @param {boolean} stateData.showKeys
 * @param {boolean} stateData.hasBeenSaved
 */
function appidSave(slz, stateData) {
  let appid = stateData;
  delete appid.showKeys;
  delete appid.hasBeenSaved;
  if (appid.use_appid === false) {
    appid.name = null;
    appid.resource_group = null;
    appid.use_data = null;
    appid.keys = [];
    slz.store.configDotJson.teleport_config = newTeleportConfig();
    slz.store.configDotJson.teleport_vsi = [];
  }
  // new revision
  new revision(slz.store.configDotJson.appid)
    .update(appid) // update
}

export {
  appidInit,
  appidOnStoreUpdate,
  appidSave
};
