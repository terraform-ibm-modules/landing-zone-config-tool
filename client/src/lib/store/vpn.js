import { contains, transpose } from "lazy-z";
import {
  setUnfoundResourceGroup,
  hasUnfoundVpc,
  pushAndUpdate,
  updateChild,
  carveChild
} from "./store.utils.js";

/**
 * initialize vpn gateway
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function vpnInit(slz) {
  slz.store.configDotJson.vpn_gateways = [
    {
      connections: [],
      name: "management-gateway",
      resource_group: "management-rg",
      subnet_name: "vpn-zone-1",
      vpc_name: "management"
    }
  ];
}

/**
 * on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpn_gateways
 */
function vpnOnStoreUpdate(slz) {
  slz.store.configDotJson.vpn_gateways.forEach(gateway => {
    if (hasUnfoundVpc(slz, gateway)) {
      // if the vpc no longer exists, set vpc and subnet to null
      gateway.vpc_name = null;
      gateway.subnet_name = null;
    } else if (
      !contains(slz.store.subnets[gateway.vpc_name], gateway.subnet_name)
    ) {
      // if subnet does not exist but vpc does set to null
      gateway.subnet_name = null;
    }
    setUnfoundResourceGroup(slz, gateway);
  });
}

/**
 * create a new vpn gateway
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 */
function vpnCreate(slz, stateData) {
  let vpn = { connections: [], resource_group: null };
  transpose(stateData, vpn);
  pushAndUpdate(slz, "vpn_gateways", vpn);
}

/**
 * update existing vpn gateway
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnSave(slz, stateData, componentProps) {
  updateChild(slz, "vpn_gateways", stateData, componentProps);
}

/**
 * delete vpn gateway
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnDelete(slz, stateData, componentProps) {
  carveChild(slz, "vpn_gateways", componentProps);
}

export {
  vpnInit,
  vpnOnStoreUpdate,
  vpnCreate,
  vpnSave,
  vpnDelete
};
