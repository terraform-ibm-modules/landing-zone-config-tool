import { newDefaultVpe } from "./defaults.js";
import {
  splatContains,
  eachKey,
  containsKeys,
  revision,
  contains,
  carve
} from "lazy-z";
import { deleteUnfoundSubnets, pushAndUpdate } from "./store.utils.js";

/**
 * initialize vpe
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function vpeInit(slz) {
  slz.store.configDotJson.virtual_private_endpoints = newDefaultVpe();
}

/**
 * on store update vpe
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function vpeOnStoreUpdate(slz) {
  slz.store.configDotJson.virtual_private_endpoints.forEach(vpe => {
    let newVpcs = []; // update list of vpcs
    // for each vpc
    vpe.vpcs.forEach(vpc => {
      // vpc is still in state
      let vpcExists = splatContains(
        slz.store.configDotJson.vpcs,
        "prefix",
        vpc.name
      );

      // security group is no longer in state
      let securityGroupDoesNotExist =
        containsKeys(slz.store.securityGroups, vpc.name) &&
        !contains(slz.store.securityGroups[vpc.name], vpc.security_group_name);

      // if the vpc is in names
      if (vpcExists) {
        // delete unfound subnets and add to list
        vpc.subnets = deleteUnfoundSubnets(
          slz.store.subnets[vpc.name],
          vpc.subnets
        );
        newVpcs.push(vpc);
      }

      // if no security group set to null
      if (securityGroupDoesNotExist) {
        vpc.security_group_name = null;
      }
    });
    // set vpe to list
    vpe.vpcs = newVpcs;
    slz.updateUnfoundResourceGroup(vpe);
  });
}

/**
 * handle create vpe object in store
 * @param {Object} stateData vpe state data
 * @param {Object} stateData.vpe vpe object
 * @param {string} stateData.vpe.service_name name of vpe service
 * @param {string} stateData.vpe.resource_group resource group
 * @param {string} stateData.vpe.service_type service catalog name (ex. cloud-object-storage)
 * @param {Array<Object>} stateData.vpe.vpcs list of vpcs
 * @param {Object} stateData.vpcData map of vpc data where each key points to the value of a vpc object to store in vpe.vpcs
 * @param {Object} componentProps
 */
function vpeCreate(slz, stateData) {
  let vpe = stateData.vpe; // vpe object
  vpe.vpcs = []; // vpcs array
  let vpcData = stateData.vpcData; // vpc data
  // for each vpc in the data
  eachKey(vpcData, vpc => {
    // create vpc
    let newVpc = {
      name: vpc,
      subnets: vpcData[vpc].subnets,
      security_group_name: vpcData[vpc].security_group_name
    };
    vpe.vpcs.push(newVpc);
  });
  pushAndUpdate(slz, "virtual_private_endpoints", vpe);
}

/**
 * @param {slzStateStore} slz state store
 * @param {Object} stateData vpe state data
 * @param {Object} stateData.vpe vpe object
 * @param {string} stateData.vpe.service_name name of vpe service
 * @param {string} stateData.vpe.resource_group resource group
 * @param {string} stateData.vpe.service_type service catalog name (ex. cloud-object-storage)
 * @param {Array<Object>} stateData.vpe.vpcs list of vpcs
 * @param {Object} stateData.vpcData map of vpc data where each key points to the value of a vpc object to store in vpe.vpcs
 * @param {Object} componentProps vpe form props
 * @param {Object} componentProps.data vpe from props
 * @param {string} componentProps.data.service_name original name of service used to update data in place
 */
function vpeSave(slz, stateData, componentProps) {
  let vpe = stateData.vpe;
  // update each vpe vpc
  new revision(vpe).updateEachChild("vpcs", child => {
    // set subnets from vpc data object
    child.subnets = stateData.vpcData[child.name].subnets;
    // ser security group from vpc data object
    child.security_group_name =
      stateData.vpcData[child.name].security_group_name;
    // if security group is empty string, set to null
    if (child.security_group_name === "") {
      child.security_group_name = null;
    }
  });
  new revision(slz.store.configDotJson)
    .updateChild(
      "virtual_private_endpoints",
      componentProps.data.service_name,
      "service_name",
      vpe
    )
}

/**
 * handle delete vpe object from store
 * @param {slzStateStore} slz state store
 * @param {Object} stateData vpe state data
 * @param {Object} componentProps vpe form props
 * @param {Object} componentProps.data vpe from props
 * @param {string} componentProps.data.service_name original name of service used to delete object
 */
function vpeDelete(slz, stateData, componentProps) {
  carve(
    slz.store.configDotJson.virtual_private_endpoints,
    "service_name",
    componentProps.data.service_name
  );
}

export {
  vpeInit,
  vpeOnStoreUpdate,
  vpeCreate,
  vpeSave,
  vpeDelete
};
