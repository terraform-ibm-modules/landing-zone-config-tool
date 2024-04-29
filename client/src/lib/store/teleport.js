import { contains, revision, transpose } from "lazy-z";
import { newTeleportConfig } from "../builders.js";
import { getCosKeysFromBucket } from "../form-utils.js";

/**
 * initialize teleport config
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function teleportInit(slz) {
  slz.store.configDotJson.teleport_config = newTeleportConfig();
}

/**
 * teleport on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} slz.store.configDotJson.appid
 * @param {boolean} slz.store.configDotJson.appid.use_appid
 * @param {Array<string>} slz.store.configDotJson.appid.keys
 * @param {object} slz.store.configDotJson.teleport_config
 * @param {string} slz.store.configDotJson.teleport_config.app_id_key_name
 * @param {string} slz.store.configDotJson.teleport_config.cos_bucket_name
 * @param {string} slz.store.configDotJson.teleport_config.cos_key_name
 * @param {boolean} slz.store.enableTeleport
 * @param {Array<string>} slz.store.cosBuckets
 */
function teleportOnStoreUpdate(slz) {
  // if key doesn't exist or appid is disabled remove key
  if (
    slz.store.configDotJson.appid.use_appid === false ||
    !contains(
      slz.store.configDotJson.appid.keys,
      slz.store.configDotJson.teleport_config.app_id_key_name
    )
  ) {
    slz.store.configDotJson.teleport_config.app_id_key_name = null;
  }

  // if teleport is enabled and a cos key is deleted, set bucket and key name to null
  if (slz.store.enableTeleport) {
    if (
      !contains(
        slz.store.cosBuckets,
        slz.store.configDotJson.teleport_config.cos_bucket_name
      )
    ) {
      slz.store.configDotJson.teleport_config.cos_bucket_name = null;
      slz.store.configDotJson.teleport_config.cos_key_name = null;
    } else if (
      !contains(
        getCosKeysFromBucket(slz.store.configDotJson, { slz: slz }),
        slz.store.configDotJson.teleport_config.cos_key_name
      )
    ) {
      slz.store.configDotJson.teleport_config.cos_key_name = null;
    }
  }
}

/**
 * update teleport config
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} slz.store.configDotJson.appid
 * @param {boolean} slz.store.configDotJson.appid.use_appid
 * @param {boolean} slz.store.enableTeleport
 * @param {object} stateData component state data
 * @param {object} stateData.teleport_config
 * @param {boolean} stateData.enableTeleport
 * @param {object} componentProps props from component form
 */
function teleportSave(slz, stateData) {
  // check to see if appid is not enabled;
  let teleportConfigData = stateData.teleport_config;
  if (slz.store.configDotJson.appid.use_appid === false) {
    teleportConfigData.app_id_key_name = null;
  } else if (slz.store.enableTeleport && stateData.enableTeleport === false) {
    slz.store.enableTeleport = false;
  } else {
    slz.store.enableTeleport = true;
  }
  if (slz.store.enableTeleport === false) {
    new revision(slz.store.configDotJson).set(
      "teleport_config",
      newTeleportConfig()
    );
    slz.store.configDotJson.teleport_vsi = [];
  } else {
    transpose(
      teleportConfigData || newTeleportConfig(),
      slz.store.configDotJson.teleport_config
    );
  }
}

/**
 * create teleport claim to roles
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {string} stateData.email
 * @param {string} stateData.roles
 * @param {object} componentProps props from component form
 */
function teleportClaimsToRolesCreate(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child("teleport_config")
    .child("claims_to_roles")
    .push({
      email: stateData.email,
      roles: stateData.roles || ["teleport-admin"]
    });
}

/**
 * update teleport claim to roles
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {string} stateData.email
 * @param {string} stateData.roles
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.email
 */

function teleportClaimsToRolesSave(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child("teleport_config")
    .child("claims_to_roles", componentProps.data.email, "email")
    .update({
      email: stateData.email,
      roles: stateData.roles
    });
}

/**
 * delete teleport claim to roles
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} slz.store.configDotJson.teleport_config
 * @param {Array<object>} slz.store.configDotJson.teleport_config.claims_to_roles
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.email
 */
function teleportClaimsToRolesDelete(slz, stateData, componentProps) {
  new revision(
    slz.store.configDotJson.teleport_config.claims_to_roles
  ).deleteArrChild(componentProps.data.email, "email");
}

export {
  teleportInit,
  teleportOnStoreUpdate,
  teleportSave,
  teleportClaimsToRolesCreate,
  teleportClaimsToRolesSave,
  teleportClaimsToRolesDelete
};
