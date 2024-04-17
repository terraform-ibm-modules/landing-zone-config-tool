import pkg from "lazy-z";
const { contains, transpose, revision, buildNetworkingRule } = pkg;
import { newDefaultManagementServer, newTeleportSg } from "./defaults.js";
import {
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup,
  hasUnfoundVpc,
  pushAndUpdate,
  updateChild,
  carveChild
} from "./store.utils.js";
import { formatNetworkingRule, updateNetworkingRule } from "./utils.js";

/**
 * initialize vsi
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function vsiInit(slz) {
  slz.store.configDotJson.vsi = [newDefaultManagementServer()];
  slz.store.configDotJson.teleport_vsi = [];
}

/**
 * update vsi based on key
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} slz.store.subnets map of subnets
 * @param {string} key field to lookup
 */
function updateVsi(slz, key) {
  // get data based on key
  new revision(slz.store.configDotJson).child(key).then(data => {
    // for each deployment
    data.forEach(deployment => {
      let validVpc = hasUnfoundVpc(slz, deployment) === false;
      setUnfoundEncryptionKey(
        slz,
        deployment,
        "boot_volume_encryption_key_name"
      );
      setUnfoundResourceGroup(slz, deployment);
      // if teleport vsi and vpc is valid
      if (validVpc && key === "teleport_vsi") {
        if (
          !contains(
            slz.store.subnets[deployment.vpc_name],
            deployment.subnet_name
          )
        ) {
          deployment.subnet_name = null;
        }
      } else if (!validVpc) {
        deployment.vpc_name = null;
        if (key === "teleport_vsi") deployment.subnet_name = null;
        else deployment.subnet_names = [];
      }
    });
  });
}

/**
 * vsi on store update
 * @param {object} slz.store state store
 **/
function vsiOnStoreUpdate(slz) {
  // ["teleport_vsi", "vsi"].forEach(key => {
  //   updateVsi(slz, key);
  // });
  updateVsi(slz, "vsi");
}

/**
 * create a new vsi deployment
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {Array<string>} stateData.ssh_keys
 * @param {string} stateData.vpc_name
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiCreate(slz, stateData, componentProps) {
  // default vsi security group
  let defaultVsiSecurityGroup = componentProps.isTeleport
    ? newTeleportSg()
    : {
        name: stateData.name + "-sg",
        rules: []
      };
  stateData.security_group = defaultVsiSecurityGroup;
  // default vsi values
  let defaultVsi = {
    name: null,
    machine_type: null,
    image_name: null,
    security_group: defaultVsiSecurityGroup,
    resource_group: null,
    ssh_keys: stateData.ssh_keys || [], // or is placeholder, no vsi should be created without ssh key
    vpc_name: stateData.vpc_name,
    boot_volume_encryption_key_name: null,
    user_data: null,
    vsi_per_subnet: null,
    enable_floating_ip: false,
    security_groups: []
  };
  // if overriding key
  if (componentProps.isTeleport) {
    defaultVsi.subnet_name = null; // set subnet name to null for teleport / f5
    // delete vsi only fields and set security group name
    delete defaultVsi.user_data;
    delete defaultVsi.vsi_per_subnet;
    delete defaultVsi.enable_floating_ip;
    defaultVsi.security_group.name = stateData.name + "-sg";
  } else {
    defaultVsi.subnet_names = [];
  }
  transpose(stateData, defaultVsi);
  if (componentProps.isTeleport) delete defaultVsi.hideSecurityGroup;
  pushAndUpdate(
    slz,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    defaultVsi
  );
}

/**
 * save vsi deployment
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {boolean} stateData.hideSecurityGroup
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiSave(slz, stateData, componentProps) {
  delete stateData.hideSecurityGroup;
  updateChild(
    slz,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    stateData,
    componentProps
  );
}

/**
 * delete vsi deployment
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiDelete(slz, stateData, componentProps) {
  carveChild(
    slz,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    componentProps
  );
}

/**
 * update vsi security group
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} stateData.security_group
 * @param {string} stateData.security_group.name name for security group
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name name of vsi
 */
function vsiSecurityGroupSave(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child(
      componentProps.isTeleport ? "teleport_vsi" : "vsi",
      componentProps.data.name
    )
    .then(data => {
      data.security_group.name = stateData.security_group.name;
    });
}

/**
 * create vsi security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 * @param {string} componentProps.vsiName vsi name
 */

function vsiSecurityGroupRuleCreate(slz, stateData, componentProps) {
  let networkRule = stateData;
  stateData.inbound = stateData.direction === "inbound" ? true : false;
  stateData.allow = stateData.action === "allow" ? true : false;
  formatNetworkingRule(slz, networkRule, componentProps);
  // new revision
  new revision(slz.store.configDotJson)
    .child(
      componentProps.isTeleport ? "teleport_vsi" : "vsi",
      componentProps.vsiName
    ) // get vsi
    .child("security_group") // get sg
    .child("rules") // get rules
    .push(buildNetworkingRule(networkRule)); // add
}

/**
 * update vsi security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 * @param {string} componentProps.vsiName vsi name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name name of rule to update
 */

function vsiSecurityGroupRuleSave(slz, stateData, componentProps) {
  let networkRule = stateData;
  formatNetworkingRule(slz, networkRule, componentProps);
  new revision(slz.store.configDotJson)
    .child(
      componentProps.isTeleport ? "teleport_vsi" : "vsi",
      componentProps.vsiName
    ) // get vsi
    .child("security_group") // get sg
    .child("rules", componentProps.data.name) // get rule
    .then(data => {
      // update rule and update slz
      updateNetworkingRule(false, data, networkRule);
    });
}

/**
 * delete vsi security group rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 * @param {string} componentProps.vsiName vsi name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name name of rule to update
 */

function vsiSecurityGroupRuleDelete(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child(
      componentProps.isTeleport ? "teleport_vsi" : "vsi",
      componentProps.vsiName
    ) // get vsi
    .child("security_group") // get group
    .child("rules") // get rules
    .deleteArrChild(componentProps.data.name); // delete rule
}

export {
  vsiSecurityGroupSave,
  vsiSecurityGroupRuleCreate,
  vsiSecurityGroupRuleDelete,
  vsiSecurityGroupRuleSave,
  vsiOnStoreUpdate,
  vsiSave,
  vsiDelete,
  vsiCreate,
  vsiInit
};
