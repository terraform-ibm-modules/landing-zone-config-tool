import { revision, contains, splat, transpose } from "lazy-z";
import { newDefaultWorkloadCluster } from "./defaults.js";
import {
  pushAndUpdate,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild,
  hasUnfoundVpc,
  deleteUnfoundSubnets
} from "./store.utils.js";

/**
 * initialize cluster
 * @param {slzStateStore} slz landing zone store
 */
function clusterInit(slz) {
  slz.store.configDotJson.clusters = [newDefaultWorkloadCluster()];
}

/**
 * on update function for cluster
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.cos object storage instances
 * @param {Array<object>} slz.store.configDotJson.clusters clusters
 * @param {string} slz.store.configDotJson.clusters.cos_name name of instance for openshift clusters
 * @param {object} slz.store.configDotJson.clusters.kms_config object for kms encryption
 * @param {string} slz.store.configDotJson.clusters.kms_config.crk_name name of the encryption key
 * @param {string} slz.store.configDotJson.clusters.vpc_name name of vpc
 * @param {Array<string>} slz.store.configDotJson.clusters.subnet_names name of subnets for cluster
 * @param {Array<object>} slz.store.configDotJson.clusters.worker_pools worker pools
 * @param {string} slz.store.configDotJson.clusters.worker_pools.vpc_name vpc name for worker pools
 * @param {Array<string>} slz.store.configDotJson.clusters.worker_pools.subnet_names name of subnets
 * @param {Array<string>} slz.store.vpcList list of VPC names
 */
function clusterOnStoreUpdate(slz) {
  slz.store.configDotJson.clusters.forEach(cluster => {
    let allCosInstances = splat(slz.store.configDotJson.cos, "name");
    if (cluster.cos_name && !contains(allCosInstances, cluster.cos_name)) {
      cluster.cos_name = null;
    }
    setUnfoundEncryptionKey(slz, cluster.kms_config, "crk_name");
    setUnfoundResourceGroup(slz, cluster);
    // update vpc
    if (hasUnfoundVpc(slz, cluster)) {
      cluster.vpc_name = null;
      cluster.subnet_names = [];
      cluster.worker_pools.forEach(pool => {
        pool.vpc_name = null;
        pool.subnet_names = [];
      });
    } else {
      // otherwise check for valid subnets
      let vpcSubnets = slz.store.subnets[cluster.vpc_name];
      // delete cluster subnets
      cluster.subnet_names = deleteUnfoundSubnets(
        vpcSubnets,
        cluster.subnet_names
      );
      // delete worker pool subnets
      cluster.worker_pools.forEach(pool => {
        pool.subnet_names = deleteUnfoundSubnets(vpcSubnets, pool.subnet_names);
      });
    }
  });
}

/**
 * create new cluster
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} stateData.cluster cluster object
 */
function clusterCreate(slz, stateData) {
  pushAndUpdate(slz, "clusters", stateData.cluster);
}

/**
 * update cluster
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} stateData.cluster cluster object
 * @param {string} stateData.cluster.vpc_name name of vpc for cluster
 * @param {Array<object>} stateData.cluster.worker_pools worker pools
 * @param {string} stateData.cluster.worker_pools.vpc_name vpc name for worker pools
 * @param {Array<string>} stateData.cluster.worker_pools.subnet_names name of subnets
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data original data before update
 */
function clusterSave(slz, stateData, componentProps) {
  // if changing vpc name, set cluster pools to new vpc name and
  // remove pool subnet names
  if (stateData.cluster.vpc_name !== componentProps.data.vpc_name) {
    stateData.cluster.worker_pools.forEach(pool => {
      pool.vpc_name = stateData.cluster.vpc_name;
      pool.subnet_names = [];
    });
  }
  updateChild(slz, "clusters", stateData.cluster, componentProps);
}

/**
 * delete cluster
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterDelete(slz, stateData, componentProps) {
  carveChild(slz, "clusters", componentProps);
}

/**
 * create cluster worker pool
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolCreate(slz, stateData, componentProps) {
  let newPool = { subnet_names: [] };
  new revision(slz.store.configDotJson)
    .child("clusters", componentProps.arrayParentName) // get slz cluster
    .then(data => {
      // set vpc name and flavor from parent cluster
      newPool.vpc_name = data.vpc_name;
      newPool.flavor = data.machine_type;
      transpose(stateData.pool, newPool);
      pushToChildField(
        slz,
        "clusters",
        "worker_pools",
        newPool,
        componentProps
      );
    });
}

/**
 * save cluster worker pool
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolSave(slz, stateData, componentProps) {
  updateSubChild(
    slz,
    "clusters",
    "worker_pools",
    stateData.pool,
    componentProps
  );
}

/**
 * delete cluster worker pool
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolDelete(slz, stateData, componentProps) {
  deleteSubChild(slz, "clusters", "worker_pools", componentProps);
}

export {
  clusterInit,
  clusterOnStoreUpdate,
  clusterCreate,
  clusterSave,
  clusterDelete,
  clusterWorkerPoolCreate,
  clusterWorkerPoolSave,
  clusterWorkerPoolDelete
};
