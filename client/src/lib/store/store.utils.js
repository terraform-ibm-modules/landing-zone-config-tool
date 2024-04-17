import { contains, revision, carve } from "lazy-z";

/**
 * push to a top level array of object and update
 * @param {slzStateStore} slz
 * @param {string} field name of array to update (ex. vpcs)
 * @param {object} data arbitrary data
 */
function pushAndUpdate(slz, field, data) {
  slz.store.configDotJson[field].push(data);
}

/**
 * update an object from an array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 */
function updateChild(slz, field, stateData, componentProps) {
  new revision(slz.store.configDotJson).updateChild(
    field,
    componentProps.data.name,
    stateData
  );
}

/**
 * remove an array item from array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function carveChild(slz, field, componentProps) {
  carve(slz.store.configDotJson[field], "name", componentProps.data.name);
}

/**
 * push to an array of objects within an array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function pushToChildField(slz, field, subField, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child(field, componentProps.arrayParentName)
    .data[subField].push(stateData);
}

/**
 * update an object within an array of objects in an array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data before update
 * @param {string} componentProps.data.name name of object
 * @param {Function=} callback callback for slz data to run after object update
 */
function updateSubChild(
  slz,
  field,
  subField,
  stateData,
  componentProps,
  callback
) {
  new revision(slz.store.configDotJson)
    .child(field, componentProps.arrayParentName)
    .updateChild(subField, componentProps.data.name, stateData)
    .then(() => {
      if (callback) callback(slz);
    });
}

/**
 * delete an object from an array of objects within an array of objects
 * @param {slzStateStore} slz landing zone store
 * @param {string} field top level field name (ex. vpcs)
 * @param {string} subField name of the field within the parent object
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child is stored
 * @param {object} componentProps.data object data
 * @param {string} componentProps.data.name name of object
 */
function deleteSubChild(slz, field, subField, componentProps) {
  new revision(slz.store.configDotJson)
    .child(field, componentProps.arrayParentName)
    .child(subField)
    .deleteArrChild(componentProps.data.name);
}

/**
 * set unfound data from store to null
 * @param {string} storeField name of field in store
 * @param {slzStateStore} slz landing zone store
 * @param {object} obj arbitrary object
 * @param {string} objectField name of the field withon object to check
 */
function setUnfound(storeField, slz, obj, objectField) {
  if (!contains(slz.store[storeField], obj[objectField])) {
    obj[objectField] = null;
  }
}

/**
 * set unfound resource group to null
 * @param {slzStateStore} slz landing zone store
 * @param {object} obj arbitrary object
 */
function setUnfoundResourceGroup(slz, obj) {
  setUnfound("resourceGroups", slz, obj, "resource_group");
}

/**
 * set unfound encryption key to null
 * @param {slzStateStore} slz landing zone store
 * @param {object} obj arbitrary object
 * @param {string=} overrideField use key other than "kms_key"
 */
function setUnfoundEncryptionKey(slz, obj, overrideField) {
  setUnfound("encryptionKeys", slz, obj, overrideField || "kms_key");
}

/**
 * check if a component has an unfound vpc
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {Array<string>} slz.store.vpcList list of vpcs
 * @param {object} obj arbitrary object
 * @param {string} obj.vpc_name name of vpc
 * @returns {boolean} true if not found
 */
function hasUnfoundVpc(slz, obj) {
  return contains(slz.store.vpcList, obj.vpc_name) === false;
}

/**
 * set object ssh keys value to remove all invalid keys
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {Array<string>} slz.store.sshKeys list of ssh keys
 * @param {object} obj arbitrary object
 * @param {Array<string>} obj.ssh_keys list of ssh keys
 */
function setValidSshKeys(slz, obj) {
  let sshKeys = [];
  obj.ssh_keys.forEach(key => {
    if (contains(slz.store.sshKeys, key)) sshKeys.push(key);
  });
  obj.ssh_keys = sshKeys;
}

/**
 * delete subnets missing from store
 * @param {Array<string>} sourceSubnets list of subnets in state
 * @param {Array<string>} childSubnets list of subnets in component
 */
function deleteUnfoundSubnets(sourceSubnets, childSubnets) {
  let newSubnets = [];
  childSubnets.forEach(subnet => {
    if (contains(sourceSubnets, subnet)) newSubnets.push(subnet);
  });
  return newSubnets;
}

export {
  setValidSshKeys,
  pushAndUpdate,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  hasUnfoundVpc,
  deleteUnfoundSubnets
};
