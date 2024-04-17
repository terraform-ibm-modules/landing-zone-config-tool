import { splat, revision, carve } from "lazy-z";
import { addVsiEncryptionKey, buildNewEncryptionKey } from "../builders.js";
import { newDefaultKms } from "./defaults.js";
import { setUnfoundResourceGroup } from "./store.utils.js";

/**
 * set encryption keys for slz store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 * @param {Array<object>} slz.store.key_management.keys
 */
function setEncryptionKeys(slz) {
  slz.store.encryptionKeys = splat(
    slz.store.configDotJson.key_management.keys,
    "name"
  );
}

/**
 * initialize key management in slz store
 * @param {slzStateStore} slz
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function keyManagementInit(slz) {
  slz.store.configDotJson.key_management = newDefaultKms();
  slz.store.configDotJson.key_management.keys.push({
    key_ring: "slz-slz-ring",
    name: "slz-roks-key",
    root_key: true,
    payload: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  });
  addVsiEncryptionKey(slz);
  setEncryptionKeys(slz);
}

/**
 * update key management store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 */
function keyManagementOnStoreUpdate(slz) {
  setEncryptionKeys(slz);
  setUnfoundResourceGroup(slz, slz.store.configDotJson.key_management);
}

/**
 * save key management
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 * @param {object} stateData component state data
 * @param {boolean} stateData.use_hs_crypto
 * @param {boolean} stateData.use_data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 */
function keyManagementSave(slz, stateData) {
  let keyManagementData = {
    // set to true if use hs crypto
    use_data: stateData.use_hs_crypto ? true : stateData.use_data || false,
    use_hs_crypto: stateData.use_hs_crypto || false,
    name: stateData.name,
    resource_group: stateData.resource_group
  };
  new revision(slz.store.configDotJson.key_management).update(
    keyManagementData
  );
}

/**
 * create new kms key
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 * @param {Array<string>} slz.store.configDotJson.key_management.keys
 * @param {object} stateData component state data
 */
function kmsKeyCreate(slz, stateData) {
  let newKey = buildNewEncryptionKey(stateData);
  slz.store.configDotJson.key_management.keys.push(newKey);
}

/**
 * update kms key
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 * @param {Array<string>} slz.store.configDotJson.key_management.keys
 * @param {object} stateData component state data
 * @param {number} stateData.interval_month rotation interval
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function kmsKeySave(slz, stateData, componentProps) {
  stateData["policies"] = {
    rotation: { interval_month: stateData.interval_month }
  };
  delete stateData.interval_month;
  new revision(slz.store.configDotJson.key_management).updateChild(
    "keys",
    componentProps.data.name,
    stateData
  );
}

/**
 * delete a kms key
 * @param {slzStateStore} slz landing zone store
  * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.key_management
 * @param {Array<string>} slz.store.configDotJson.key_management.keys
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
  * @param {string} componentProps.data.name original name

 */
function kmsKeyDelete(slz, stateData, componentProps) {
  carve(
    slz.store.configDotJson.key_management.keys,
    "name",
    componentProps.data.name
  );
}

export {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  kmsKeyCreate,
  kmsKeySave,
  kmsKeyDelete
};
