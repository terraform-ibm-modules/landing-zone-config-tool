import {
  revision,
  contains,
  eachKey,
  isEmpty,
  transpose,
  eachZone
} from "lazy-z";
import { addVsiEncryptionKey, newF5Vsi } from "../builders.js";
import {
  hasUnfoundVpc,
  setValidSshKeys,
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup
} from "./store.utils.js";

/**
 * initialize f5
 * @param {slzStateStore} slz landing zone store
 */
function f5Init(slz) {
  new revision(slz.store.configDotJson)
    .set("f5_template_data", {
      _no_default: ["tmos_admin_password"],
      _defaults: {
        license_type: "none",
        byol_license_basekey: "null",
        license_host: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        license_username: "null",
        license_unit_of_measure: "hourly",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
        template_version: "20210201",
        app_id: "null",
        phone_home_url: "null",
        do_declaration_url: "null",
        as3_declaration_url: "null",
        ts_declaration_url: "null",
        tgstandby_url: "null",
        tgrefresh_url: "null",
        tgactive_url: "null"
      }
    })
    .set("f5_vsi", []);
}

/**
 * F5 On Store Update Function
 * @param {slzStateStore} slz
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.f5_vsi
 * @param {string} slz.store.configDotJson.f5_vsi.vpc_name
 * @param {string} slz.store.configDotJson.f5_vsi.primary_subnet_name
 * @param {Array<string>} slz.store.configDotJson.f5_vsi.secondary_subnet_names
 * @param {object} slz.store.subnets map of vpc subnets
 */
function f5OnStoreUpdate(slz) {
  slz.store.configDotJson.f5_vsi.forEach(instance => {
    if (hasUnfoundVpc(slz, instance)) {
      // if vpc no longer exists reinitialize fields
      instance.vpc_name = null;
      instance.primary_subnet_name = null;
      [
        "secondary_subnet_names",
        "secondary_subnet_security_group_names",
        "security_groups"
      ].forEach(field => {
        instance[field] = [];
      });
    } else {
      if (
        !contains(
          slz.store.subnets[instance.vpc_name],
          instance.primary_subnet_name
        )
      ) {
        // if not found set primary name to null
        instance.primary_subnet_name = null;
      }
      let foundSecondarySubnets = [];
      // for each secondary subnet
      instance.secondary_subnet_names.forEach(subnet => {
        // if is found, add to found list
        if (contains(slz.store.subnets[instance.vpc_name], subnet)) {
          foundSecondarySubnets.push(subnet);
        }
      });
      // set secondary subnets
      instance.secondary_subnet_names = foundSecondarySubnets;
    }
    setUnfoundEncryptionKey(slz, instance, "boot_volume_encryption_key_name");
    setValidSshKeys(slz, instance);
    setUnfoundResourceGroup(slz, instance);
  });
}

/**
 * save f5 template data
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.f5_template_data
 * @param {object} stateData component state data
 * @param {string=} stateData.tmos_admin_password
 */
function f5TemplateSave(slz, stateData) {
  eachKey(stateData, key => {
    if (key === "tmos_admin_password" && stateData.tmos_admin_password === "") {
      stateData.tmos_admin_password = null;
    } else if (stateData[key] === "") {
      stateData[key] = "null";
    }
  });
  transpose(stateData, slz.store.configDotJson.f5_template_data);
}

/**
 * create f5 vsi deployments across zones
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.ssh_keys
 * @param {Array<string>} slz.store.encryptionKeys
 * @param {string} slz.store.edge_pattern pattern for edge network configuration
 * @param {object} stateData component state data
 * @param {boolean} stateData.useManagement use management vpc
 * @param {number} stateData.zones number of zones
 */
function f5VsiCreate(slz, stateData) {
  let useManagement = stateData.useManagement;
  let zones = stateData.zones;
  slz.store.configDotJson.f5_vsi = [];
  slz.store.f5_on_management = useManagement;
  // add encryption key if not
  if (!contains(slz.store.encryptionKeys, "slz-vsi-volume-key")) {
    addVsiEncryptionKey(slz);
    slz.store.encryptionKeys.push("slz-vsi-volume-key");
  }
  if (isEmpty(slz.store.configDotJson.ssh_keys)) {
    slz.store.configDotJson.ssh_keys.push({
      name: "slz-ssh-key",
      public_key: "<user-determined-value>"
    });
  }
  eachZone(zones || 3, zone => {
    slz.store.configDotJson.f5_vsi.push(
      newF5Vsi(slz.store.edge_pattern, zone, useManagement)
    );
  });
}

/**
 * save f5 vsi deployment configuration
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.f5_vsi
 * @param {string} slz.store.edge_pattern pattern for edge network configuration
 * @param {boolean} slz.store.f5_on_management use management vpc
 * @param {object} stateData component state data
 * @param {number} stateData.zones number of zones
 */
function f5VsiSave(slz, stateData) {
  slz.store.configDotJson.f5_vsi = [];
  eachZone(stateData.zones, zone => {
    slz.store.configDotJson.f5_vsi.push(
      newF5Vsi(
        slz.store.edge_pattern,
        zone,
        slz.store.f5_on_management,
        stateData
      )
    );
  });
}

/**
 * save a single f5 vsi instance
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.f5_vsi
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 * @param {string} stateData.boot_volume_encryption_key_name
 */
function f5InstanceSave(slz, stateData) {
  new revision(slz.store.configDotJson)
    .child("f5_vsi", stateData.name)
    .then(data => {
      data.resource_group = stateData.resource_group;
      data.boot_volume_encryption_key_name =
        stateData.boot_volume_encryption_key_name;
    });
}

export {
  f5Init,
  f5OnStoreUpdate,
  f5TemplateSave,
  f5VsiCreate,
  f5VsiSave,
  f5InstanceSave
};
