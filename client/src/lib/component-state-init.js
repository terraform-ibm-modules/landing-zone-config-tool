/**
 * initialize component state from configdotjson
 * @param {*} componentName
 * @param {Object} componentProps
 * @param {slzStateStore} componentProps.slz
 * @param {Object} componentProps.slz.store
 * @param {Object} componentProps.slz.store.configDotJson
 * @returns {Object} state object
 */

import { newTeleportSg } from "./store/defaults.js";
import {
  defaultToEmptyStringIfValueNull,
  defaultToEmptyStringIfNullString
} from "./store/utils.js";

function stateInit(componentName, componentProps) {
  let stateData = {};
  /**
   * for a list of fields set state data to empty string if null, otherwise direct reference
   * @param {Array<string>} fields fields to check
   * @param {boolean} isArrayObject is array object and not direct config reference
   */
  function ifNullSetToEmptyString(fields, isArrayObject) {
    setEachField(fields, defaultToEmptyStringIfValueNull, isArrayObject);
  }

  /**
   * for a list of fields set state data to empty string if "null", otherwise direct reference
   * @param {Array<string>} fields fields to check
   * @param {boolean} isArrayObject is array object and not direct config reference
   */
  function ifNullStringSetToEmptyString(fields, isArrayObject) {
    setEachField(fields, defaultToEmptyStringIfNullString, isArrayObject);
  }

  /**
   * for a list of fields set state data to empty array if null, otherwise direct reference
   * @param {Array<string>} fields fields to check
   * @param {boolean} isArrayObject is array object and not direct config reference
   */
  function defaultToEmptyArray(fields, isArrayObject) {
    setEachField(
      fields,
      value => {
        if (!value) return [];
        else return value;
      },
      isArrayObject
    );
  }

  /**
   * for each field, set state data to direct reference
   * @param {Array<string>} fields
   * @param {boolean} isArrayObject is array object and not direct config reference
   */
  function directReference(fields, isArrayObject) {
    setEachField(fields, false, isArrayObject);
  }

  /**
   * for each field, set state data to reference
   * @param {Array<string>} fields
   * @param {Function=} replacementFunction function to use to replace data
   * @param {boolean=} isArrayObject is array object and not direct config reference
   */
  function setEachField(fields, replacementFunction, isArrayObject) {
    fields.forEach(key => {
      let componentPropsField = "data";
      let keyData = isArrayObject
        ? componentProps[componentPropsField][key]
        : componentProps.slz.store.configDotJson[componentName][key];
      if (replacementFunction) {
        stateData[key] = replacementFunction(keyData);
      } else {
        stateData[key] = keyData;
      }
    });
  }
  if (componentName === "transit_gateway") {
    [
      "transit_gateway_resource_group",
      "transit_gateway_connections",
      "enable_transit_gateway"
    ].forEach(key => {
      stateData[key] = componentProps.slz.store.configDotJson[key];
    });
  } else if (componentName === "teleport_config") {
    // direct reference fields
    directReference([
      "teleport_license",
      "https_cert",
      "https_key",
      "domain",
      "teleport_version",
      "hostname",
      "claims_to_roles",
      "cos_bucket_name",
      "cos_key_name",
      "app_id_key_name",
      "claims_to_roles"
    ]);
    ifNullSetToEmptyString(["message_of_the_day"]);
  } else if (componentName === "secrets_manager") {
    ifNullSetToEmptyString([
      "kms_key_name",
      "resource_group",
      "use_secrets_manager",
      "name"
    ]);
  } else if (componentName === "f5_vsi") {
    if (componentProps.slz.store.configDotJson.f5_vsi.length === 0) {
      stateData.f5_image_name = "";
      stateData.resource_group = "";
      stateData.ssh_keys = [];
      stateData.machine_type = "";
      stateData.zones = "";
    } else {
      stateData.f5_image_name =
        componentProps.slz.store.configDotJson.f5_vsi[0].f5_image_name;
      stateData.resource_group =
        componentProps.slz.store.configDotJson.f5_vsi[0].resource_group;
      stateData.ssh_keys =
        componentProps.slz.store.configDotJson.f5_vsi[0].ssh_keys;
      stateData.machine_type =
        componentProps.slz.store.configDotJson.f5_vsi[0].machine_type;
      stateData.zones = componentProps.slz.store.configDotJson.f5_vsi.length;
    }
  } else if (componentName === "f5_template_data") {
    directReference(["tmos_admin_password"]);
    ifNullStringSetToEmptyString([
      "app_id",
      "as3_declaration_url",
      "byol_license_basekey",
      "do_declaration_url",
      "license_host",
      "license_password",
      "license_pool",
      "license_sku_keyword_1",
      "license_sku_keyword_2",
      "license_type",
      "license_unit_of_measure",
      "license_username",
      "phone_home_url",
      "template_source",
      "template_version",
      "tgactive_url",
      "tgrefresh_url",
      "tgstandby_url",
      "ts_declaration_url"
    ]);
  } else if (componentName === "atracker") {
    directReference(["resource_group", "collector_bucket_name", "add_route"]);
    stateData.atracker_key = componentProps.slz.store.atrackerKey;
  } else if (componentName === "appid") {
    ifNullSetToEmptyString(["name", "resource_group"]);
    directReference(["use_appid", "use_data", "keys"]);
  } else if (componentName === "vsi") {
    ifNullSetToEmptyString(
      [
        "name",
        "image_name",
        "machine_type",
        "resource_group",
        "vpc_name",
        "boot_volume_encryption_key_name",
        "user_data",
        "subnet_name"
      ],
      true
    );
    defaultToEmptyArray(["security_groups", "subnet_names", "ssh_keys"], true);
    directReference(["enable_floating_ip", "vsi_per_subnet"], true);

    // set default vsi per subnet
    if (typeof componentProps.data.vsi_per_subnet !== "number") {
      stateData.vsi_per_subnet = 1;
    }

    // initialize teleport sg if unfound and teleport
    if (componentProps.isTeleport && componentProps.isModal) {
      stateData.security_group = newTeleportSg();
    } else {
      directReference(["security_group"], true);
    }
  } else if (componentName === "vpn_gateway") {
    ifNullSetToEmptyString(
      ["resource_group", "name", "subnet_name", "vpc_name"],
      true
    );
    if (
      componentProps.data.subnet_name !== null &&
      !componentProps.data.vpc_name
    ) {
      stateData.subnet_name = "";
    }
    stateData.connections = [];
  } else if (
    componentName === "encryption_key" ||
    componentName === "kms_key"
  ) {
    directReference(["name", "root_key", "force_delete"], true);
    if (stateData.force_delete === null) {
      stateData.force_delete = false;
    }
    stateData.interval_month =
      componentProps.data.policies.rotation.interval_month;
  } else if (componentName === "clusters") {
    directReference(
      [
        "entitlement",
        "kube_type",
        "kube_version",
        "operating_system",
        "machine_type",
        "name",
        "subnet_names",
        "worker_pools",
        "workers_per_subnet"
      ],
      true
    );
    ifNullSetToEmptyString(["cos_name", "vpc_name", "resource_group"], true);
    if (componentProps.data.kms_config.crk_name === null) {
      stateData.kms_config = {
        private_endpoint: true,
        crk_name: ""
      };
    } else {
      stateData.kms_config = {
        private_endpoint: true,
        crk_name: "" + componentProps.data.kms_config.crk_name
      };
    }
  } else if (componentName === "networking_rule") {
    stateData.ruleProtocol = componentProps.data.ruleProtocol || "all";
    stateData.showDeleteModal = false;
    if (componentProps.isSecurityGroup)
      ifNullSetToEmptyString(["name", "direction", "source", "rule"], true);
    else
      ifNullSetToEmptyString(
        ["name", "action", "direction", "source", "destination", "rule"],
        true
      );
  } else {
    return componentProps.data;
  }
  return stateData;
}

export { stateInit };
