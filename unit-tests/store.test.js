import { assert } from "chai";
import { contains, splat } from "lazy-z";
import { slzState as state } from "../client/src/lib/state.js";
const defaultWorkloadCluster = {
  cos_name: "cos",
  entitlement: "cloud_pak",
  kube_type: "openshift",
  kube_version: "default",
  machine_type: "bx2.16x64",
  name: "workload-cluster",
  resource_group: "workload-rg",
  kms_config: {
    crk_name: "slz-roks-key",
    private_endpoint: true,
  },
  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
  vpc_name: "workload",
  worker_pools: [
    {
      entitlement: "cloud_pak",
      flavor: "bx2.16x64",
      name: "logging-worker-pool",
      subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
      vpc_name: "workload",
      workers_per_subnet: 2,
    },
  ],
  workers_per_subnet: 2,
};
const defaultManagementCluster = {
  cos_name: "cos",
  entitlement: "cloud_pak",
  kube_type: "openshift",
  kube_version: "default",
  machine_type: "bx2.16x64",
  name: "management-cluster",
  resource_group: "management-rg",
  kms_config: {
    crk_name: "slz-roks-key",
    private_endpoint: true,
  },
  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
  vpc_name: "management",
  worker_pools: [
    {
      entitlement: "cloud_pak",
      flavor: "bx2.16x64",
      name: "logging-worker-pool",
      subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
      vpc_name: "management",
      workers_per_subnet: 2,
    },
  ],
  workers_per_subnet: 2,
};
const defaultManagementServer = {
  boot_volume_encryption_key_name: "slz-vsi-volume-key",
  image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
  machine_type: "cx2-4x8",
  name: "management-server",
  resource_group: "management-rg",
  security_group: {
    name: "management",
    rules: [
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_min: 443,
          port_max: 443,
        },
        icmp: {
          code: null,
          type: null,
        },
        udp: {
          port_max: null,
          port_min: null,
        },
      },
    ],
  },
  ssh_keys: ["slz-ssh-key"],
  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
  vpc_name: "management",
  vsi_per_subnet: 1,
  security_groups: [],
};
const defaultWorkloadServer = {
  boot_volume_encryption_key_name: "slz-vsi-volume-key",
  image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
  machine_type: "cx2-4x8",
  name: "workload-server",
  resource_group: "workload-rg",
  security_group: {
    name: "workload",
    vpc_name: "workload",
  },
  security_group: {
    name: "workload",
    rules: [
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53,
        },
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80,
        },
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443,
        },
      },
    ],
  },
  ssh_keys: ["slz-ssh-key"],
  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
  vpc_name: "workload",
  vsi_per_subnet: 1,
  security_groups: [],
};

defaultWorkloadServer.security_group.rules =
  defaultManagementServer.security_group.rules;
/**
 * create an access group
 * @param {slzStore} slz slz state store
 */
function lazyAccessGroup(slz) {
  slz.access_groups.create({
    name: "test",
    description: "test",
  });
}

/**
 * create an access group policy
 * @param {slzStore} slz slz state store
 */
function lazyPolicy(slz) {
  slz.access_groups.policies.create(
    {
      name: "hi",
      roles: ["Writer"],
      resources: {
        resource_group: "management-rg",
        resource_type: null,
        resource: null,
        service: null,
        resource_instance_id: null,
      },
    },
    {
      arrayParentName: "test",
    }
  );
}

/**
 * create a security group
 * @param {slzStore} slz slz state store
 */
function lazyAddSg(slz) {
  slz.security_groups.create({
    name: "frog",
    vpc_name: "management",
  });
}

/**
 * initialize slz with store update callback
 * @returns {slzStore} slz state store
 */
function newState() {
  let slz = new state();
  slz.setUpdateCallback(() => {});
  return slz;
}

