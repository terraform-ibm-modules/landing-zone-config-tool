import { eachKey, contains, deepEqual } from "lazy-z";
import { stateInit } from "./component-state-init.js";
import { subnetTierHasValueFromSubnets } from "./lib-utils.js";

const ignoreFields = [
  "worker_pools",
  "encrypted_nonce",
  "endpoint",
  "iv_value",
  "key_ring",
  "payload",
  "endpoint_type"
];

/**
 * Checks if component props are different from the state
 * @param {string} componentName
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns
 */
function propsMatchState(componentName, stateData, componentProps) {
  if (componentProps.isModal) {
    return true;
  } else {
    let expectedData = stateInit(componentName, componentProps);
    let actualData = stateData;
    if (componentName === "clusters") {
      actualData = actualData.cluster;
    } else if (componentName === "worker_pools") {
      actualData = actualData.pool;
    } else if (componentName === "cos_keys") {
      actualData = {
        name: stateData.name,
        role: stateData.role,
        enable_HMAC: stateData.enable_HMAC
      };
      expectedData = componentProps.data;
    } else if (componentName === "subnetTiers") {
      expectedData = componentProps.tier;
      expectedData.addPublicGateway = subnetTierHasValueFromSubnets(
        componentProps.slz,
        componentProps.vpc_name,
        componentProps.tier.name,
        "public_gateway"
      );
      expectedData.networkAcl = subnetTierHasValueFromSubnets(
        componentProps.slz,
        componentProps.vpc_name,
        componentProps.tier.name,
        "acl_name"
      );
    } else if (componentName === "subnet") {
      expectedData = componentProps.subnet;
    } else if (componentName === "teleport_config") {
      actualData = stateData.teleport_config;
    } else if (componentName === "virtual_private_endpoints") {
      actualData.vpe.vpcs = [];
      eachKey(actualData.vpcData, key => {
        actualData.vpe.vpcs.push({
          name: key,
          security_group_name: actualData.vpcData[key].security_group_name,
          subnets: actualData.vpcData[key].subnets
        });
      });
      actualData = actualData.vpe;
    } else if (componentName === "f5_vsi_config") {
      expectedData = componentProps;
      actualData = {
        resource_group: stateData.resource_group,
        boot_volume_encryption_key_name:
          actualData.boot_volume_encryption_key_name,
        zones: stateData.zones,
        ssh_keys: stateData.ssh_keys,
        f5_image_name: stateData.f5_image_name,
        machine_type: stateData.machine_type
      };
      expectedData = {
        resource_group: componentProps.data.resource_group,
        boot_volume_encryption_key_name:
          componentProps.data.boot_volume_encryption_key_name,
        zones: componentProps.data.zones,
        ssh_keys: componentProps.data.ssh_keys,
        f5_image_name: componentProps.data.f5_image_name,
        machine_type: componentProps.data.machine_type
      };
    } else if (componentName === "f5_vsi") {
      expectedData = componentProps;
      actualData = {
        resource_group: stateData.resource_group,
        boot_volume_encryption_key_name:
          actualData.boot_volume_encryption_key_name
      };
      expectedData = {
        resource_group: componentProps.data.resource_group,
        boot_volume_encryption_key_name:
          componentProps.data.boot_volume_encryption_key_name
      };
    } else if (componentName === "key_management") {
      expectedData = {};
      eachKey(componentProps.slz.store.configDotJson.key_management, key => {
        if (key !== "keys") {
          expectedData[key] =
            componentProps.slz.store.configDotJson.key_management[key];
        }
      });
    } else if (componentName === "iam_account_settings") {
      expectedData =
        componentProps.slz.store.configDotJson.iam_account_settings;
    } else if (componentName === "networking_rule") {
      expectedData = componentProps.isSecurityGroup
        ? {
            direction: componentProps.data.direction,
            name: componentProps.data.name,
            rule: componentProps.data.rule,
            ruleProtocol: componentProps.data.ruleProtocol,
            source: componentProps.data.source
          }
        : {
            action: componentProps.data.action,
            destination: componentProps.data.destination,
            direction: componentProps.data.direction,
            name: componentProps.data.name,
            rule: componentProps.data.rule,
            ruleProtocol: componentProps.data.ruleProtocol,
            source: componentProps.data.source
          };
    }
    let actualDeepEqualTestData = {};
    let expectedDeepEqualTestData = {};
    eachKey(expectedData, key => {
      if (!contains(ignoreFields, key)) {
        actualDeepEqualTestData[key] = actualData[key];
        expectedDeepEqualTestData[key] = expectedData[key];
      }
    });
    // dev mode
    // console.log(actualDeepEqualTestData, expectedDeepEqualTestData);
    // console.log(deepEqual(actualDeepEqualTestData, expectedDeepEqualTestData));
    return deepEqual(actualDeepEqualTestData, expectedDeepEqualTestData);
  }
}

export { propsMatchState };
