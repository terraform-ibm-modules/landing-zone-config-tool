import { splat } from "lazy-z";
import { newDefaultCos } from "./defaults.js";
import {
  pushAndUpdate,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey
} from "./store.utils.js";

/**
 * set cosBuckets and cosKeys in slz store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.cos
 * @param {Function} instanceCallback callback after setting splat
 */
function cosSetStoreBucketsAndKeys(slz, instanceCallback) {
  slz.store.configDotJson.cos.forEach(instance => {
    // add all bucket names from instance to buckets
    slz.store.cosBuckets = slz.store.cosBuckets.concat(
      splat(instance.buckets, "name")
    );
    // add all key names to keys
    slz.store.cosKeys = slz.store.cosKeys.concat(splat(instance.keys, "name"));
    // if callback run callback against instance
    if (instanceCallback) {
      instanceCallback(instance);
    }
  });
}

/**
 * initialize object storage
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 */
function cosInit(slz) {
  slz.store.configDotJson.cos = newDefaultCos();
  cosSetStoreBucketsAndKeys(slz);
}

/**
 * cos on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {Array<object>} slz.store.configDotJson.cos
 * @param {Array<object>} slz.store.configDotJson.cos.buckets
 * @param {string} slz.store.configDotJson.cos.buckets.kms_key
 */
function cosOnStoreUpdate(slz) {
  slz.store.cosInstances = splat(slz.store.configDotJson.cos, "name");
  slz.store.cosBuckets = [];
  slz.store.cosKeys = [];
  cosSetStoreBucketsAndKeys(slz, instance => {
    setUnfoundResourceGroup(slz, instance);
    // for each bucket, if encryption key is not found set to null
    instance.buckets.forEach(bucket => {
      setUnfoundEncryptionKey(slz, bucket);
    });
  });
}

/**
 * create new cos instance
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 */
function cosCreate(slz, stateData) {
  stateData.buckets = [];
  stateData.keys = [];
  pushAndUpdate(slz, "cos", stateData);
}

/**
 * delete a cos instance
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosDelete(slz, stateData, componentProps) {
  carveChild(slz, "cos", componentProps);
}

/**
 * update a cos instance
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosSave(slz, stateData, componentProps) {
  updateChild(slz, "cos", stateData, componentProps);
}

/**
 * create a new cos bucket
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} stateData.showBucket show bucket prop from form
 * @param {object} componentProps props from component form
 */
function cosBucketCreate(slz, stateData, componentProps) {
  delete stateData.showBucket;
  pushToChildField(slz, "cos", "buckets", stateData, componentProps);
}

/**
 * save a cos bucket
 * @param {slzState} slz
 * @param {object} slz.store
 * @param {object} slz.store.configDotJson
 * @param {object} slz.store.configDotJson.atracker
 * @param {string} slz.store.configDotJson.atracker.collector_bucket_name
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name
 */
function cosBucketSave(slz, stateData, componentProps) {
  updateSubChild(slz, "cos", "buckets", stateData, componentProps, slz => {
    if (
      slz.store.configDotJson.atracker.collector_bucket_name ===
      componentProps.data.name
    )
      slz.store.configDotJson.atracker.collector_bucket_name = stateData.name;
  });
}

/**
 * delete a cos bucket
 * @param {slzState} slz
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosBucketDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "cos", "buckets", componentProps);
}

/**
 * create a new cos key
 * @param {slzState} slz
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyCreate(slz, stateData, componentProps) {
  pushToChildField(slz, "cos", "keys", stateData, componentProps);
}

/**
 * save a cos key
 * @param {slzState} slz
 * @param {object} slz.store slz store
 * @param {string} slz.store.atrackerKey atracker key name
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data original object data
 * @param {string} componentProps.data.name key name before update
 */
function cosKeySave(slz, stateData, componentProps) {
  updateSubChild(slz, "cos", "keys", stateData, componentProps, slz => {
    if (slz.store.atrackerKey === componentProps.data.name) {
      slz.store.atrackerKey = stateData.name;
    }
  });
}

/**
 * delete a cos key
 * @param {slzState} slz
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "cos", "keys", componentProps);
}

export {
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete,
  cosBucketDelete,
  cosBucketSave,
  cosBucketCreate,
  cosCreate,
  cosDelete,
  cosSave,
  cosOnStoreUpdate,
  cosInit
};