describe("store", () => {
  describe("access_groups", () => {
    describe("access_groups.init", () => {
      it("should initialize access groups", () => {
        let slz = newState();
        assert.deepEqual(
          slz.store.configDotJson.access_groups,
          [],
          "it should have empty array"
        );
      });
    });
    describe("access_groups.onStoreUpdate", () => {
      it("should set resource_group to null if a policy's resource object exists and contains a delete group name", () => {
        let slz = newState();
        lazyAccessGroup(slz);
        lazyPolicy(slz);
        slz.resource_groups.delete({}, { data: { name: "management-rg" } });
        assert.deepEqual(
          slz.store.configDotJson.access_groups[0].policies[0].resources
            .resource_group,
          null,
          "it should set unfound group to null"
        );
      });
    });
    describe("access_groups.create", () => {
      it("should create a new access group", () => {
        let slz = newState();
        lazyAccessGroup(slz);
        assert.deepEqual(
          slz.store.configDotJson.access_groups,
          [
            {
              name: "test",
              description: "test",
              policies: [],
              dynamic_policies: [],
              invite_users: [],
            },
          ],
          "it should create an access group"
        );
      });
    });
    describe("access_groups.save", () => {
      it("should update a new access group", () => {
        let slz = newState();
        lazyAccessGroup(slz);
        slz.access_groups.save({ name: "frog" }, { data: { name: "test" } });
        assert.deepEqual(
          slz.store.configDotJson.access_groups,
          [
            {
              name: "frog",
              description: "test",
              policies: [],
              dynamic_policies: [],
              invite_users: [],
            },
          ],
          "it should create an access group"
        );
      });
    });
    describe("access_groups.delete", () => {
      it("should delete a new access group", () => {
        let slz = newState();
        lazyAccessGroup(slz);
        slz.access_groups.delete({}, { data: { name: "test" } });
        assert.deepEqual(
          slz.store.configDotJson.access_groups,
          [],
          "it should be empty"
        );
      });
    });
    describe("access_groups.policies", () => {
      describe("access_groups.policies.create", () => {
        it("should create an access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          lazyPolicy(slz);
          assert.deepEqual(
            slz.store.configDotJson.access_groups[0].policies[0],
            {
              name: "hi",
              roles: ["Writer"],
              resources: {
                resource_group: "management-rg",
                resource_type: null,
                resource: null,
                service: null,
                resource_instance_id: null,
              },
            },
            "it should create policy"
          );
        });
      });
      describe("access_group.policies.save", () => {
        it("should update an access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          lazyPolicy(slz);
          slz.access_groups.policies.save(
            {
              resources: {
                resource_group: "management-rg",
                resource_type: null,
                resource: null,
                service: "cloud-object-storage",
                resource_instance_id: null,
              },
            },
            {
              arrayParentName: "test",
              data: {
                name: "hi",
              },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.access_groups[0].policies[0],
            {
              name: "hi",
              roles: ["Writer"],
              resources: {
                resource_group: "management-rg",
                resource_type: null,
                resource: null,
                service: "cloud-object-storage",
                resource_instance_id: null,
              },
            },
            "it should create policy"
          );
        });
      });
      describe("access_groups.policies.delete", () => {
        it("should delete an access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          lazyPolicy(slz);
          slz.access_groups.policies.delete(
            {},
            { arrayParentName: "test", data: { name: "hi" } }
          );
          assert.deepEqual(
            slz.store.configDotJson.access_groups[0].policies,
            [],
            "it should have no policies"
          );
        });
      });
    });
    describe("access_groups.dynamic_policies", () => {
      describe("access_groups.dynamic_policies.create", () => {
        it("should create a dynamic access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          slz.access_groups.dynamic_policies.create(
            {
              name: "frog",
              identity_provider: "todd",
              expiration: 2,
              conditions: {
                claim: "claim",
                operator: "EQUALS",
                value: "value",
              },
            },
            { arrayParentName: "test" }
          );
          assert.deepEqual(
            slz.store.configDotJson.access_groups[0].dynamic_policies[0],
            {
              name: "frog",
              identity_provider: "todd",
              expiration: 2,
              conditions: {
                claim: "claim",
                operator: "EQUALS",
                value: "value",
              },
            },
            "it should create the policy"
          );
        });
      });
      describe("slz.access_groups.dynamic_policies.save", () => {
        it("should update a dynamic access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          slz.access_groups.dynamic_policies.create(
            {
              name: "frog",
              identity_provider: "todd",
              expiration: 2,
              conditions: {
                claim: "claim",
                operator: "EQUALS",
                value: "value",
              },
            },
            { arrayParentName: "test" }
          );
          slz.access_groups.dynamic_policies.save(
            { expiration: 3 },
            { arrayParentName: "test", data: { name: "frog" } }
          );
          assert.deepEqual(
            slz.store.configDotJson.access_groups[0].dynamic_policies[0],
            {
              name: "frog",
              identity_provider: "todd",
              expiration: 3,
              conditions: {
                claim: "claim",
                operator: "EQUALS",
                value: "value",
              },
            },
            "it should create the policy"
          );
        });
      });
      describe("slz.access_groups.dynamic_policies.delete", () => {
        it("should delete a dynamic access policy in an existing access group", () => {
          let slz = newState();
          lazyAccessGroup(slz);
          slz.access_groups.dynamic_policies.create(
            {
              name: "frog",
              identity_provider: "todd",
              expiration: 2,
              conditions: {
                claim: "claim",
                operator: "EQUALS",
                value: "value",
              },
            },
            { arrayParentName: "test" }
          );
          slz.access_groups.dynamic_policies.delete(
            {},
            { arrayParentName: "test", data: { name: "frog" } }
          );
          assert.isEmpty(
            slz.store.configDotJson.access_groups[0].dynamic_policies,
            "it should have no dynamic policies"
          );
        });
      });
    });
  });
  describe("appid", () => {
    describe("appid.onStoreUpdate", () => {
      it("should set resource group to null if appid resource group not found", () => {
        let slz = new newState();
        slz.store.configDotJson.appid.use_appid = true;
        slz.store.configDotJson.appid.resource_group = "frog";
        slz.update();
        assert.deepEqual(
          slz.store.configDotJson.appid.resource_group,
          null,
          "it should set to null"
        );
      });
    });
    describe("appid.save", () => {
      it("should set all values to null if use_appid is false", () => {
        let slz = new newState();
        slz.appid.save({ use_appid: false });
        assert.deepEqual(
          slz.store.configDotJson.appid,
          {
            use_appid: false,
            name: null,
            resource_group: null,
            use_data: null,
            keys: [],
          },
          "it should update the object"
        );
      });
      it("should change values if use_appid is true or not found", () => {
        let slz = new newState();
        slz.appid.save({ name: "frog", use_appid: true });
        assert.deepEqual(
          slz.store.configDotJson.appid,
          {
            use_appid: true,
            name: "frog",
            resource_group: null,
            use_data: false,
            keys: [],
          },
          "it should update the object"
        );
      });
    });
  });
  describe("atracker", () => {
    describe("atracker.init", () => {
      it("should have default atracker", () => {
        let expectedData = {
          collector_bucket_name: "atracker-bucket",
          receive_global_events: true,
          resource_group: "service-rg",
          add_route: true,
        };
        let state = new newState();
        assert.deepEqual(
          state.store.configDotJson.atracker,
          expectedData,
          "it should have atracker"
        );
      });
    });
    describe("atracker.save", () => {
      it("should update atracker info", () => {
        let state = new newState();
        state.atracker.save({
          collector_bucket_name: "management-bucket",
          receive_global_events: false,
          add_route: false,
          atracker_key: "frog",
        });
        let expectedData = {
          collector_bucket_name: "management-bucket",
          receive_global_events: false,
          add_route: false,
          resource_group: "service-rg",
        };
        assert.deepEqual(
          state.store.configDotJson.atracker,
          expectedData,
          "it should update"
        );
      });
      it("should update atracker info with key", () => {
        let state = new newState();
        state.atracker.save(
          {
            collector_bucket_name: "management-bucket",
            receive_global_events: false,
            add_route: false,
          },
          "cos-bind-key"
        );
        assert.deepEqual(
          state.store.atrackerKey,
          "cos-bind-key",
          "it should update"
        );
      });
    });
  });
  describe("clusters", () => {
    describe("clusters.create", () => {
      it("should add a new cluster", () => {
        let state = new newState();
        state.store.configDotJson.clusters = [];
        state.clusters.create({ cluster: defaultWorkloadCluster });
        assert.deepEqual(
          state.store.configDotJson.clusters,
          [defaultWorkloadCluster],
          "it should create cluster"
        );
      });
    });
    describe("clusters.save", () => {
      it("should update a cluster", () => {
        let state = new newState();
        state.store.configDotJson.clusters = [defaultWorkloadCluster];
        state.clusters.save(
          { cluster: defaultManagementCluster },
          {
            data: { name: "workload-cluster" },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.clusters,
          [defaultManagementCluster],
          "it should save cluster"
        );
      });
      it("should update cluster worker pools when changing vpc", () => {
        let state = new newState();
        state.clusters.create({
          cluster: {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "frog",
            resource_group: "workload-rg",
            kms_config: {
              crk_name: "slz-roks-key",
              private_endpoint: true,
            },
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "workload",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc_name: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
        });
        state.clusters.save(
          {
            cluster: {
              vpc_name: "management",
              worker_pools: [
                {
                  entitlement: "cloud_pak",
                  flavor: "bx2.16x64",
                  name: "logging-worker-pool",
                  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                  vpc_name: "workload",
                  workers_per_subnet: 2,
                },
              ],
            },
          },
          {
            data: {
              name: "frog",
              vpc_name: "workload",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[1],
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "frog",
            resource_group: "workload-rg",
            kms_config: {
              crk_name: "slz-roks-key",
              private_endpoint: true,
            },
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "management",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnet_names: [],
                vpc_name: "management",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
          "it should save cluster"
        );
      });
      it("should not update cluster worker pools when not changing vpc", () => {
        let state = new newState();
        state.clusters.create({
          cluster: {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "frog",
            resource_group: "workload-rg",
            kms_config: {
              crk_name: "slz-roks-key",
              private_endpoint: true,
            },
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "workload",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc_name: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
        });
        state.clusters.save(
          {
            cluster: {
              vpc_name: "workload",
              worker_pools: [
                {
                  entitlement: "cloud_pak",
                  flavor: "bx2.16x64",
                  name: "logging-worker-pool",
                  subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                  vpc_name: "workload",
                  workers_per_subnet: 2,
                },
              ],
            },
          },
          {
            data: {
              name: "frog",
              vpc_name: "workload",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[1],
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "frog",
            resource_group: "workload-rg",
            kms_config: {
              crk_name: "slz-roks-key",
              private_endpoint: true,
            },
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "workload",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc_name: "workload",
                workers_per_subnet: 2,
              },
            ],
            workers_per_subnet: 2,
          },
          "it should save cluster"
        );
      });
    });
    describe("clusters.delete", () => {
      it("should delete cluster", () => {
        let state = new newState();
        state.clusters.delete({}, { data: { name: "workload-cluster" } });
        assert.deepEqual(
          state.store.configDotJson.clusters,
          [],
          "it should delete clusters"
        );
      });
    });
    describe("clusters.onStoreUpdate", () => {
      it("should set resource group to null if deleted", () => {
        let state = new newState();
        state.resource_groups.delete({}, { data: { name: "workload-rg" } });
        assert.deepEqual(
          state.store.configDotJson.clusters[0].resource_group,
          null,
          "it should be null"
        );
      });
      it("should delete subnet names on tier deletion", () => {
        let state = new newState();
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vsi-zone-1",
            },
          }
        );
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vsi-zone-2",
            },
          }
        );
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vsi-zone-3",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[0].subnet_names,
          [],
          "it should be empty"
        );
      });
      it("should set vpc name to null if deleted", () => {
        let state = new newState();
        state.vpcs.delete({}, { data: { prefix: "workload" } });
        assert.deepEqual(
          state.store.configDotJson.clusters[0].vpc_name,
          null,
          "it should be null"
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[0].subnet_names,
          [],
          "it should be empty"
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[0].worker_pools[0].vpc_name,
          null,
          "it should be null"
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[0].worker_pools[0].subnet_names,
          [],
          "it should be null"
        );
      });
      it("should set crk name to null if key deleted", () => {
        let state = new newState();
        state.key_management.keys.delete(
          {},
          { data: { name: "slz-roks-key" } }
        );
        assert.deepEqual(
          state.store.configDotJson.clusters[0].kms_config.crk_name,
          null,
          "it should return null"
        );
      });
    });
    describe("cluster.worker_pools", () => {
      describe("clusters.worker_pools.delete", () => {
        it("should delete a worker pool from a cluster object", () => {
          let state = new newState();
          state.clusters.worker_pools.delete(
            {},
            {
              data: { name: "logging-worker-pool" },
              arrayParentName: "workload-cluster",
            }
          );
          assert.deepEqual(
            state.store.configDotJson.clusters[0].worker_pools,
            [],
            "it should be empty"
          );
        });
      });
      describe("clusters.worker_pools.save", () => {
        it("should update a worker pool in place", () => {
          let state = new newState();
          state.clusters.worker_pools.save(
            {
              pool: {
                cloud_pak: "no",
              },
            },
            {
              arrayParentName: "workload-cluster",
              data: { name: "logging-worker-pool" },
            }
          );
          assert.deepEqual(
            state.store.configDotJson.clusters[0].worker_pools[0].cloud_pak,
            "no",
            "it should be no"
          );
        });
      });
      describe("clusters.worker_pools.create", () => {
        it("should create a worker pool", () => {
          let state = new newState();
          state.clusters.worker_pools.create(
            {
              pool: {
                name: "test",
              },
            },
            {
              arrayParentName: "workload-cluster",
            }
          );
          assert.deepEqual(
            state.store.configDotJson.clusters[0].worker_pools[1],
            {
              name: "test",
              vpc_name: "workload",
              subnet_names: [],
              flavor: "bx2.16x64",
            },
            "it should be empty"
          );
        });
      });
    });
  });
  describe("cos", () => {
    describe("cos.init", () => {
      it("should initialize the object storage instances", () => {
        let state = new newState();
        let expectedData = [
          {
            buckets: [
              {
                endpoint_type: "public",
                force_delete: true,
                kms_key: "slz-atracker-key",
                name: "atracker-bucket",
                storage_class: "standard",
              },
            ],
            keys: [
              {
                name: "cos-bind-key",
                role: "Writer",
                enable_HMAC: false,
              },
            ],
            name: "atracker-cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
            random_suffix: true,
          },
          {
            buckets: [
              {
                endpoint_type: "public",
                force_delete: true,
                kms_key: "slz-slz-key",
                name: "management-bucket",
                storage_class: "standard",
              },
              {
                endpoint_type: "public",
                force_delete: true,
                kms_key: "slz-slz-key",
                name: "workload-bucket",
                storage_class: "standard",
              },
            ],
            random_suffix: true,
            keys: [],
            name: "cos",
            plan: "standard",
            resource_group: "service-rg",
            use_data: false,
          },
        ];
        assert.deepEqual(
          state.store.configDotJson.cos,
          expectedData,
          "it should have cos"
        );
      });
    });
    describe("cos.create", () => {
      it("should create a new cos instance", () => {
        let state = new newState();

        state.cos.create({
          name: "todd",
          use_data: false,
          resource_group: "default",
          plan: "standard",
          random_suffix: true,
        });
        let expectedData = {
          name: "todd",
          use_data: false,
          resource_group: null,
          plan: "standard",
          random_suffix: true,
          keys: [],
          buckets: [],
        };
        assert.deepEqual(
          state.store.configDotJson.cos[2],
          expectedData,
          "it should create new cos"
        );
      });
    });
    describe("cos.save", () => {
      it("should update a cos instance in place", () => {
        let state = new newState();

        state.cos.save({ name: "todd" }, { data: { name: "cos" } });
        assert.deepEqual(
          state.store.configDotJson.cos[1].name,
          "todd",
          "it should create new cos"
        );
      });
      it("should update a cos instance in place with same name", () => {
        let state = new newState();

        state.cos.save({ name: "cos" }, { data: { name: "cos" } });
        assert.deepEqual(
          state.store.configDotJson.cos[1].name,
          "cos",
          "it should create new cos"
        );
      });
    });
    describe("cos.delete", () => {
      it("should delete a cos instance", () => {
        let state = new newState();

        state.cos.delete({}, { data: { name: "cos" } });
        assert.deepEqual(
          state.store.configDotJson.cos.length,
          1,
          "it should create new cos"
        );
      });
    });
    describe("cos.onStoreUpdate", () => {
      it("should create a list of storage buckets", () => {
        let state = new newState();
        assert.deepEqual(
          state.store.cosBuckets,
          ["atracker-bucket", "management-bucket", "workload-bucket"],
          "it should have all the buckets"
        );
      });
      it("should create a list of storage keys", () => {
        let state = new newState();
        assert.deepEqual(
          state.store.cosKeys,
          ["cos-bind-key"],
          "it should have all the keys"
        );
      });
      it("should remove unfound kms key from buckets after deletion", () => {
        let state = new newState();
        state.key_management.keys.delete(
          {},
          { data: { name: "slz-atracker-key" } }
        );
        state.update();
        assert.deepEqual(
          state.store.configDotJson.cos[0].buckets[0].kms_key,
          null,
          "it should have all the keys"
        );
      });
    });
    describe("cos.buckets", () => {
      describe("cos.buckets.create", () => {
        it("should create a bucket in a specified instance", () => {
          let state = new newState();

          state.cos.buckets.create(
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "slz-atracker-key",
              name: "todd",
              storage_class: "standard",
              showBucket: true,
            },
            {
              arrayParentName: "atracker-cos",
            }
          );
          let expectedData = {
            endpoint_type: "public",
            force_delete: true,
            kms_key: "slz-atracker-key",
            name: "todd",
            storage_class: "standard",
          };
          assert.deepEqual(
            state.store.configDotJson.cos[0].buckets[1],
            expectedData,
            "it should make new bucket"
          );
        });
      });

      describe("cos.buckets.save", () => {
        it("should update a bucket in a specified instance", () => {
          let state = new newState();
          state.store.configDotJson.atracker = {
            collector_bucket_name: "atracker-bucket",
          };
          state.cos.buckets.save(
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "slz-atracker-key",
              name: "todd",
              storage_class: "standard",
            },
            {
              arrayParentName: "cos",
              data: { name: "management-bucket" },
            }
          );
          let expectedData = {
            endpoint_type: "public",
            force_delete: true,
            kms_key: "slz-atracker-key",
            name: "todd",
            storage_class: "standard",
          };
          assert.deepEqual(
            state.store.configDotJson.cos[1].buckets[0],
            expectedData,
            "it should make new bucket"
          );
        });
        it("should update a atracker collector bucket name when bucket changed", () => {
          let state = new newState();
          state.store.configDotJson.atracker = {
            collector_bucket_name: "atracker-bucket",
          };
          state.cos.buckets.save(
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "slz-atracker-key",
              name: "todd",
              storage_class: "standard",
            },
            {
              arrayParentName: "atracker-cos",
              data: { name: "atracker-bucket" },
            }
          );
          assert.deepEqual(
            state.store.configDotJson.atracker.collector_bucket_name,
            "todd",
            "it should be todd"
          );
        });
        it("should update a bucket in a specified instance with same name", () => {
          let state = new newState();
          state.store.configDotJson.atracker = {
            collector_bucket_name: "slz-atracker-key",
          };
          state.cos.buckets.save(
            {
              endpoint_type: "public",
              force_delete: true,
              kms_key: "slz-atracker-key",
              name: "management-bucket",
              storage_class: "standard",
            },
            {
              arrayParentName: "cos",
              data: { name: "management-bucket" },
            }
          );
          let expectedData = {
            endpoint_type: "public",
            force_delete: true,
            kms_key: "slz-atracker-key",
            name: "management-bucket",
            storage_class: "standard",
          };
          assert.deepEqual(
            state.store.configDotJson.cos[1].buckets[0],
            expectedData,
            "it should make new bucket"
          );
        });
      });
      describe("cos.buckets.delete", () => {
        it("should delete bucket", () => {
          let state = new newState();
          state.cos.buckets.delete(
            {},
            { arrayParentName: "cos", data: { name: "management-bucket" } }
          );
          assert.deepEqual(
            state.store.configDotJson.cos[1].buckets.length,
            1,
            "should delete bucket"
          );
        });
      });
    });
    describe("cos.keys", () => {
      describe("cos.keys.create", () => {
        it("should create a new cos key in a specified instance", () => {
          let state = new newState();
          state.cos.keys.create(
            {
              name: "todd",
              role: "Writer",
              enable_HMAC: false,
            },
            {
              arrayParentName: "cos",
            }
          );
          assert.deepEqual(state.store.configDotJson.cos[1].keys, [
            {
              name: "todd",
              role: "Writer",
              enable_HMAC: false,
            },
          ]);
        });
      });

      describe("cos.keys.save", () => {
        it("should update a cos key in a specified instance", () => {
          let state = new newState();
          state.store.configDotJson.atracker = {
            collector_bucket_name: "atracker-bucket",
          };
          state.store.atrackerKey = "cos-bind-key";
          state.cos.keys.save(
            { name: "todd" },
            { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
          );
          assert.deepEqual(state.store.configDotJson.cos[0].keys, [
            {
              name: "todd",
              role: "Writer",
              enable_HMAC: false,
            },
          ]);
          assert.deepEqual(
            state.store.atrackerKey,
            "todd",
            "it should be todd"
          );
        });
        it("should update a cos key not atracker", () => {
          let state = new newState();

          state.cos.keys.create(
            {
              name: "boo",
              role: "Writer",
              enable_HMAC: false,
            },
            { arrayParentName: "cos" }
          );
          state.cos.keys.save(
            { name: "todd" },
            { data: { name: "boo" }, arrayParentName: "cos" }
          );
          assert.deepEqual(state.store.configDotJson.cos[1].keys, [
            {
              name: "todd",
              role: "Writer",
              enable_HMAC: false,
            },
          ]);
        });
        it("should update cos key in a specified instance with same name", () => {
          let state = new newState();

          state.cos.keys.save(
            {
              name: "cos-bind-key",
            },
            { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
          );
          assert.deepEqual(state.store.configDotJson.cos[0].keys, [
            {
              name: "cos-bind-key",
              role: "Writer",
              enable_HMAC: false,
            },
          ]);
        });
      });
      describe("cos.keys.delete", () => {
        it("should delete a cos key in a specified instance", () => {
          let state = new newState();
          state.cos.keys.delete(
            {},
            { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } }
          );
          assert.deepEqual(state.store.configDotJson.cos[0].keys, []);
        });
      });
    });
  });
  describe("f5", () => {
    describe("f5.init", () => {
      it("should create f5 template data", () => {
        let slz = new newState();
        assert.deepEqual(
          slz.store.configDotJson.f5_template_data,
          {
            tmos_admin_password: null,
            byol_license_basekey: "null",
            license_host: "null",
            license_password: "null",
            license_pool: "null",
            license_sku_keyword_1: "null",
            license_sku_keyword_2: "null",
            license_username: "null",
            license_type: "none",
            license_unit_of_measure: "hourly",
            template_source:
              "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
            template_version: "20210201",
            app_id: "null",
            as3_declaration_url: "null",
            phone_home_url: "null",
            do_declaration_url: "null",
            tgactive_url: "null",
            tgrefresh_url: "null",
            tgstandby_url: "null",
            ts_declaration_url: "null",
          },
          "it should create template data"
        );
      });
    });
    describe("f5.onStoreUpdate", () => {
      it("should set all dependent fields to string or empty array when unfound vpc", () => {
        let slz = new newState();
        slz.createEdgeVpc("vpn-and-waf");
        slz.f5.vsi.create({ useManagement: false, zones: 2 });
        slz.store.configDotJson.f5_vsi[0].vpc_name = null;
        slz.update();
        assert.deepEqual(
          slz.store.configDotJson.f5_vsi[0],
          {
            boot_volume_encryption_key_name: "slz-vsi-volume-key",
            domain: "local",
            enable_external_floating_ip: true,
            enable_management_floating_ip: false,
            f5_image_name: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
            hostname: "f5-ve-01",
            machine_type: "cx2-4x8",
            name: "f5-zone-1",
            primary_subnet_name: null,
            resource_group: "edge-rg",
            secondary_subnet_names: [],
            secondary_subnet_security_group_names: [],
            security_groups: [],
            ssh_keys: ["slz-ssh-key"],
            vpc_name: null,
          },
          "it should set fields"
        );
      });
      it("should update vsi with unfound ssh keys, unfound primary subnet names, and unfound secondary subnet names", () => {
        let slz = new newState();
        slz.createEdgeVpc("vpn-and-waf");
        slz.f5.vsi.create(false, 2);
        slz.store.configDotJson.f5_vsi[0].primary_subnet_name = "bad";
        slz.store.configDotJson.f5_vsi[0].ssh_keys = ["bad-key"];
        slz.store.configDotJson.f5_vsi[0].secondary_subnet_names.unshift(
          "todd"
        );
        slz.update();
        assert.isNull(
          slz.store.configDotJson.f5_vsi[0].primary_subnet_name,
          "it should be null"
        );
        assert.isEmpty(
          slz.store.configDotJson.f5_vsi[0].ssh_keys,
          "it should have no keys"
        );
      });
    });
    describe("f5.template", () => {
      describe("f5.template.save", () => {
        it("should set tmos_admin_password to null when state data is empty string", () => {
          let slz = new newState();
          slz.f5.template.save({ tmos_admin_password: "" });
          assert.deepEqual(
            slz.store.configDotJson.f5_template_data.tmos_admin_password,
            null,
            "password should set to null"
          );
        });
        it("should stringify certain empty params", () => {
          let slz = new newState();
          slz.f5.template.save({
            do_declaration_url: "",
            as3_declaration_url: "",
            ts_declaration_url: "",
            phone_home_url: "",
            tgactive_url: "",
            tgstandby_url: "",
            tgrefresh_url: "",
            app_id: "",
            yes: true, // force test else case
          });
          assert.deepEqual(
            slz.store.configDotJson.f5_template_data,
            {
              tmos_admin_password: null,
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
              tgactive_url: "null",
              yes: true,
            },
            'should set empty string to "null" string'
          );
        });
      });
    });
    describe("f5.instance", () => {
      describe("f5.instance.save", () => {
        it("should set the resource group and boot volume encryption key for an f5 vsi", () => {
          let slz = new newState();
          slz.createEdgeVpc("vpn-and-waf");
          slz.f5.vsi.create({ useManagement: false, zones: 2 });
          slz.f5.instance.save({
            name: "f5-zone-1",
            resource_group: "frog",
            boot_volume_encryption_key_name: "todd",
          });
          assert.deepEqual(
            slz.store.configDotJson.f5_vsi[0],
            {
              boot_volume_encryption_key_name: null,
              domain: "local",
              enable_external_floating_ip: true,
              enable_management_floating_ip: false,
              f5_image_name: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
              hostname: "f5-ve-01",
              machine_type: "cx2-4x8",
              name: "f5-zone-1",
              primary_subnet_name: "f5-management-zone-1",
              resource_group: null,
              secondary_subnet_names: [
                "f5-bastion-zone-1",
                "f5-external-zone-1",
                "f5-workload-zone-1",
              ],
              secondary_subnet_security_group_names: [
                {
                  group_name: "f5-bastion-sg",
                  interface_name: "slz-edge-f5-bastion-zone-1",
                },
                {
                  group_name: "f5-external-sg",
                  interface_name: "slz-edge-f5-external-zone-1",
                },
                {
                  group_name: "f5-workload-sg",
                  interface_name: "slz-edge-f5-workload-zone-1",
                },
              ],
              security_groups: ["f5-management-sg"],
              ssh_keys: ["slz-ssh-key"],
              vpc_name: "edge",
            },
            "it should set data"
          );
        });
      });
    });
    describe("f5.vsi", () => {
      describe("f5.vsi.save", () => {
        it("should create new instances on change", () => {
          let slz = new newState();
          slz.createEdgeVpc("vpn-and-waf");
          slz.f5.vsi.create({ useManagement: false, zones: 2 });
          slz.f5.vsi.save({
            zones: 1,
            f5_image_name: "todd",
            resource_group: "service-rg",
            machine_type: "1x2x3x4",
            ssh_keys: ["slz-ssh-key"],
          });
          assert.deepEqual(
            slz.store.configDotJson.f5_vsi,
            [
              {
                boot_volume_encryption_key_name: "slz-vsi-volume-key",
                domain: "local",
                enable_external_floating_ip: true,
                enable_management_floating_ip: false,
                f5_image_name: "todd",
                hostname: "f5-ve-01",
                machine_type: "1x2x3x4",
                name: "f5-zone-1",
                primary_subnet_name: "f5-management-zone-1",
                resource_group: "service-rg",
                secondary_subnet_names: [
                  "f5-bastion-zone-1",
                  "f5-external-zone-1",
                  "f5-workload-zone-1",
                ],
                secondary_subnet_security_group_names: [
                  {
                    group_name: "f5-bastion-sg",
                    interface_name: "slz-edge-f5-bastion-zone-1",
                  },
                  {
                    group_name: "f5-external-sg",
                    interface_name: "slz-edge-f5-external-zone-1",
                  },
                  {
                    group_name: "f5-workload-sg",
                    interface_name: "slz-edge-f5-workload-zone-1",
                  },
                ],
                security_groups: ["f5-management-sg"],
                ssh_keys: ["slz-ssh-key"],
                vpc_name: "edge",
              },
            ],
            "it should return correct vsi"
          );
        });
      });
      describe("f5.vsi.create", () => {
        it("should create a new ssh key if one is not found", () => {
          let slz = new newState();
          slz.createEdgeVpc("vpn-and-waf");
          slz.store.configDotJson.ssh_keys = [];
          slz.f5.vsi.create({ useManagement: false, zones: 2 });
          assert.deepEqual(
            slz.store.configDotJson.ssh_keys,
            [
              {
                name: "slz-ssh-key",
                public_key: "<user-determined-value>",
                resource_group: null,
              },
            ],
            "it should return correct ssh key"
          );
        });
        it("should create a new encryption key for vsi if one is not found", () => {
          let slz = new newState();
          slz.createEdgeVpc("vpn-and-waf");
          slz.store.encryptionKeys = [];
          slz.store.configDotJson.key_management.keys = [];
          slz.f5.vsi.create({ useManagement: false, zones: 2 });
          assert.deepEqual(
            slz.store.encryptionKeys,
            ["slz-vsi-volume-key"],
            "it should return correct ssh key"
          );
        });
      });
    });
  });
  describe("key_management", () => {
    describe("key_management.onStoreUpdate", () => {
      it("should set parent keys", () => {
        let state = new newState();
        assert.deepEqual(
          state.store.encryptionKeys,
          [
            "slz-atracker-key",
            "slz-slz-key",
            "slz-roks-key",
            "slz-vsi-volume-key",
          ],
          "it should be set to keys"
        );
      });
    });
    describe("key_management.save", () => {
      it("should change the properties of the key management instance", () => {
        let state = new newState();
        state.key_management.save({
          name: "todd",
          resource_group: null,
          use_hs_crypto: true,
        });
        state.store.configDotJson.key_management.keys = [];
        let expectedData = {
          name: "todd",
          resource_group: null,
          use_hs_crypto: true,
          use_data: true,
          keys: [],
        };
        assert.deepEqual(
          state.store.configDotJson.key_management,
          expectedData,
          "it should update everything"
        );
      });
      it("should change the properties of the key management instance with no hs crypto", () => {
        let state = new newState();
        state.key_management.save({
          name: "todd",
          resource_group: null,
        });
        state.store.configDotJson.key_management.keys = [];
        let expectedData = {
          name: "todd",
          resource_group: null,
          use_hs_crypto: false,
          use_data: false,
          keys: [],
        };
        assert.deepEqual(
          state.store.configDotJson.key_management,
          expectedData,
          "it should update everything"
        );
      });
    });
    describe("key_management.keys", () => {
      describe("key_management.keys.create", () => {
        it("should create a new key", () => {
          let state = new newState();
          state.key_management.keys.create({
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
          });
          let expectedData = {
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
            payload: null,
            force_delete: null,
            endpoint: null,
            iv_value: null,
            encrypted_nonce: null,
            policies: {
              rotation: {
                interval_month: 12,
              },
            },
          };
          assert.deepEqual(
            state.store.configDotJson.key_management.keys[4],
            expectedData,
            "it should add key"
          );
        });
      });

      describe("key_management.keys.save", () => {
        it("should update an encryption key in place", () => {
          let state = new newState();
          state.key_management.keys.save(
            {
              name: "all-new-key",
              root_key: true,
              key_ring: "all-new-ring",
              interval_month: 12,
            },
            { data: { name: "slz-slz-key" } }
          );
          let expectedData = {
            name: "all-new-key",
            root_key: true,
            key_ring: "all-new-ring",
            payload: null,
            force_delete: null,
            endpoint: null,
            iv_value: null,
            encrypted_nonce: null,
            policies: {
              rotation: {
                interval_month: 12,
              },
            },
          };
          assert.deepEqual(
            state.store.configDotJson.key_management.keys[1],
            expectedData,
            "it should update key"
          );
        });
        it("should update an encryption key in place with same name", () => {
          let state = new newState();
          state.key_management.keys.save(
            {
              name: "slz-slz-key",
              root_key: true,
              key_ring: "all-new-ring",
              interval_month: 3,
            },
            { data: { name: "slz-slz-key" } }
          );
          let expectedData = {
            name: "slz-slz-key",
            root_key: true,
            key_ring: "all-new-ring",
            payload: null,
            force_delete: null,
            endpoint: null,
            iv_value: null,
            encrypted_nonce: null,
            policies: {
              rotation: {
                interval_month: 3,
              },
            },
          };
          assert.deepEqual(
            state.store.configDotJson.key_management.keys[1],
            expectedData,
            "it should update key"
          );
        });
      });
      describe("key_management.keys.delete", () => {
        it("should delete an encryption key", () => {
          let state = new newState();
          state.key_management.keys.delete(
            {},
            { data: { name: "slz-slz-key" } }
          );
          assert.deepEqual(
            state.store.encryptionKeys,
            ["slz-atracker-key", "slz-roks-key", "slz-vsi-volume-key"],
            "it should update key"
          );
        });
      });
    });
  });
  describe("iam_account_settings", () => {
    describe("iam_account_settings.init", () => {
      it("should initialize iam account settings", () => {
        let slz = new newState();
        assert.deepEqual(
          slz.store.configDotJson.iam_account_settings,
          {
            enable: false,
            mfa: null,
            allowed_ip_addresses: null,
            include_history: null,
            if_match: null,
            max_sessions_per_identity: null,
            restrict_create_service_id: null,
            restrict_create_platform_apikey: null,
            session_expiration_in_seconds: null,
            session_invalidation_in_seconds: null,
          },
          "it should set defaults"
        );
      });
    });
    describe("iam_account_settings.save", () => {
      it("should set other params except is_public to null when enable is changed from true to false", () => {
        let slz = new newState();
        slz.store.configDotJson.iam_account_settings.enable = true;
        slz.iam_account_settings.save({
          include_history: false,
          enable: false,
        });
        assert.deepEqual(
          slz.store.configDotJson.iam_account_settings.include_history,
          null,
          "it should set value to null"
        );
      });
      it("should update", () => {
        let slz = new newState();
        slz.iam_account_settings.save({ enable: true });
        assert.deepEqual(
          slz.store.configDotJson.iam_account_settings.enable,
          true,
          "it should set value to null"
        );
      });
    });
  });
  describe("resource_groups", () => {
    describe("resource_groups.create", () => {
      let rgState;
      beforeEach(() => {
        rgState = new newState();
      });
      it("should add and update a non-duplicate group", () => {
        rgState.resource_groups.create({ name: "default" });
        assert.deepEqual(rgState.store.resourceGroups, [
          "service-rg",
          "management-rg",
          "workload-rg",
          "default",
        ]);
      });
      it("should add and update a non-duplicate group using prefix", () => {
        rgState.resource_groups.create({ name: "default", use_prefix: true });
        assert.deepEqual(rgState.store.resourceGroups, [
          "service-rg",
          "management-rg",
          "workload-rg",
          "default",
        ]);
      });
    });

    describe("resource_groups.delete", () => {
      let rgState;
      beforeEach(() => {
        rgState = new newState();
      });
      it("should delete a group and update names", () => {
        rgState.resource_groups.delete({}, { data: { name: "service-rg" } });
        assert.deepEqual(
          rgState.store.resourceGroups,
          ["management-rg", "workload-rg"],
          "it should set resource groups"
        );
      });
      it("should delete a vpc resource group and update vpc to use the first resource group", () => {
        rgState.resource_groups.delete({}, { data: { name: "management-rg" } });
        assert.deepEqual(
          rgState.store.resourceGroups,
          ["service-rg", "workload-rg"],
          "it should set resource groups"
        );
      });
    });

    describe("resource_groups.save", () => {
      let crgState;
      beforeEach(() => {
        crgState = new newState();
      });
      it("should change the name of a resource group in place", () => {
        let expectedData = ["service-rg", "frog-rg", "workload-rg"];
        crgState.resource_groups.save(
          {
            name: "frog-rg",
            use_prefix: true,
          },
          {
            data: {
              name: "management-rg",
            },
          }
        );
        assert.deepEqual(
          crgState.store.resourceGroups,
          expectedData,
          "it should change the name"
        );
      });
      it("should change the name of a resource group in place and update vpcs when not use prefix", () => {
        crgState.store.configDotJson.resource_groups[1].use_prefix = false;
        crgState.resource_groups.save(
          { name: "frog-rg" },
          {
            data: {
              name: "management-rg",
            },
          }
        );
        assert.deepEqual(
          crgState.store.configDotJson.resource_groups[1].name,
          "frog-rg"
        );
      });
    });
  });
  describe("secrets_manager", () => {
    describe("secrets_manager.init", () => {
      it("should correctly initialize secrets manager", () => {
        let slz = new newState();
        assert.deepEqual(
          slz.store.configDotJson.secrets_manager,
          {
            kms_key_name: null,
            name: null,
            resource_group: null,
            use_secrets_manager: false,
          },
          "it should create default secrets manager"
        );
      });
    });
    describe("secrets_manager.onStoreUpdate", () => {
      it("should remove unfound resource groups", () => {
        let slz = new newState();
        slz.setUpdateCallback(() => {});
        slz.store.configDotJson.secrets_manager = {
          kms_key_name: null,
          name: null,
          resource_group: "null",
          use_secrets_manager: true,
        };
        slz.update();
        assert.deepEqual(
          slz.store.configDotJson.secrets_manager.resource_group,
          null,
          "it should set to null"
        );
      });
    });
    describe("secrets_manager.save", () => {
      it("should update secrets manager", () => {
        let slz = new newState();
        slz.setUpdateCallback(() => {});
        let expectedData = {
          use_secrets_manager: true,
          name: "todd",
          resource_group: null,
          kms_key_name: null,
        };
        slz.secrets_manager.save({ name: "todd", use_secrets_manager: true });
        assert.deepEqual(
          slz.store.configDotJson.secrets_manager,
          expectedData,
          "it should update data"
        );
      });
    });
  });
  describe("security_groups", () => {
    describe("security_groups.create", () => {
      it("should create a new security group", () => {
        let slz = new newState();
        lazyAddSg(slz);
        assert.deepEqual(
          slz.store.configDotJson.security_groups[2],
          {
            name: "frog",
            vpc_name: "management",
            resource_group: null,
            rules: [],
          },
          "it should create the group"
        );
      });
    });
    describe("security_groups.save", () => {
      it("should update a security group", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.save({ name: "todd" }, { data: { name: "frog" } });
        assert.deepEqual(
          slz.store.configDotJson.security_groups[2],
          {
            name: "todd",
            vpc_name: "management",
            resource_group: null,
            rules: [],
          },
          "it should update the group"
        );
      });
    });
    describe("security_groups.delete", () => {
      it("should delete a security group", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.delete({}, { data: { name: "frog" } });
        assert.deepEqual(
          slz.store.configDotJson.security_groups.length,
          2,
          "it should delete the group"
        );
      });
    });
    describe("security_groups.onStoreUpdate", () => {
      it("should set securityGroups on update", () => {
        let slz = new newState();
        lazyAddSg(slz);
        assert.deepEqual(
          {
            management: ["management-vpe-sg", "frog"],
            workload: ["workload-vpe-sg"],
          },
          slz.store.securityGroups,
          "it should add groups"
        );
      });
      it("should set vpc name to null when a vpc a security group is attached to is deleted", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.vpcs.delete({}, { data: { prefix: "management" } });
        assert.deepEqual(
          slz.store.configDotJson.security_groups[0].vpc_name,
          null,
          "it should set to null"
        );
      });
      it("should set resource group to null when a resource group a security group is attached to is deleted", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.resource_groups.delete({}, { data: { name: "management-rg" } });
        assert.deepEqual(
          slz.store.configDotJson.security_groups[0].resource_group,
          null,
          "it should set to null"
        );
      });
    });
    describe("security_groups.rules", () => {
      describe("security_groups.rules.create", () => {
        it("should add a new rule", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
              direction: "inbound",
            },
            { parent_name: "frog" }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [
              {
                name: "test-rule",
                direction: "inbound",
                icmp: { type: null, code: null },
                tcp: { port_min: null, port_max: null },
                udp: { port_min: null, port_max: null },
                source: "8.8.8.8",
              },
            ],
            "it should create rule"
          );
        });
      });
      describe("security_groups.rules.save", () => {
        it("should update a rule in place", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
            },
            { parent_name: "frog" }
          );
          slz.security_groups.rules.save(
            {
              inbound: true,
              name: "test-rule",
            },
            {
              parent_name: "frog",
              data: { name: "test-rule" },
              isSecurityGroup: true,
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [
              {
                name: "test-rule",
                direction: "inbound",
                icmp: { type: null, code: null },
                tcp: { port_min: null, port_max: null },
                udp: { port_min: null, port_max: null },
                source: "8.8.8.8",
              },
            ],
            "it should update rule"
          );
        });
        it("should update a rule in place with protocol", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
            },
            {
              parent_name: "frog",
            }
          );
          slz.security_groups.rules.save(
            {
              name: "test-rule",
              inbound: true,
              ruleProtocol: "tcp",
              rule: {
                port_min: 8080,
                port_max: 8080,
              },
            },
            {
              parent_name: "frog",
              data: { name: "test-rule" },
              isSecurityGroup: true,
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [
              {
                name: "test-rule",
                direction: "inbound",
                icmp: { type: null, code: null },
                tcp: { port_min: 8080, port_max: 8080 },
                udp: { port_min: null, port_max: null },
                source: "8.8.8.8",
              },
            ],
            "it should update rule"
          );
        });
        it("should update a rule in place with icmp protocol", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
            },
            {
              parent_name: "frog",
            }
          );
          slz.security_groups.rules.save(
            {
              name: "test-rule",
              inbound: true,
              ruleProtocol: "icmp",
              source: "1.2.3.4",
              rule: {
                code: 8080,
                type: 8080,
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },

              showDeleteModal: true,
            },
            {
              parent_name: "frog",
              data: { name: "test-rule" },
              isSecurityGroup: true,
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [
              {
                name: "test-rule",
                direction: "inbound",
                icmp: { type: 8080, code: 8080 },
                tcp: { port_min: null, port_max: null },
                udp: { port_min: null, port_max: null },
                source: "1.2.3.4",
              },
            ],
            "it should update rule"
          );
        });
        it("should update a rule in place with all protocol", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
            },
            { parent_name: "frog" }
          );
          slz.security_groups.rules.save(
            {
              inbound: true,
              ruleProtocol: "all",
              name: "test-rule",
            },
            {
              parent_name: "frog",
              data: { name: "test-rule" },
              isSecurityGroup: true,
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [
              {
                name: "test-rule",
                direction: "inbound",
                icmp: { type: null, code: null },
                tcp: { port_min: null, port_max: null },
                udp: { port_min: null, port_max: null },
                source: "8.8.8.8",
              },
            ],
            "it should update rule"
          );
        });
      });
      describe("security_groups.rules.delete", () => {
        it("should delete a rule", () => {
          let slz = new newState();
          lazyAddSg(slz);
          slz.security_groups.rules.create(
            {
              name: "test-rule",
              source: "8.8.8.8",
            },
            {
              parent_name: "frog",
            }
          );
          slz.security_groups.rules.delete(
            {},
            {
              parent_name: "frog",
              data: { name: "test-rule" },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.security_groups[2].rules,
            [],
            "it should delete rule"
          );
        });
      });
    });
  });
  describe("ssh_keys", () => {
    describe("ssh_keys.init", () => {
      it("should initialize with default ssh key if pattern has vsi", () => {
        let state = new newState();
        assert.deepEqual(state.store.configDotJson.ssh_keys, [
          {
            name: "slz-ssh-key",
            public_key: "<user-determined-value>",
            resource_group: "management-rg",
          },
        ]);
      });
    });
    describe("ssh_keys.delete", () => {
      it("should delete an unused ssh key and update list", () => {
        let state = new newState();
        state.ssh_keys.delete({}, { data: { name: "slz-ssh-key" } });
        assert.deepEqual(
          state.store.configDotJson.ssh_keys,
          [],
          "there should be no keys"
        );
        assert.deepEqual(
          state.store.sshKeys,
          [],
          "it should remove the ssh key"
        );
      });
    });
    describe("ssh_keys.save", () => {
      it("should update an ssh key in place", () => {
        let state = new newState();
        state.ssh_keys.save(
          { name: "todd", show: false },
          { data: { name: "slz-ssh-key" } }
        );
        assert.deepEqual(state.store.sshKeys, ["todd"], "it should be todd");
        assert.deepEqual(
          state.store.configDotJson.vsi[0].ssh_keys,
          ["todd"],
          "todd should be there"
        );
        assert.deepEqual(
          state.store.configDotJson.ssh_keys[0].name,
          "todd",
          "it should have a new name"
        );
      });
      it("should update an ssh key in place with same name", () => {
        let state = new newState();
        state.ssh_keys.save(
          { name: "slz-ssh-key", public_key: "todd" },
          { data: { name: "slz-ssh-key" } }
        );
        assert.deepEqual(
          state.store.configDotJson.ssh_keys[0].public_key,
          "todd",
          "it should have a new name"
        );
        assert.deepEqual(
          state.store.configDotJson.vsi[0].ssh_keys,
          ["slz-ssh-key"],
          "it should not update name"
        );
      });
      it("should update an ssh key in place with same name not used by vsi", () => {
        let state = new newState();
        state.ssh_keys.create({ name: "frog" });
        state.ssh_keys.save({ name: "todd" }, { data: { name: "frog" } });
        assert.deepEqual(
          state.store.sshKeys,
          ["slz-ssh-key", "todd"],
          "it should have a new name"
        );
      });
    });
    describe("ssh_keys.create", () => {
      it("should create a new ssh key", () => {
        let state = new newState();
        state.ssh_keys.create({ name: "frog" });
        assert.deepEqual(
          state.store.sshKeys,
          ["slz-ssh-key", "frog"],
          "it should have a new name"
        );
      });
    });
  });
  // hidden in catalog
  // describe("teleport", () => {
  //   describe("teleport_config", () => {
  //     describe("teleport_config.init", () => {
  //       it("should initialize teleport config", () => {
  //         let slz = new newState();
  //         assert.deepEqual(
  //           slz.store.configDotJson.teleport_config,
  //           {
  //             teleport_license: null,
  //             https_cert: null,
  //             https_key: null,
  //             domain: null,
  //             cos_bucket_name: null,
  //             cos_key_name: null,
  //             teleport_version: null,
  //             message_of_the_day: null,
  //             hostname: null,
  //             app_id_key_name: null,
  //             claims_to_roles: [],
  //           },
  //           "it should initialize config"
  //         );
  //       });
  //       it("should not contain enableTeleport variable in teleport_config", () => {
  //         let state = new newState();
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //     });
  //     describe("teleport_config.onStoreUpdate", () => {
  //       it("should set app_id_key_name to null when use_appid is false", () => {
  //         let state = new newState();
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.store.configDotJson.teleport_config.app_id_key_name =
  //           "teleport-test-key";
  //         state.appid.save({ use_appid: false });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.app_id_key_name,
  //           null,
  //           "it should be null"
  //         );
  //       });
  //       it("should set app_id_key to null when key is deleted", () => {
  //         let state = new newState();
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.store.configDotJson.appid.keys = [
  //           "foo",
  //           "test",
  //           "teleport-test-key",
  //         ];
  //         state.store.configDotJson.teleport_config.app_id_key_name =
  //           "teleport-test-key";
  //         state.appid.save({ keys: ["foo", "test"] });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.app_id_key_name,
  //           null,
  //           "it should be null"
  //         );
  //       });
  //       it("should set cos bucket and cos key to null when bucket deleted", () => {
  //         let state = new newState();
  //         state.store.enableTeleport = true;
  //         state.store.configDotJson.teleport_config.cos_bucket_name =
  //           "bad-name";
  //         state.store.configDotJson.teleport_config.cos_key_name = "bad-name";
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_bucket_name,
  //           null,
  //           "it should be null"
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_key_name,
  //           null,
  //           "it should be null"
  //         );
  //       });
  //       it("should not set cos bucket and cos key to null when bucket ok", () => {
  //         let state = new newState();
  //         state.store.enableTeleport = true;
  //         state.store.configDotJson.teleport_config.cos_bucket_name =
  //           "atracker-bucket";
  //         state.store.configDotJson.teleport_config.cos_key_name = "bad-name";
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_bucket_name,
  //           "atracker-bucket",
  //           "it should be normal"
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_key_name,
  //           null,
  //           "it should be null"
  //         );
  //       });
  //       it("should not set anything when both bucket and name fine", () => {
  //         let state = new newState();
  //         state.store.enableTeleport = true;
  //         state.store.configDotJson.teleport_config.cos_bucket_name =
  //           "atracker-bucket";
  //         state.store.configDotJson.teleport_config.cos_key_name =
  //           "cos-bind-key";
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_bucket_name,
  //           "atracker-bucket",
  //           "it should be normal"
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.cos_key_name,
  //           "cos-bind-key",
  //           "it should be null"
  //         );
  //       });
  //     });
  //     describe("teleport_config.save", () => {
  //       it("should update config if enableTeleport state variable is true", () => {
  //         let state = new newState();
  //         // need to enable AppID and enableTeleport for save to work
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.teleport_config.save({
  //           teleport_config: {
  //             domain: "test.com",
  //           },
  //           enableTeleport: true,
  //         });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.domain,
  //           "test.com",
  //           "it should update domain"
  //         );
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //       it("should update config if enableTeleport state variable is true and no params", () => {
  //         let state = new newState();
  //         // need to enable AppID and enableTeleport for save to work
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.teleport_config.save({
  //           enableTeleport: true,
  //         });
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //       it("should set app_id_key_name to null", () => {
  //         let state = new newState();
  //         state.store.configDotJson.teleport_config.app_id_key_name =
  //           "teleport-test-key";
  //         state.store.configDotJson.appid.use_appid = false;
  //         state.teleport_config.save({
  //           teleport_config: { app_id_key_name: "new-teleport-key" },
  //         });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.app_id_key_name,
  //           null,
  //           "it should be null"
  //         );
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //       it("should update app_id_key_name", () => {
  //         let state = new newState();
  //         state.store.configDotJson.teleport_config.app_id_key_name =
  //           "teleport-test-key";
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.store.configDotJson.appid.keys = ["new-teleport-key"];
  //         state.teleport_config.save({
  //           teleport_config: { app_id_key_name: "new-teleport-key" },
  //           enableTeleport: true,
  //         });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config.app_id_key_name,
  //           "new-teleport-key",
  //           "it should be new-teleport-key"
  //         );
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //       it("should reset teleport_config data if enableTeleport state variable is false", () => {
  //         let state = new newState();
  //         state.store.enableTeleport = true;
  //         state.store.configDotJson.appid.use_appid = true;
  //         state.teleport_config.save({
  //           app_id_key_name: "new-teleport-key",
  //           enableTeleport: false,
  //         });
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_config,
  //           {
  //             teleport_license: null,
  //             https_cert: null,
  //             https_key: null,
  //             domain: null,
  //             cos_bucket_name: null,
  //             cos_key_name: null,
  //             teleport_version: null,
  //             message_of_the_day: null,
  //             hostname: null,
  //             app_id_key_name: null,
  //             claims_to_roles: [],
  //           },
  //           "it should be reset"
  //         );
  //         assert.isFalse(
  //           containsKeys(
  //             state.store.configDotJson.teleport_config,
  //             "enableTeleport"
  //           ),
  //           "it should not have enableTeleport in teleport_config configDotJson"
  //         );
  //       });
  //     });
  //     describe("teleport_config.claims_to_roles", () => {
  //       describe("teleport_config.claims_to_roles.create", () => {
  //         it("should create teleport claim to roles with no roles", () => {
  //           let state = new newState();
  //           state.teleport_config.claims_to_roles.create({
  //             email: "todd@frog.dev",
  //           });
  //           assert.deepEqual(
  //             state.store.configDotJson.teleport_config.claims_to_roles,
  //             [{ email: "todd@frog.dev", roles: ["teleport-admin"] }]
  //           );
  //         });
  //         it("should create teleport claim to roles with roles", () => {
  //           let state = new newState();
  //           state.teleport_config.claims_to_roles.create({
  //             email: "todd@frog.dev",
  //             roles: ["egg"],
  //           });
  //           assert.deepEqual(
  //             state.store.configDotJson.teleport_config.claims_to_roles,
  //             [{ email: "todd@frog.dev", roles: ["egg"] }]
  //           );
  //         });
  //       });
  //       describe("teleport_config.claims_to_roles.save", () => {
  //         it("should update teleport claim to roles", () => {
  //           let state = new newState();
  //           state.teleport_config.claims_to_roles.create({
  //             email: "todd@frog.dev",
  //             roles: ["egg"],
  //           });
  //           state.teleport_config.claims_to_roles.save(
  //             { email: "todd@todd.frog", roles: ["egg"] },
  //             { data: { email: "todd@frog.dev" } }
  //           );
  //           assert.deepEqual(
  //             state.store.configDotJson.teleport_config.claims_to_roles,
  //             [{ email: "todd@todd.frog", roles: ["egg"] }]
  //           );
  //         });
  //       });
  //       describe("teleport_config.claims_to_roles.delete", () => {
  //         it("should delete teleport claim to roles", () => {
  //           let state = new newState();
  //           state.teleport_config.claims_to_roles.create({
  //             email: "todd@frog.dev",
  //             roles: ["egg"],
  //           });
  //           state.teleport_config.claims_to_roles.delete(
  //             {},
  //             { data: { email: "todd@frog.dev" } }
  //           );
  //           assert.deepEqual(
  //             state.store.configDotJson.teleport_config.claims_to_roles,
  //             [],
  //             "it should be empty"
  //           );
  //         });
  //       });
  //     });
  //   });
  //   describe("teleport_vsi", () => {
  //     describe("teleport_vsi.onStoreUpdate", () => {
  //       it("should remove unfound subnet names", () => {
  //         let state = new newState();
  //         state.store.configDotJson.teleport_vsi.push({
  //           name: "test",
  //           subnet_name: "bad",
  //           vpc_name: "management",
  //           ssh_keys: [],
  //         });
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0].subnet_name,
  //           null,
  //           "it should set to null"
  //         );
  //       });
  //       it("should remove subnet name when vpc no longer exists", () => {
  //         let state = new newState();
  //         state.store.configDotJson.teleport_vsi.push({
  //           name: "test",
  //           subnet_name: null,
  //           vpc_name: null,
  //           ssh_keys: [],
  //         });
  //         state.store.configDotJson.vpcs.shift();
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0].subnet_name,
  //           null,
  //           "it should set to null"
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0].vpc_name,
  //           null,
  //           "it should set to null"
  //         );
  //       });
  //       it("should not remove found subnet names", () => {
  //         let state = new newState();
  //         state.store.configDotJson.teleport_vsi.push({
  //           name: "test",
  //           subnet_name: "vsi-zone-1",
  //           vpc_name: "management",
  //           ssh_keys: [],
  //         });
  //         state.update();
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0].subnet_name,
  //           "vsi-zone-1",
  //           "it should set to value"
  //         );
  //       });
  //     });
  //     describe("teleport_vsi.create", () => {
  //       it("should return the correct vsi deployment", () => {
  //         let state = new newState("mixed");
  //         state.teleport_vsi.create(
  //           {
  //             name: "test-vsi",
  //             vpc_name: "management",
  //             hideSecurityGroup: true,
  //           },
  //           { isTeleport: true }
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0],
  //           {
  //             name: "test-vsi",
  //             machine_type: null,
  //             image_name: null,
  //             resource_group: null,
  //             security_groups: [],
  //             security_group: {
  //               name: "test-vsi-sg",
  //               rules: [
  //                 {
  //                   direction: "inbound",
  //                   name: "allow-ibm-inbound",
  //                   source: "161.26.0.0/16",
  //                   tcp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "inbound",
  //                   name: "allow-vpc-inbound",
  //                   source: "10.0.0.0/8",
  //                   tcp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "outbound",
  //                   name: "allow-vpc-outbound",
  //                   source: "10.0.0.0/8",
  //                   tcp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "outbound",
  //                   name: "allow-ibm-tcp-53-outbound",
  //                   source: "161.26.0.0/16",
  //                   tcp: {
  //                     port_max: 53,
  //                     port_min: 53,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "outbound",
  //                   name: "allow-ibm-tcp-80-outbound",
  //                   source: "161.26.0.0/16",
  //                   tcp: {
  //                     port_max: 80,
  //                     port_min: 80,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "outbound",
  //                   name: "allow-ibm-tcp-443-outbound",
  //                   source: "161.26.0.0/16",
  //                   tcp: {
  //                     port_max: 443,
  //                     port_min: 443,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "inbound",
  //                   name: "allow-inbound-443",
  //                   source: "0.0.0.0/0",
  //                   tcp: {
  //                     port_max: 443,
  //                     port_min: 443,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //                 {
  //                   direction: "outbound",
  //                   name: "allow-all-outbound",
  //                   source: "0.0.0.0/0",
  //                   tcp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                   icmp: {
  //                     code: null,
  //                     type: null,
  //                   },
  //                   udp: {
  //                     port_max: null,
  //                     port_min: null,
  //                   },
  //                 },
  //               ],
  //             },
  //             subnet_name: null,
  //             ssh_keys: [],
  //             vpc_name: "management",
  //             boot_volume_encryption_key_name: null,
  //           },
  //           "it should return correct server"
  //         );
  //       });
  //     });
  //     describe("teleport_vsi.save", () => {
  //       it("should update in place with same name", () => {
  //         let state = new newState("mixed");
  //         state.teleport_vsi.create(
  //           { name: "todd", vpc_name: "management" },
  //           { isTeleport: true }
  //         );
  //         let expectedData = {
  //           name: "todd",
  //           machine_type: null,
  //           image_name: null,
  //           security_groups: [],
  //           security_group: {
  //             name: "todd-sg",
  //             rules: [
  //               {
  //                 direction: "inbound",
  //                 name: "allow-ibm-inbound",
  //                 source: "161.26.0.0/16",
  //                 tcp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "inbound",
  //                 name: "allow-vpc-inbound",
  //                 source: "10.0.0.0/8",
  //                 tcp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "outbound",
  //                 name: "allow-vpc-outbound",
  //                 source: "10.0.0.0/8",
  //                 tcp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "outbound",
  //                 name: "allow-ibm-tcp-53-outbound",
  //                 source: "161.26.0.0/16",
  //                 tcp: {
  //                   port_max: 53,
  //                   port_min: 53,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "outbound",
  //                 name: "allow-ibm-tcp-80-outbound",
  //                 source: "161.26.0.0/16",
  //                 tcp: {
  //                   port_max: 80,
  //                   port_min: 80,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "outbound",
  //                 name: "allow-ibm-tcp-443-outbound",
  //                 source: "161.26.0.0/16",
  //                 tcp: {
  //                   port_max: 443,
  //                   port_min: 443,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "inbound",
  //                 name: "allow-inbound-443",
  //                 source: "0.0.0.0/0",
  //                 tcp: {
  //                   port_max: 443,
  //                   port_min: 443,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               {
  //                 direction: "outbound",
  //                 name: "allow-all-outbound",
  //                 source: "0.0.0.0/0",
  //                 tcp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //             ],
  //           },
  //           ssh_keys: [],
  //           vpc_name: "workload",
  //           resource_group: null,
  //           subnet_name: null,
  //           boot_volume_encryption_key_name: null,
  //         };
  //         state.teleport_vsi.save(
  //           { name: "todd", vpc_name: "workload", hideSecurityGroup: true },
  //           { data: { name: "todd" }, isTeleport: "teleport_vsi" }
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi[0],
  //           expectedData,
  //           "it should update in place"
  //         );
  //       });
  //     });
  //     describe("teleport_vsi.delete", () => {
  //       it("should delete a vsi deployment", () => {
  //         let state = new newState("mixed");
  //         state.teleport_vsi.create(
  //           { name: "todd", vpc_name: "management" },
  //           { isTeleport: true }
  //         );
  //         state.teleport_vsi.delete(
  //           {},
  //           { data: { name: "todd" }, isTeleport: true }
  //         );
  //         assert.deepEqual(
  //           state.store.configDotJson.teleport_vsi,
  //           [],
  //           "it should have none servers"
  //         );
  //       });
  //     });
  //     describe("teleport_vsi.security_group", () => {
  //       describe("teleport_vsi.security_group.save", () => {
  //         it("should update the vsi security group name", () => {
  //           let state = new newState("mixed");
  //           state.teleport_vsi.create(
  //             { name: "todd", vpc_name: "management" },
  //             { isTeleport: true }
  //           );
  //           state.teleport_vsi.security_group.save(
  //             { security_group: { name: "frank" } },
  //             { isTeleport: true, data: { name: "todd" } }
  //           );
  //           assert.deepEqual(
  //             state.store.configDotJson.teleport_vsi[0].security_group.name,
  //             "frank",
  //             "frank should be there"
  //           );
  //         });
  //       });
  //       describe("teleport_vsi.security_group.rules", () => {
  //         describe("teleport_vsi.security_group.rules.delete", () => {
  //           it("delete a rule by name", () => {
  //             let state = new newState("mixed");
  //             state.teleport_vsi.create(
  //               { name: "todd", vpc_name: "management" },
  //               { isTeleport: true }
  //             );
  //             state.store.configDotJson.teleport_vsi[0].security_group.rules = [
  //               {
  //                 name: "allow-ibm-tcp-443-outbound",
  //               },
  //             ];
  //             state.teleport_vsi.security_group.rules.delete(
  //               {},
  //               {
  //                 vsiName: "todd",
  //                 data: { name: "allow-ibm-tcp-443-outbound" },
  //                 enableSubmitField: "teleport_vsi",
  //                 isTeleport: true,
  //               }
  //             );
  //             assert.isFalse(
  //               contains(
  //                 splat(
  //                   state.store.configDotJson.teleport_vsi[0].security_group
  //                     .rules,
  //                   "name"
  //                 ),
  //                 "allow-ibm-tcp-443-outbound"
  //               ),
  //               "it should not contain named rule"
  //             );
  //           });
  //         });
  //         describe("teleport_vsi.security_group.rules.save", () => {
  //           // TODO: these 2 tests never worked
  //           // it("should not throw when no name passed", () => {
  //           //   let state = new newState("mixed");
  //           //   state.teleport_vsi.create(
  //           //     { name: "todd", vpc_name: "management" },
  //           //     { isTeleport: true }
  //           //   );
  //           //   state.store.configDotJson.teleport_vsi[0].security_group.rules = [
  //           //     {
  //           //       name: "allow-ibm-tcp-443-outbound",
  //           //     },
  //           //   ];
  //           //   let task = () => {
  //           //     state.teleport_vsi.security_group.rules.save(
  //           //       {
  //           //         name: "allow-ibm-tcp-80-outbound",
  //           //       },
  //           //       {
  //           //         vsiName: "todd",
  //           //         name: "allow-ibm-tcp-443-outbound",
  //           //       }
  //           //     );
  //           //   };
  //           //   assert.doesNotThrow(task, Error, null, "it should not throw");
  //           // });
  //           // it("should not throw when same name passed", () => {
  //           //   let state = new newState("mixed");
  //           //   state.teleport_vsi.create(
  //           //     { name: "todd", vpc_name: "management" },
  //           //     { isTeleport: true }
  //           //   );
  //           //   state.store.configDotJson.teleport_vsi[0].security_group.rules = [
  //           //     {
  //           //       name: "allow-ibm-tcp-443-outbound",
  //           //     },
  //           //   ];
  //           //   let task = () => {
  //           //     state.teleport_vsi.security_group.rules.save(
  //           //       "management-server",
  //           //       "allow-ibm-tcp-443-outbound",
  //           //       {
  //           //         name: "allow-ibm-tcp-443-outbound",
  //           //       }
  //           //     );
  //           //   };
  //           //   assert.doesNotThrow(task, Error, null, "it should not throw");
  //           // });
  //           it("should update a vsi security group rule", () => {
  //             let state = new newState("mixed");
  //             state.teleport_vsi.create(
  //               { name: "todd", vpc_name: "management" },
  //               { isTeleport: true }
  //             );
  //             state.store.configDotJson.teleport_vsi[0].security_group.rules = [
  //               {
  //                 name: "allow-ibm-tcp-443-outbound",
  //               },
  //             ];
  //             state.teleport_vsi.security_group.rules.save(
  //               {
  //                 name: "frog",
  //               },
  //               {
  //                 vsiName: "todd",
  //                 data: { name: "allow-ibm-tcp-443-outbound" },
  //                 isSecurityGroup: true,
  //                 enableSubmitField: "teleport_vsi",
  //                 isTeleport: true,
  //               }
  //             );
  //             assert.isFalse(
  //               contains(
  //                 splat(
  //                   state.store.configDotJson.teleport_vsi[0].security_group
  //                     .rules,
  //                   "name"
  //                 ),
  //                 "allow-ibm-tcp-443-outbound"
  //               ),
  //               "it should not contain named rule"
  //             );
  //             assert.isTrue(
  //               contains(
  //                 splat(
  //                   state.store.configDotJson.teleport_vsi[0].security_group
  //                     .rules,
  //                   "name"
  //                 ),
  //                 "frog"
  //               ),
  //               "frog"
  //             ),
  //               "it should contain rule";
  //           });
  //         });
  //         describe("teleport_vsi.security_group.rules.create", () => {
  //           it("should create a new rule", () => {
  //             let state = new newState("mixed");
  //             state.teleport_vsi.create(
  //               { name: "todd", vpc_name: "management" },
  //               { isTeleport: true }
  //             );
  //             state.store.configDotJson.teleport_vsi[0].security_group.rules = [
  //               {
  //                 name: "allow-ibm-tcp-443-outbound",
  //               },
  //             ];
  //             state.teleport_vsi.security_group.rules.create(
  //               {
  //                 name: "todd",
  //                 source: "8.8.8.8",
  //               },
  //               {
  //                 vsiName: "todd",
  //                 enableSubmitField: "teleport_vsi",
  //                 isSecurityGroup: true,
  //                 isTeleport: true,
  //               }
  //             );
  //             assert.deepEqual(
  //               state.store.configDotJson.teleport_vsi[0].security_group
  //                 .rules[1],
  //               {
  //                 name: "todd",
  //                 source: "8.8.8.8",
  //                 direction: "outbound",
  //                 icmp: {
  //                   code: null,
  //                   type: null,
  //                 },
  //                 udp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //                 tcp: {
  //                   port_max: null,
  //                   port_min: null,
  //                 },
  //               },
  //               "todd should be there"
  //             );
  //           });
  //         });
  //       });
  //     });
  //   });
  // });
  describe("transit_gateway", () => {
    describe("transit_gateway.save", () => {
      it("should update only resource group", () => {
        let state = new newState();
        state.transit_gateway.save({
          transit_gateway_resource_group: "workload-rg",
        });
        assert.deepEqual(
          state.store.configDotJson.transit_gateway_resource_group,
          "workload-rg",
          "it should update resource group"
        );
      });
      it("should update only enable transit gateway", () => {
        let state = new newState();
        state.transit_gateway.save({
          enable_transit_gateway: false,
        });
        assert.isFalse(
          state.store.configDotJson.enable_transit_gateway,
          "it should be false"
        );
      });
      it("should update all fields and call parent.update", () => {
        let state = new newState();
        state.transit_gateway.save({
          transit_gateway_resource_group: "workload-rg",
          transit_gateway_connections: ["management"],
          enable_transit_gateway: false,
        });
        assert.deepEqual(
          state.store.configDotJson.transit_gateway_resource_group,
          "workload-rg",
          "it should update resource group"
        );
        assert.deepEqual(
          state.store.configDotJson.transit_gateway_connections,
          ["management"],
          "it should update connections"
        );
        assert.isFalse(
          state.store.configDotJson.enable_transit_gateway,
          "it should be false"
        );
      });
    });
  });
  describe("vpcs", () => {
    describe("vpcs.save", () => {
      it("should rename a vpc", () => {
        let slz = newState();
        slz.vpcs.save(
          { prefix: "todd", default_network_acl_name: "" },
          { data: { prefix: "management" } }
        );
        assert.isTrue(
          contains(slz.store.vpcList, "todd"),
          "todd should be there"
        );
        assert.isNull(
          slz.store.configDotJson.vpcs[0].default_network_acl_name,
          "it should be null"
        );
        assert.deepEqual(
          slz.store.subnetTiers,
          {
            todd: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
      });
      it("should change edge vpc prefix when updating edge vpc", () => {
        let slz = newState();
        slz.store.edge_vpc_prefix = "management";
        slz.vpcs.save({ prefix: "todd" }, { data: { prefix: "management" } });
        assert.isTrue(
          contains(slz.store.vpcList, "todd"),
          "todd should be there"
        );
        assert.deepEqual(
          slz.store.subnetTiers,
          {
            todd: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
        assert.deepEqual(
          slz.store.edge_vpc_prefix,
          "todd",
          "it should be todd"
        );
      });
      it("should update another field", () => {
        let slz = newState();
        slz.vpcs.save(
          {
            prefix: "management",
            classic_access: true,
          },
          {
            data: {
              prefix: "management",
            },
          }
        );
        assert.isTrue(
          contains(slz.store.vpcList, "management"),
          "todd should be there"
        );
        assert.deepEqual(
          slz.store.subnetTiers,
          {
            management: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
              { name: "vpn", zones: 1 },
            ],
            workload: [
              { name: "vsi", zones: 3 },
              { name: "vpe", zones: 3 },
            ],
          },
          "it should update subnet tiers"
        );
      });
      it("should correctly save a vpc with no subnet tiers", () => {
        let state = newState();
        state.vpcs.create({ prefix: "test" });
        state.vpcs.save(
          { default_network_acl_name: "todd" },
          { data: { prefix: "test" } }
        );
        assert.deepEqual(
          state.store.configDotJson.vpcs[2].default_network_acl_name,
          "todd",
          "todd should be there"
        );
      });
    });
    describe("vpcs.create", () => {
      it("should create a new vpc with a name and resource group", () => {
        let state = newState();
        state.vpcs.create({ prefix: "test" });
        let expectedData = {
          default_security_group_rules: [],
          flow_logs_bucket_name: null,
          network_acls: [],
          resource_group: null,
          use_public_gateways: {
            "zone-1": false,
            "zone-2": false,
            "zone-3": false,
          },
          prefix: "test",
          classic_access: false,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
          subnets: {
            "zone-1": [],
            "zone-2": [],
            "zone-3": [],
          },
        };
        let actualData = state.store.configDotJson.vpcs[2];
        assert.deepEqual(actualData, expectedData, "it should create new vpc");
      });
    });
    describe("vpcs.delete", () => {
      it("should delete a vpc from config", () => {
        let state = newState();
        state.vpcs.delete({}, { data: { prefix: "management" } });
        let expectedData = [
          {
            classic_access: false,
            default_network_acl_name: null,
            default_routing_table_name: null,
            default_security_group_name: null,
            default_security_group_rules: [],
            flow_logs_bucket_name: "workload-bucket",
            network_acls: [
              {
                add_cluster_rules: true,
                name: "workload-acl",
                rules: [
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-all-network-inbound",
                    source: "10.0.0.0/8",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                  {
                    action: "allow",
                    destination: "0.0.0.0/0",
                    direction: "outbound",
                    name: "allow-all-outbound",
                    source: "0.0.0.0/0",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            prefix: "workload",
            resource_group: "workload-rg",
            subnets: {
              "zone-1": [
                {
                  acl_name: "workload-acl",
                  cidr: "10.40.10.0/24",
                  name: "vsi-zone-1",
                  public_gateway: false,
                },
                {
                  acl_name: "workload-acl",
                  cidr: "10.40.20.0/24",
                  name: "vpe-zone-1",
                  public_gateway: false,
                },
              ],
              "zone-2": [
                {
                  acl_name: "workload-acl",
                  cidr: "10.50.10.0/24",
                  name: "vsi-zone-2",
                  public_gateway: false,
                },
                {
                  acl_name: "workload-acl",
                  cidr: "10.50.20.0/24",
                  name: "vpe-zone-2",
                  public_gateway: false,
                },
              ],
              "zone-3": [
                {
                  acl_name: "workload-acl",
                  cidr: "10.60.10.0/24",
                  name: "vsi-zone-3",
                  public_gateway: false,
                },
                {
                  acl_name: "workload-acl",
                  cidr: "10.60.20.0/24",
                  name: "vpe-zone-3",
                  public_gateway: false,
                },
              ],
            },
            use_public_gateways: {
              "zone-1": false,
              "zone-2": false,
              "zone-3": false,
            },
          },
        ];
        assert.deepEqual(
          state.store.configDotJson.vpcs,
          expectedData,
          "it should have only one vpcs"
        );
      });
    });
    describe("vpcs.subnets", () => {
      describe("vpcs.subnets.save", () => {
        it("should update a subnet in place", () => {
          let slz = newState();
          slz.vpcs.subnets.save(
            {
              name: "frog",
            },
            {
              prefix: "management",
              subnet: { name: "vpn-zone-1" },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets["zone-1"][2].name,
            "frog",
            "it should be frog"
          );
        });
        it("should update a subnet in place", () => {
          let slz = newState();
          slz.vpcs.subnets.save(
            {
              name: "frog",
              acl_name: "",
            },
            {
              prefix: "management",
              subnet: { name: "vpn-zone-1" },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets["zone-1"][2].acl_name,
            null,
            "it should be null"
          );
        });
        it("should update a subnet in place using field other than name", () => {
          let slz = newState();
          slz.setUpdateCallback(() => {});
          slz.vpcs.subnets.save(
            {
              cidr: "1.2.3.4/32",
            },
            {
              prefix: "management",
              subnet: {
                name: "vpn-zone-1",
              },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets["zone-1"][2].cidr,
            "1.2.3.4/32",
            "it should be frog"
          );
        });
      });
      describe("vpcs.subnets.delete", () => {
        it("should delete a subnet from a vpc", () => {
          let slz = newState();
          slz.setUpdateCallback(() => {});
          slz.vpcs.subnets.delete(
            {},
            {
              prefix: "management",
              subnet: {
                name: "vpn-zone-1",
              },
            }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets["zone-1"].length,
            2,
            "it should delete subnet"
          );
        });
      });
      describe("vpcs.subnets.create", () => {
        it("should create a subnet in a zone", () => {
          let slz = newState();
          slz.setUpdateCallback(() => {});
          let testData = {
            name: "frog-zone-1",
            cidr: "10.2.3.4/32",
            network_acl: "management-acl",
            public_gateway: true,
          };
          slz.vpcs.subnets.create(testData, { prefix: "management" });
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets["zone-1"][3],
            testData,
            "it should be frog"
          );
        });
      });
    });
    describe("vpcs.subnetTiers", () => {
      describe("vpcs.subnetTiers.save", () => {
        it("should update a subnet tier in place", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "frog-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "frog-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "frog-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: null,
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "frog-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: null,
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": true,
                          "zone-3": true,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with nacl and gateway when only one gateway is enabled", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "frog-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: null,
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "frog-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: null,
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "frog",
              zones: 2,
              networkAcl: "todd",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vsi" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": false,
                          "zone-3": false,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-2",
                cidr: "10.20.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": true,
                          "zone-3": false,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 1 zone pgw", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-2",
                cidr: "10.20.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": false,
                          "zone-3": false,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should update a subnet tier in place with additional zones and with no acl and 2 zone pgw", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-2",
                cidr: "10.20.30.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.save(
            {
              name: "vpn",
              zones: 2,
              networkAcl: "",
              addPublicGateway: true,
            },
            {
              vpc_name: "management",
              tier: { name: "vpn" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": true,
                          "zone-3": false,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should expand a reserved edge subnet tier in place with additional zones", () => {
          let vpcState = newState();
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "f5-bastion-zone-1",
                acl_name: null,
                public_gateway: false,
                cidr: "10.5.60.0/24",
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "f5-bastion-zone-2",
                acl_name: null,
                public_gateway: false,
                cidr: "10.6.60.0/24",
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "f5-bastion-zone-3",
                acl_name: null,
                public_gateway: false,
                cidr: "10.7.60.0/24",
              },
            ],
          };
          vpcState.store.edge_vpc_prefix = "management";
          vpcState.store.subnetTiers.management.unshift({
            name: "f5-bastion",
            zones: 1,
          });
          vpcState.vpcs.subnetTiers.save(
            {
              name: "f5-bastion",
              zones: 3,
            },
            {
              vpc_name: "management",
              tier: { name: "f5-bastion" },
              slz: {
                store: {
                  configDotJson: {
                    vpcs: [
                      {
                        prefix: "management",
                        use_public_gateways: {
                          "zone-1": true,
                          "zone-2": true,
                          "zone-3": false,
                        },
                      },
                    ],
                  },
                },
              },
            }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
      describe("vpcs.subnetTiers.create", () => {
        it("should add a subnet tier to vpc", () => {
          let vpcState = new newState();
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management-acl",
            },
            { vpc_name: "management" }
          );
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-1",
                cidr: "10.10.40.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-2",
                cidr: "10.20.40.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-3",
                cidr: "10.30.40.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add a subnet tier to vpc with pgw", () => {
          let vpcState = new newState();
          vpcState.store.configDotJson.vpcs[0].use_public_gateways[
            "zone-1"
          ] = true;
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
              networkAcl: "management-acl",
              addPublicGateway: true,
            },
            { vpc_name: "management" }
          );
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-1",
                cidr: "10.10.40.0/24",
                acl_name: "management-acl",
                public_gateway: true,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-2",
                cidr: "10.20.40.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-3",
                cidr: "10.30.40.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
            ],
          };
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should add a subnet tier to vpc with no subnet tier", () => {
          let vpcState = new newState();
          vpcState.vpcs.subnetTiers.create(
            {
              name: "test",
              zones: 3,
            },
            { vpc_name: "management" }
          );
          let expectedData = {
            "zone-1": [
              {
                name: "vsi-zone-1",
                cidr: "10.10.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-1",
                cidr: "10.10.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpn-zone-1",
                cidr: "10.10.30.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-1",
                cidr: "10.10.40.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                name: "vsi-zone-2",
                cidr: "10.20.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-2",
                cidr: "10.20.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-2",
                cidr: "10.20.40.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                name: "vsi-zone-3",
                cidr: "10.30.10.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "vpe-zone-3",
                cidr: "10.30.20.0/24",
                acl_name: "management-acl",
                public_gateway: false,
              },
              {
                name: "test-zone-3",
                cidr: "10.30.40.0/24",
                acl_name: null,
                public_gateway: false,
              },
            ],
          };
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
      describe("vpcs.subnetTiers.delete", () => {
        it("should delete a subnet tier", () => {
          let vpcState = new newState();
          let expectedData = {
            "zone-1": [
              {
                acl_name: "management-acl",
                cidr: "10.10.10.0/24",
                name: "vpe-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.10.20.0/24",
                name: "vpn-zone-1",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                acl_name: "management-acl",
                cidr: "10.20.10.0/24",
                name: "vpe-zone-2",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                acl_name: "management-acl",
                cidr: "10.30.10.0/24",
                name: "vpe-zone-3",
                public_gateway: false,
              },
            ],
          };
          vpcState.vpcs.subnetTiers.delete(
            {},
            { vpc_name: "management", tier: { name: "vsi" } }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
        it("should delete a subnet tier and leave F5 subnets in place", () => {
          let vpcState = new newState();
          let expectedData = {
            "zone-1": [
              {
                acl_name: "management-acl",
                cidr: "10.10.10.0/24",
                name: "vpe-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.10.20.0/24",
                name: "vpn-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.5.60.0/24",
                name: "f5-bastion-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "f5-external-acl",
                cidr: "10.5.40.0/24",
                name: "f5-external-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.5.30.0/24",
                name: "f5-management-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.5.50.0/24",
                name: "f5-workload-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.5.10.0/24",
                name: "vpn-1-zone-1",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.5.20.0/24",
                name: "vpn-2-zone-1",
                public_gateway: false,
              },
            ],
            "zone-2": [
              {
                acl_name: "management-acl",
                cidr: "10.20.10.0/24",
                name: "vpe-zone-2",
                public_gateway: false,
              },

              {
                acl_name: "management-acl",
                cidr: "10.6.60.0/24",
                name: "f5-bastion-zone-2",
                public_gateway: false,
              },
              {
                acl_name: "f5-external-acl",
                cidr: "10.6.40.0/24",
                name: "f5-external-zone-2",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.6.30.0/24",
                name: "f5-management-zone-2",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.6.50.0/24",
                name: "f5-workload-zone-2",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.6.10.0/24",
                name: "vpn-1-zone-2",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.6.20.0/24",
                name: "vpn-2-zone-2",
                public_gateway: false,
              },
            ],
            "zone-3": [
              {
                acl_name: "management-acl",
                cidr: "10.30.10.0/24",
                name: "vpe-zone-3",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.7.60.0/24",
                public_gateway: false,
                name: "f5-bastion-zone-3",
              },
              {
                acl_name: "f5-external-acl",
                cidr: "10.7.40.0/24",
                name: "f5-external-zone-3",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.7.30.0/24",
                name: "f5-management-zone-3",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.7.50.0/24",
                name: "f5-workload-zone-3",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.7.10.0/24",
                name: "vpn-1-zone-3",
                public_gateway: false,
              },
              {
                acl_name: "management-acl",
                cidr: "10.7.20.0/24",
                name: "vpn-2-zone-3",
                public_gateway: false,
              },
            ],
          };
          vpcState.createEdgeVpc("vpn-and-waf", true);
          vpcState.vpcs.subnetTiers.delete(
            { name: "vsi", zones: 3 },
            { vpc_name: "management", tier: { name: "vsi", zones: 3 } }
          );
          assert.deepEqual(
            vpcState.store.configDotJson.vpcs[0].subnets,
            expectedData,
            "it should change subnets"
          );
        });
      });
    });
    describe("vpcs.network_acls", () => {
      describe("vpcs.network_acls.create", () => {
        it("should create an acl", () => {
          let slz = newState();
          slz.vpcs.network_acls.create(
            { name: "new", add_cluster_rules: true },
            { vpc_name: "management" }
          );
          let expectedData = {
            name: "new",
            add_cluster_rules: true,
            rules: [],
          };
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls[1],
            expectedData,
            "it should create acl"
          );
        });
      });
      describe("vpcs.network_acls.delete", () => {
        it("should delete an acl", () => {
          let slz = newState();
          slz.vpcs.network_acls.delete(
            {},
            { data: { name: "management-acl" }, arrayParentName: "management" }
          );
          let expectedData = [];
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls,
            expectedData,
            "it should create acl"
          );
        });
        it("should set subnet acls to null on delete", () => {
          let slz = newState();
          slz.vpcs.network_acls.delete(
            {},
            { data: { name: "management-acl" }, arrayParentName: "management" }
          );
          let expectedData = [];
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls,
            expectedData,
            "it should create acl"
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].subnets,
            {
              "zone-1": [
                {
                  acl_name: null,
                  cidr: "10.10.10.0/24",
                  name: "vsi-zone-1",
                  public_gateway: false,
                },
                {
                  acl_name: null,
                  cidr: "10.10.20.0/24",
                  name: "vpe-zone-1",
                  public_gateway: false,
                },
                {
                  acl_name: null,
                  cidr: "10.10.30.0/24",
                  name: "vpn-zone-1",
                  public_gateway: false,
                },
              ],
              "zone-2": [
                {
                  acl_name: null,
                  cidr: "10.20.10.0/24",
                  name: "vsi-zone-2",
                  public_gateway: false,
                },
                {
                  acl_name: null,
                  cidr: "10.20.20.0/24",
                  name: "vpe-zone-2",
                  public_gateway: false,
                },
              ],
              "zone-3": [
                {
                  acl_name: null,
                  cidr: "10.30.10.0/24",
                  name: "vsi-zone-3",
                  public_gateway: false,
                },
                {
                  acl_name: null,
                  cidr: "10.30.20.0/24",
                  name: "vpe-zone-3",
                  public_gateway: false,
                },
              ],
            },
            "it should have correct subnets"
          );
        });
      });
      describe("vpcs.network_acls.save", () => {
        it("should update an acl", () => {
          let slz = newState();
          slz.vpcs.network_acls.save(
            { name: "new", add_cluster_rules: false },
            { data: { name: "management-acl" }, arrayParentName: "management" }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls[0].name,
            "new",
            "it should create acl"
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls[0].add_cluster_rules,
            false,
            "it should create acl"
          );
        });
        it("should update an acl with no name change", () => {
          let slz = newState();
          slz.vpcs.network_acls.save(
            { name: "management-acl", add_cluster_rules: false },
            { data: { name: "management-acl" }, arrayParentName: "management" }
          );
          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls[0].add_cluster_rules,
            false,
            "it should create acl"
          );
        });
        it("should update a rule in place with protocol and change port values to numbers from string", () => {
          let slz = newState();
          slz.vpcs.network_acls.rules.save(
            {
              name: "frog",
              allow: false,
              inbound: true,
              source: "1.2.3.4",
              destination: "5.6.7.8",
              ruleProtocol: "tcp",
              rule: {
                port_max: "8080",
                port_min: null,
              },
            },
            {
              vpc_name: "management",
              parent_name: "management-acl",
              data: { name: "allow-all-outbound" },
            }
          );
          let expectedData = [
            {
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              action: "allow",
              direction: "inbound",
              destination: "10.0.0.0/8",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
            {
              action: "deny",
              direction: "inbound",
              destination: "5.6.7.8",
              name: "frog",
              source: "1.2.3.4",
              icmp: {
                type: null,
                code: null,
              },
              tcp: {
                port_min: null,
                port_max: 8080,
                source_port_min: null,
                source_port_max: null,
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null,
              },
            },
          ];

          assert.deepEqual(
            slz.store.configDotJson.vpcs[0].network_acls[0].rules,
            expectedData,
            "it should add rule"
          );
        });
      });
      describe("vpcs.network_acls.rules", () => {
        describe("vpcs.network_acls.rules.create", () => {
          it("should create a network acl rule", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.create(
              {
                name: "frog",
                action: "allow",
                direction: "inbound",
                source: "8.8.8.8",
                destination: "0.0.0.0/0",
              },
              {
                vpc_name: "management",
                parent_name: "management-acl",
              }
            );
            let expectedData = [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "inbound",
                destination: "0.0.0.0/0",
                name: "frog",
                source: "8.8.8.8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];

            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
          it("should create a network acl rule with deny outbound", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.create(
              {
                name: "frog",
                action: "deny",
                direction: "outbound",
                source: "8.8.8.8",
                destination: "0.0.0.0/0",
              },
              {
                vpc_name: "management",
                parent_name: "management-acl",
              }
            );
            let expectedData = [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "deny",
                direction: "outbound",
                destination: "0.0.0.0/0",
                name: "frog",
                source: "8.8.8.8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];

            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
        });
        describe("vpcs.network_acls.rules.save", () => {
          it("should update a rule in place with all", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.save(
              {
                name: "frog",
                allow: false,
                inbound: true,
                source: "1.2.3.4",
                destination: "5.6.7.8",
                ruleProtocol: "all",
              },
              {
                vpc_name: "management",
                parent_name: "management-acl",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "deny",
                direction: "inbound",
                destination: "5.6.7.8",
                name: "frog",
                source: "1.2.3.4",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];

            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
          it("should update a rule in place with protocol", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.save(
              {
                name: "frog",
                allow: false,
                inbound: true,
                source: "1.2.3.4",
                destination: "5.6.7.8",
                ruleProtocol: "tcp",
                rule: {
                  port_max: 8080,
                  port_min: null,
                },
              },
              {
                vpc_name: "management",
                parent_name: "management-acl",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "deny",
                direction: "inbound",
                destination: "5.6.7.8",
                name: "frog",
                source: "1.2.3.4",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: 8080,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];

            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
          it("should update a rule in place with only one change protocol", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.save(
              {
                name: "allow-all-outbound",
                allow: true,
                inbound: false,
                source: "10.0.0.0/8",
                destination: "0.0.0.0/0",
                ruleProtocol: "tcp",
                rule: {
                  port_max: 8080,
                  port_min: null,
                },
              },
              {
                vpc_name: "management",
                parent_name: "management-acl",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "outbound",
                destination: "0.0.0.0/0",
                name: "allow-all-outbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: 8080,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];

            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
        });
        describe("vpcs.network_acls.rules.delete", () => {
          it("should delete an acl rule", () => {
            let slz = newState();
            slz.vpcs.network_acls.rules.delete(
              {},
              {
                vpc_name: "management",
                parent_name: "management-acl",
                data: { name: "allow-all-outbound" },
              }
            );
            let expectedData = [
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                direction: "inbound",
                destination: "10.0.0.0/8",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ];
            assert.deepEqual(
              slz.store.configDotJson.vpcs[0].network_acls[0].rules,
              expectedData,
              "it should add rule"
            );
          });
        });
      });
    });
  });
  describe("virtual_private_endpoints", () => {
    describe("virtual_private_endpoints.init", () => {
      it("should initialize with default vpe", () => {
        let state = new newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "service-rg",
            vpcs: [
              {
                name: "management",
                security_group_name: "management-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
    });
    describe("virtual_private_endpoints.onStoreUpdate", () => {
      it("should remove a vpc from the list of vpcs after deletion", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "service-rg",
            vpcs: [
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];
        state.store.configDotJson.vpcs.shift();
        state.update();
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
      it("should remove subnets from a vpc after deletion", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "service-rg",
            vpcs: [
              {
                name: "management",
                security_group_name: "management-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: [],
              },
            ],
          },
        ];
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vpe-zone-1",
            },
          }
        );
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vpe-zone-2",
            },
          }
        );
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "workload",
            subnet: {
              name: "vpe-zone-3",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
      it("should remove unfound resource groups", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: null,
            vpcs: [
              {
                name: "management",
                security_group_name: "management-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];

        state.resource_groups.delete({}, { data: { name: "service-rg" } });
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
      it("should remove unfound security groups", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "service-rg",
            vpcs: [
              {
                name: "management",
                security_group_name: null,
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];
        state.security_groups.create({ name: "frog" });
        state.store.configDotJson.virtual_private_endpoints[0].vpcs[0].security_group_name =
          "frog";
        state.update();
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
    });
    describe("virtual_private_endpoints.delete", () => {
      it("should delete a vpe", () => {
        let state = newState();
        state.virtual_private_endpoints.delete(
          {},
          { data: { service_name: "cos" } }
        );
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          [],
          "it should delete"
        );
      });
    });
    describe("virtual_private_endpoints.update", () => {
      it("should update a vpe", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "management-rg",
            vpcs: [
              {
                name: "management",
                security_group_name: "management-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];
        state.virtual_private_endpoints.save(
          {
            vpe: {
              service_name: "cos",
              vpcs: [
                {
                  name: "management",
                  security_group_name: "management-vpe-sg",
                  subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
                },
                {
                  name: "workload",
                  security_group_name: "workload-vpe-sg",
                  subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
                },
              ],
              resource_group: "management-rg",
            },
            vpcData: {
              management: {
                name: "management",
                security_group_name: "management-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              workload: {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            },
          },
          {
            data: {
              service_name: "cos",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
      it("should update a vpe with empty security group string", () => {
        let state = newState();
        let expectedData = [
          {
            service_name: "cos",
            service_type: "cloud-object-storage",
            resource_group: "management-rg",
            vpcs: [
              {
                name: "management",
                security_group_name: null,
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            ],
          },
        ];
        state.virtual_private_endpoints.save(
          {
            vpe: {
              service_name: "cos",
              vpcs: [
                {
                  name: "management",
                  security_group_name: "management-vpe-sg",
                  subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
                },
                {
                  name: "workload",
                  security_group_name: "workload-vpe-sg",
                  subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
                },
              ],
              resource_group: "management-rg",
            },
            vpcData: {
              management: {
                name: "management",
                security_group_name: "",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
              workload: {
                name: "workload",
                security_group_name: "workload-vpe-sg",
                subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
              },
            },
          },
          {
            data: {
              service_name: "cos",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints,
          expectedData,
          "it should return data"
        );
      });
    });
    describe("virtual_private_endpoints.create", () => {
      it("should create a vpe", () => {
        let state = newState();
        let expectedData = {
          service_name: "todd",
          service_type: "cloud-object-storage",
          resource_group: "management-rg",
          vpcs: [
            {
              name: "management",
              security_group_name: null,
              subnets: ["vpe-zone-1"],
            },
          ],
        };
        state.virtual_private_endpoints.create({
          vpe: {
            service_name: "todd",
            service_type: "cloud-object-storage",
            resource_group: "management-rg",
          },
          vpcData: {
            management: {
              name: "management",
              subnets: ["vpe-zone-1"],
              security_group_name: "",
            },
          },
        });
        assert.deepEqual(
          state.store.configDotJson.virtual_private_endpoints[1],
          expectedData,
          "it should return data"
        );
      });
    });
  });
  describe("vpn_gateways", () => {
    describe("vpn_gateways.init", () => {
      it("should initialize vpn for default patterns", () => {
        let state = new newState();
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          [
            {
              connections: [],
              name: "management-gateway",
              resource_group: "management-rg",
              subnet_name: "vpn-zone-1",
              vpc_name: "management",
            },
          ],
          "it should create vpn gateway"
        );
      });
    });
    describe("vpn_gatways.onStoreUpdate", () => {
      it("should remove subnet name and vpc name on deletion", () => {
        let state = new newState("vsi");
        let expectedData = [
          {
            connections: [],
            name: "management-gateway",
            resource_group: "management-rg",
            subnet_name: null,
            vpc_name: null,
          },
        ];
        state.vpcs.delete({}, { data: { prefix: "management" } });
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should update gateways"
        );
      });
      it("should remove unfound subnet name if vpc exists", () => {
        let state = new newState("vsi");
        let expectedData = [
          {
            connections: [],
            name: "management-gateway",
            resource_group: "management-rg",
            subnet_name: null,
            vpc_name: "management",
          },
        ];
        state.vpcs.subnets.delete(
          {},
          {
            prefix: "management",
            subnet: {
              name: "vpn-zone-1",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should update gateways"
        );
      });
      it("should remove unfound resource groups", () => {
        let state = new newState("vsi");
        let expectedData = [
          {
            connections: [],
            name: "management-gateway",
            resource_group: null,
            subnet_name: "vpn-zone-1",
            vpc_name: "management",
          },
        ];
        state.resource_groups.delete({}, { data: { name: "management-rg" } });
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should update gateways"
        );
      });
    });
    describe("vpn_gateways.delete", () => {
      it("should delete a vpn gateway by name", () => {
        let state = new newState();
        state.vpn_gateways.delete({}, { data: { name: "management-gateway" } });
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          [],
          "it should delete the gw"
        );
      });
    });
    describe("vpn_gateways.save", () => {
      it("should update a vpn gateway", () => {
        let state = new newState();
        let expectedData = [
          {
            connections: [],
            name: "todd",
            resource_group: "management-rg",
            subnet_name: "vpe-zone-1",
            vpc_name: "workload",
          },
        ];
        state.vpn_gateways.save(
          {
            name: "todd",
            vpc_name: "workload",
            subnet_name: "vpe-zone-1",
          },
          {
            data: {
              name: "management-gateway",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should change the gw"
        );
      });
      it("should update a vpn gateway with same name different everything else", () => {
        let state = new newState();
        let expectedData = [
          {
            connections: [],
            name: "management-gateway",
            resource_group: "workload-rg",
            subnet_name: "vpe-zone-1",
            vpc_name: "workload",
          },
        ];
        state.vpn_gateways.save(
          {
            name: "management-gateway",
            vpc_name: "workload",
            subnet_name: "vpe-zone-1",
            resource_group: "workload-rg",
          },
          {
            data: {
              name: "management-gateway",
            },
          }
        );
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should change the gw"
        );
      });
    });
    describe("vpn_gateways.create", () => {
      it("should add a new vpn gateway", () => {
        let expectedData = [
          {
            connections: [],
            name: "management-gateway",
            resource_group: "management-rg",
            subnet_name: "vpn-zone-1",
            vpc_name: "management",
          },
          {
            connections: [],
            name: "todd",
            resource_group: null,
            subnet_name: "vpn-zone-1",
            vpc_name: "management",
          },
        ];
        let state = new newState();
        state.vpn_gateways.create({
          name: "todd",
          subnet_name: "vpn-zone-1",
          vpc_name: "management",
        });
        assert.deepEqual(
          state.store.configDotJson.vpn_gateways,
          expectedData,
          "it should add the gw"
        );
      });
    });
  });
  describe("vsi", () => {
    describe("vsi.create", () => {
      it("should return the correct vsi deployment", () => {
        let state = new newState();
        state.vsi.create(
          {
            name: "test-vsi",
            vpc_name: "management",
          },
          {
            isTeleport: false,
          }
        );
        assert.deepEqual(
          state.store.configDotJson.vsi[1],
          {
            name: "test-vsi",
            machine_type: null,
            image_name: null,
            resource_group: null,
            security_group: {
              name: "test-vsi-sg",
              rules: [],
            },
            subnet_names: [],
            ssh_keys: [],
            vpc_name: "management",
            boot_volume_encryption_key_name: null,
            user_data: null,
            vsi_per_subnet: null,
            enable_floating_ip: false,
            security_groups: [],
          },
          "it should return correct server"
        );
      });
    });
    describe("vsi.save", () => {
      it("should update in place with new name", () => {
        let state = new newState("mixed");
        state.vsi.create(
          { name: "todd", vpc_name: "management" },
          { isTeleport: false }
        );
        let expectedData = {
          name: "test-vsi",
          machine_type: null,
          image_name: null,
          security_group: {
            name: "todd-sg",
            rules: [],
          },
          vpc_name: "management",
          subnet_names: [],
          ssh_keys: [],
          resource_group: null,
          boot_volume_encryption_key_name: null,
          user_data: null,
          vsi_per_subnet: null,
          enable_floating_ip: false,
          security_groups: [],
        };
        state.vsi.save(
          { name: "test-vsi" },
          { data: { name: "todd" }, isTeleport: false }
        );
        assert.deepEqual(
          state.store.configDotJson.vsi[1],
          expectedData,
          "it should update in place"
        );
      });
      it("should update in place with same name", () => {
        let state = new newState("mixed");
        state.vsi.create(
          { name: "todd", vpc_name: "management" },
          { isTeleport: false }
        );
        let expectedData = {
          name: "todd",
          machine_type: null,
          image_name: null,
          security_group: {
            name: "todd-sg",
            rules: [],
          },
          ssh_keys: [],
          vpc_name: "workload",
          resource_group: null,
          subnet_names: [],
          boot_volume_encryption_key_name: null,
          user_data: null,
          vsi_per_subnet: null,
          enable_floating_ip: false,
          security_groups: [],
        };
        state.vsi.save(
          { name: "todd", vpc_name: "workload" },
          { data: { name: "todd" }, isTeleport: false }
        );
        assert.deepEqual(
          state.store.configDotJson.vsi[1],
          expectedData,
          "it should update in place"
        );
      });
    });
    describe("vsi.delete", () => {
      it("should delete a vsi deployment", () => {
        let state = new newState("mixed");
        state.vsi.delete({}, { data: { name: "management-server" } });
        assert.deepEqual(
          state.store.configDotJson.vsi,
          [],
          "it should have none servers"
        );
      });
    });
    describe("vsi.onStoreUpdate", () => {
      it("should set encryption key to null when deleted", () => {
        let state = new newState("mixed");
        state.key_management.keys.delete(
          {},
          { data: { name: "slz-vsi-volume-key" }, isTeleport: false }
        );
        assert.deepEqual(
          state.store.configDotJson.vsi[0].boot_volume_encryption_key_name,
          null,
          "it should be null"
        );
      });
    });
    describe("vsi.security_group", () => {
      describe("vsi.security_group.save", () => {
        it("should update the vsi security group name", () => {
          let state = new newState("mixed");
          state.vsi.security_group.save(
            { security_group: { name: "frank" } },
            { data: { name: "management-server" } }
          );
          assert.deepEqual(
            state.store.configDotJson.vsi[0].security_group.name,
            "frank",
            "frank should be there"
          );
        });
      });
      describe("vsi.security_group.rules", () => {
        describe("vsi.security_group.rules.delete", () => {
          it("delete a rule by name", () => {
            let state = new newState("mixed");
            state.vsi.security_group.rules.delete(
              {},
              {
                vsiName: "management-server",
                data: { name: "allow-ibm-tcp-443-outbound" },
              }
            );
            assert.isFalse(
              contains(
                splat(
                  state.store.configDotJson.vsi[0].security_group.rules,
                  "name"
                ),
                "allow-ibm-tcp-443-outbound"
              ),
              "it should not contain named rule"
            );
          });
        });
        describe("vsi.security_group.rules.save", () => {
          it("should not throw when no name passed", () => {
            let state = new newState("mixed");
            let task = () => {
              state.vsi.security_group.rules.save(
                {
                  test: "allow-ibm-tcp-80-outbound",
                },
                {
                  vsiName: "management-server",
                  data: { name: "allow-ibm-tcp-443-outbound" },
                  isSecurityGroup: true,
                }
              );
            };
            assert.doesNotThrow(task, Error, null, "it should not throw");
          });
          it("should update a rule in place with protocol and replace string port values to numbers", () => {
            let slz = new newState();
            lazyAddSg(slz);
            slz.security_groups.rules.create(
              {
                name: "test-rule",
                source: "8.8.8.8",
              },
              {
                parent_name: "frog",
              }
            );
            slz.security_groups.rules.save(
              {
                name: "test-rule",
                inbound: true,
                ruleProtocol: "tcp",
                rule: {
                  port_min: "8080",
                  port_max: "8080",
                },
              },
              {
                parent_name: "frog",
                data: { name: "test-rule" },
                isSecurityGroup: true,
              }
            );
            assert.deepEqual(
              slz.store.configDotJson.security_groups[2].rules,
              [
                {
                  name: "test-rule",
                  direction: "inbound",
                  icmp: { type: null, code: null },
                  tcp: { port_min: 8080, port_max: 8080 },
                  udp: { port_min: null, port_max: null },
                  source: "8.8.8.8",
                },
              ],
              "it should update rule"
            );
          });
          it("should not throw when same name passed", () => {
            let state = new newState("mixed");
            let task = () => {
              state.vsi.security_group.rules.save(
                {
                  name: "allow-ibm-tcp-443-outbound",
                },
                {
                  vsiName: "management-server",
                  data: { name: "allow-ibm-tcp-443-outbound" },
                  isSecurityGroup: true,
                }
              );
            };
            assert.doesNotThrow(task, Error, null, "it should not throw");
          });
          it("should update a vsi security group rule", () => {
            let state = new newState("mixed");
            state.vsi.security_group.rules.save(
              {
                name: "frog",
                ruleProtocol: "all",
              },
              {
                vsiName: "management-server",
                data: { name: "allow-ibm-tcp-443-outbound" },
                isSecurityGroup: true,
              }
            );
            assert.isFalse(
              contains(
                splat(
                  state.store.configDotJson.vsi[0].security_group.rules,
                  "name"
                ),
                "allow-ibm-tcp-443-outbound"
              ),
              "it should not contain named rule"
            );
            assert.isTrue(
              contains(
                splat(
                  state.store.configDotJson.vsi[0].security_group.rules,
                  "name"
                ),
                "frog"
              ),
              "frog"
            ),
              "it should contain rule";
          });
        });
        describe("vsi.security_group.rules.create", () => {
          it("should create a new rule", () => {
            let state = new newState("mixed");
            state.vsi.security_group.rules.create(
              {
                name: "todd",
                source: "8.8.8.8",
                action: "allow",
                direction: "inbound",
              },
              {
                vsiName: "management-server",
                isSecurityGroup: true,
              }
            );
            assert.deepEqual(
              state.store.configDotJson.vsi[0].security_group.rules[6],
              {
                name: "todd",
                source: "8.8.8.8",
                direction: "inbound",
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                },
                tcp: {
                  port_max: null,
                  port_min: null,
                },
              },
              "todd should be there"
            );
          });
        });
      });
    });
  });
});
