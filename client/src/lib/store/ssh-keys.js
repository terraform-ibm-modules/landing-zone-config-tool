import { splat } from "lazy-z";
import {
  setUnfoundResourceGroup,
  pushAndUpdate,
  updateChild,
  carveChild
} from "./store.utils.js";

/**
 * set slz store ssh keys
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.ssh_keys
 */
function setSshKeys(slz) {
  slz.store.sshKeys = splat(slz.store.configDotJson.ssh_keys, "name");
}

/**
 * ini slz store ssh keys
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function sshKeyInit(slz) {
  slz.store.configDotJson.ssh_keys = [
    {
      name: "slz-ssh-key",
      public_key: "<REPLACE_WITH_VALID_PUBLIC_KEY>",
      resource_group: "management-rg"
    }
  ];
  setSshKeys(slz);
}

/**
 * on store update ssh keys
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.ssh_keys
 */
function sshKeyOnStoreUpdate(slz) {
  setSshKeys(slz);
  slz.store.configDotJson.ssh_keys.forEach(key => {
    setUnfoundResourceGroup(slz, key);
  });
}

/**
 * create a new ssh key
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 */
function sshKeyCreate(slz, stateData) {
  pushAndUpdate(slz, "ssh_keys", stateData);
}

/**
 * save an ssh key
 * @param {slzState} slz
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.vsi
 * @param {string} slz.store.configDotJson.vsi.ssh_keys
 * @param {object} stateData component state data
 * @param {boolean} stateData.show
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name
 */
function sshKeySave(slz, stateData, componentProps) {
  delete stateData.show;
  // if ssh key has new name
  if (stateData.name !== componentProps.data.name) {
    // for each vsi
    slz.store.configDotJson.vsi.forEach(instance => {
      // if old key is found
      let newSshKeys = []; // list of ssh keys
      // for each key in the instance
      instance.ssh_keys.forEach(key => {
        newSshKeys.push(
          // add either the key name or the new key name
          key === componentProps.data.name ? stateData.name : key
        );
      });
      // set ssh keys
      instance.ssh_keys = newSshKeys;
    });
  }
  updateChild(slz, "ssh_keys", stateData, componentProps);
}

/**
 * delete ssh key
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function sshKeyDelete(slz, stateData, componentProps) {
  carveChild(slz, "ssh_keys", componentProps);
}

export {
  sshKeyCreate,
  sshKeyDelete,
  sshKeySave,
  sshKeyInit,
  sshKeyOnStoreUpdate
};
