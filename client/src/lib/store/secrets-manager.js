import { revision } from "lazy-z";
import {
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup
} from "./store.utils.js";

/**
 * initialize secrets manager
 * @param {slzStateStore} slz
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function secretsManagerInit(slz) {
  slz.store.configDotJson.secrets_manager = {
    kms_key_name: null,
    name: null,
    resource_group: null,
    use_secrets_manager: false
  };
}

/**
 * on store update for secrets manager
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.secrets_manager
 * @param {boolean} slz.store.configDotJson.use_secrets_manager
 */
function secretsManagerOnStoreUpdate(slz) {
  let secretsManager = slz.store.configDotJson.secrets_manager; // reference to secets manager
  // if use secrets manager is false, all other params set to null
  if (secretsManager.use_secrets_manager === false) {
    secretsManagerInit(slz);
  } else {
    setUnfoundResourceGroup(slz, secretsManager);
    setUnfoundEncryptionKey(slz, secretsManager, "kms_key_name");
  }
}

/**
 * save secrets manager
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.secrets_manager
 * @param {object} stateData component state data
 */
function secretsManagerSave(slz, stateData) {
  new revision(slz.store.configDotJson.secrets_manager)
    .update(stateData) // update
}

export {
  secretsManagerInit,
  secretsManagerOnStoreUpdate,
  secretsManagerSave
};
