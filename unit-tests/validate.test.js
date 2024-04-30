import { assert } from "chai";
import { validate } from "../client/src/lib/validate.js";
import { eachKey, splat } from "lazy-z";
import goodOverride from "./data-files/good-override.json" assert { type: "json" };
import overrideVersion from "./data-files/override-versions.json" assert { type: "json" };

const minimumValidJson = (data) => {
  let newData = {
    appid: {
      use_appid: false,
    },
    atracker: {
      collector_bucket_name: "atracker-bucket",
      receive_global_events: true,
      resource_group: "slz-service-rg",
      add_route: true,
    },
    cos: [
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
        resource_group: "slz-service-rg",
        use_data: false,
      },
    ],
    clusters: [],
    vsi: [
      {
        boot_volume_encryption_key_name: "slz-vsi-volume-key",
        image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
        machine_type: "cx2-4x8",
        name: "management-server",
        security_group: {
          name: "management",
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
          vpc_name: "management",
        },
        ssh_keys: ["slz-ssh-key"],
        subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc_name: "management",
        vsi_per_subnet: 1,
      },
    ],
    vpcs: [
      {
        default_security_group_rules: [],
        flow_logs_bucket_name: "management-bucket",
        network_acls: [
          {
            add_ibm_cloud_internal_rules: true,
            add_vpc_connectivity_rules: true,
            name: "management-acl",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
              },
              {
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
              },
            ],
          },
        ],
        prefix: "management",
        resource_group: "slz-management-rg",
        subnets: {
          "zone-1": [
            {
              acl_name: "management-acl",
              cidr: "10.10.10.0/24",
              name: "vsi-zone-1",
              public_gateway: false,
            },
            {
              acl_name: "management-acl",
              cidr: "10.10.20.0/24",
              name: "vpe-zone-1",
              public_gateway: false,
            },
            {
              acl_name: "management-acl",
              cidr: "10.10.30.0/24",
              name: "vpn-zone-1",
              public_gateway: false,
            },
          ],
          "zone-2": [
            {
              acl_name: "management-acl",
              cidr: "10.20.10.0/24",
              name: "vsi-zone-2",
              public_gateway: false,
            },
            {
              acl_name: "management-acl",
              cidr: "10.20.20.0/24",
              name: "vpe-zone-2",
              public_gateway: false,
            },
          ],
          "zone-3": [
            {
              acl_name: "management-acl",
              cidr: "10.30.10.0/24",
              name: "vsi-zone-3",
              public_gateway: false,
            },
            {
              acl_name: "management-acl",
              cidr: "10.30.20.0/24",
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
      {
        default_security_group_rules: [],
        flow_logs_bucket_name: "workload-bucket",
        network_acls: [
          {
            add_ibm_cloud_internal_rules: true,
            add_vpc_connectivity_rules: true,
            name: "workload-acl",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
              },
              {
                action: "allow",
                destination: "0.0.0.0/0",
                direction: "outbound",
                name: "allow-all-outbound",
                source: "0.0.0.0/0",
              },
            ],
          },
        ],
        prefix: "workload",
        resource_group: "slz-workload-rg",
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
    ],
    ssh_keys: [],
    transit_gateway_connections: [],
    transit_gateway_resource_group: "test",
    virtual_private_endpoints: [
      {
        service_name: "cos",
        service_type: "cloud-object-storage",
        resource_group: "slz-service-rg",
        vpcs: [
          {
            name: "management",
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
          {
            name: "workload",
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
        ],
      },
    ],
    security_groups: [],
    service_endpoints: "private",
    vpn_gateways: [
      {
        connections: [],
        name: "management-gateway",
        resource_group: "slz-management-rg",
        subnet_name: "vpn-zone-1",
        vpc_name: "management",
      },
    ],
    key_management: {
      keys: [
        {
          key_ring: "slz-slz-ring",
          name: "slz-slz-key",
          root_key: true,
        },
        {
          key_ring: "slz-slz-ring",
          name: "slz-atracker-key",
          root_key: true,
        },
        {
          key_ring: "slz-slz-ring",
          name: "slz-vsi-volume-key",
          root_key: true,
        },
        {
          key_ring: "slz-slz-ring",
          name: "slz-roks-key",
          root_key: true,
        },
      ],
      name: "slz-slz-kms",
      resource_group: "slz-service-rg",
      use_hs_crypto: false,
    },
    teleport_vsi: [],
    f5_vsi: [],
    resource_groups: [
      {
        create: true,
        name: "slz-service-rg",
      },
      {
        create: true,
        name: "slz-management-rg",
      },
      {
        create: true,
        name: "slz-workload-rg",
      },
    ],
  };
  eachKey(data || {}, (key) => {
    newData[key] = data[key];
  });
  return newData;
};

function defaultCluster() {
  return {
    cos_name: "cos",
    entitlement: "cloud_pak",
    kube_type: "openshift",
    kube_version: "default",
    machine_type: "bx2.16x64",
    name: "workload-cluster",
    resource_group: "slz-workload-rg",
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
}

describe("validate", () => {
  describe("atracker", () => {
    it("should throw an error if atracker collector bucket name is null", () => {
      let testData = minimumValidJson({
        atracker: {
          add_route: false,
          receive_global_events: false,
          resource_group: "slz-service-rg",
          collector_bucket_name: null,
        },
      });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "Activity Tracker must have a valid bucket name. Got `null`"
      );
    });
    it("should not throw when cos has valid key", () => {
      let testData = minimumValidJson({
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
        resource_group: "slz-service-rg",
        use_data: false,
      });
      let task = () => validate(testData);
      assert.doesNotThrow(task, Error, null, "it should not throw");
    });
  });
  describe("cos", () => {
    it("should throw an error if no object storage instances are provisioned", () => {
      let testData = minimumValidJson({ cos: [] });
      let task = () => {
        validate(testData);
      };
      assert.throws(
        task,
        "At least one Object Storage Instance is required. Got 0"
      );
    });
  });
  describe("clusters", () => {
    it("should throw an error if an openshift cluster has a null cos name", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.cos_name = null;
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "OpenShift clusters require a cos instance. Cluster `workload-cluster` cos_name is null."
      );
    });
    it("should throw an error if a cluster has a null vpc name", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.vpc_name = null;
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Clusters require a VPC Name, `workload-cluster` vpc_name is null."
      );
    });
    it("should throw an error if a cluster has no subnet names", () => {
      let invalidCluster = defaultCluster();
      invalidCluster.subnet_names = [];
      let testData = minimumValidJson({ clusters: [invalidCluster] });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Clusters require at least one subnet to provision, `workload-cluster` subnet_names is []."
      );
    });
    describe("worker_pools", () => {
      it("should throw an error if a cluster worker pool has no subnet names", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.worker_pools[0].subnet_names = [];
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData);
        assert.throws(
          task,
          "Worker Pools require at least one subnet to provision, `workload-cluster` worker_pool `logging-worker-pool` subnet_names is []."
        );
      });
    });
  });
  describe("security_groups", () => {
    // TODO: test never worked
    // it("should test security groups when added", () => {
    //   let testData = minimumValidJson({
    //     security_groups: [
    //       {
    //         name: "todd",
    //         vpc_name: "management",
    //         resource_group: "todd",
    //       },
    //     ],
    //   });
    //   let task = () => validate(testData);
    //   assert.doesNotThrow(task, Error, null, "it should not throw when all valid");
    // });
    it("should convert a security group rule with string port numbers to have number values", () => {
      let testData = minimumValidJson({
        security_groups: [
          {
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_min: "80",
                  port_max: "80",
                },
              },
            ],
            name: "todd",
            vpc_name: "management",
            resource_group: "todd",
          },
        ],
      });
      let expectedData = [
        {
          rules: [
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_min: 80,
                port_max: 80,
              },
              icmp: {
                code: null,
                type: null,
              },
              udp: {
                port_min: null,
                port_max: null,
              },
            },
          ],
          name: "todd",
          vpc_name: "management",
          resource_group: "todd",
        },
      ];
      validate(testData);
      assert.deepEqual(
        testData.security_groups,
        expectedData,
        "should convert port to numbers"
      );
    });
  });
  describe("virtual_private_endpoints", () => {
    it("should throw an error if a vpe has no vpcs", () => {
      let testData = minimumValidJson();
      testData.virtual_private_endpoints[0].vpcs = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "Virtual Private Endpoints must have at least one VPC. Service name `cos` got 0."
      );
    });
    it("should throw an error if a vpe vpc has no subnets", () => {
      let testData = minimumValidJson();
      testData.virtual_private_endpoints[0].vpcs[0].subnets = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "Virtual Private Endpoints must have at least one VPC subnet. Service name `cos` VPC Name `management` has 0."
      );
    });
  });
  describe("vpn_gateways", () => {
    it("should throw an error if vpn gateway subnet is null", () => {
      let testData = minimumValidJson();
      testData.vpn_gateways[0].subnet_name = null;
      let task = () => validate(testData);
      assert.throws(
        task,
        "VPN Gateways require a subnet name, `management-gateway` subnet_name is null."
      );
    });
  });
  describe("vsi", () => {
    it("should throw an error when no ssh keys are provided", () => {
      let testData = minimumValidJson();
      testData.vsi[0].ssh_keys = [];
      let task = () => validate(testData);
      assert.throws(task, "VSIs must have at least one SSH Key, got 0.");
    });
    it("should throw an error when no subnets are provided", () => {
      let testData = minimumValidJson();
      testData.vsi[0].subnet_names = [];
      let task = () => validate(testData);
      assert.throws(
        task,
        "VSIs require at least one subnet to provision, `management-server` subnet_names is []."
      );
    });
  });
  describe("teleport vsi", () => {
    // TODO: test never worked
    // it("should not throw an error when valid subnet name is provided", () => {
    //   let testData = minimumValidJson({
    //     teleport_vsi: [
    //       {
    //         name: "test-vsi",
    //         machine_type: null,
    //         image_name: null,
    //         resource_group: null,
    //         security_group: {
    //           name: "test-vsi-sg",
    //           rules: [],
    //         },
    //         subnet_name: "vsi-zone-1",
    //         ssh_keys: [],
    //         vpc_name: "management",
    //         boot_volume_encryption_key_name: null,
    //       },
    //     ],
    //   });
    //   let task = () => validate(testData);
    //   assert.doesNotThrow(task, Error, null, "it should not throw");
    // });
    it("should throw an error when no subnet names are provided", () => {
      let testData = minimumValidJson({
        teleport_vsi: [
          {
            name: "test-vsi",
            machine_type: null,
            image_name: null,
            resource_group: "slz-management-rg",
            security_group: null,
            subnet_name: null,
            ssh_keys: ["slz-ssh-key"],
            vpc_name: "management",
            boot_volume_encryption_key_name: null,
          },
        ],
      });
      let task = () => validate(testData);
      assert.throws(
        task,
        "Teleport VSIs must have a valid subnet at subnet_name, got null."
      );
    });
  });
  describe("f5 vsi", () => {
    it("should throw an error when no ssh keys and subnet names are provided", () => {
      let testData = minimumValidJson({
        f5_vsi: [
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
            security_group: null,
            ssh_keys: [],
            vpc_name: "edge",
          },
        ],
      });
      let task = () => validate(testData);
      assert.throws(task, "F5 VSIs must have at least one SSH Key, got 0.");
    });
  });
  describe("addUnfoundListFields", () => {
    it("should add unfound fields to valid json", () => {
      let testData = minimumValidJson({
        clusters: [
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
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
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "workload-2",
            kms_config: {
              crk_name: "key",
              private_endpoint: true,
            },
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
        ],
      });
      validate(testData);
      assert.deepEqual(
        splat(testData.resource_groups, "use_prefix"),
        [false, false, false],
        "it should set value"
      );
      assert.deepEqual(
        testData.clusters,
        [
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc_name: "workload",
            kms_config: {
              crk_name: null,
              private_endpoint: true,
            },
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
          {
            cos_name: "cos",
            entitlement: "cloud_pak",
            kube_type: "openshift",
            kube_version: "default",
            machine_type: "bx2.16x64",
            name: "workload-cluster",
            resource_group: "slz-workload-rg",
            subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            kms_config: {
              crk_name: "key",
              private_endpoint: true,
            },
            vpc_name: "workload-2",
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
        ],
        "it should set kms config"
      );
    });
  });
  describe("backwards compatible json validation", () => {
    it("should match old json with new json", () => {
      let overrideJson = overrideVersion["2022-10-5"];
      let expectedData = goodOverride;
      validate(overrideJson);
      assert.deepEqual(overrideJson, expectedData, "they should match");
    });
  });
  describe("error", () => {
    it("should call sendError on parent function if provided", () => {
      let parent = {
        sendError: function (message) {
          throw new Error(message);
        },
      };
      let testData = minimumValidJson({
        vpcs: [
          {
            prefix: null,
          },
        ],
      });
      let task = () => {
        validate(testData, parent);
      };
      assert.throws(
        task,
        "Cannot read properties of undefined (reading 'forEach')"
      );
    });
  });
  describe("key_management", () => {
    it("should set use data to true if not found and using hs crypto", () => {
      let overrideJson = goodOverride;
      overrideJson.key_management.use_hs_crypto = true;
      validate(overrideJson);
      assert.isTrue(
        overrideJson.key_management.use_data,
        "use data should be true"
      );
    });
  });
  describe("resource_groups", () => {
    it("should set use prefix to false if null", () => {
      let overrideJson = goodOverride;
      overrideJson.resource_groups[0].use_prefix = null;
      validate(overrideJson);
      assert.isFalse(
        overrideJson.resource_groups[0].use_prefix,
        "use data should be false"
      );
    });
  });
  describe("set unfound fields", () => {
    it("should set appid if not found", () => {
      delete goodOverride.appid;
      let actualData = validate(goodOverride);
      let expectedAppId = {
        use_appid: false,
        name: null,
        resource_group: null,
        use_data: false,
        keys: [],
      };
      assert.deepEqual(actualData.appid, expectedAppId, "it should set appid");
    });
    it("should set secrets_manager if not found", () => {
      delete goodOverride.secrets_manager;
      let actualData = validate(goodOverride);
      let expectedData = {
        kms_key_name: null,
        name: null,
        resource_group: null,
        use_secrets_manager: false,
      };
      assert.deepEqual(
        actualData.secrets_manager,
        expectedData,
        "it should set appid"
      );
    });
    it("should set iam_account_settings if not found", () => {
      delete goodOverride.iam_account_settings;
      let actualData = validate(goodOverride);
      let expectedData = {
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
      };
      assert.deepEqual(
        actualData.iam_account_settings,
        expectedData,
        "it should set appid"
      );
    });
    it("should set f5 template data if not found", () => {
      delete goodOverride.f5_template_data;
      let actualData = validate(goodOverride);
      let expectedData = {
        app_id: "null",
        as3_declaration_url: "null",
        byol_license_basekey: "null",
        do_declaration_url: "null",
        license_host: "null",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        license_type: "none",
        license_unit_of_measure: "hourly",
        license_username: "null",
        phone_home_url: "null",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
        template_version: "20210201",
        tgactive_url: "null",
        tgrefresh_url: "null",
        tgstandby_url: "null",
        tmos_admin_password: null,
        ts_declaration_url: "null",
      };
      assert.deepEqual(
        actualData.f5_template_data,
        expectedData,
        "it should set appid"
      );
    });
  });
  describe("isDownload", () => {
    describe("atracker", () => {
      it("should throw an error if atracker collector bucket name is null", () => {
        let testData = minimumValidJson({
          atracker: {
            add_route: false,
            receive_global_events: false,
            resource_group: "slz-service-rg",
            collector_bucket_name: null,
          },
        });
        let task = () => {
          validate(testData, true);
        };
        assert.throws(
          task,
          "Activity Tracker must have a valid bucket name. Got `null`"
        );
      });
      it("should not throw when cos has valid key", () => {
        let testData = minimumValidJson({
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
          resource_group: "slz-service-rg",
          use_data: false,
        });
        let task = () => validate(testData, true);
        assert.doesNotThrow(task, Error, null, "it should not throw");
      });
    });
    describe("cos", () => {
      it("should throw an error if no object storage instances are provisioned", () => {
        let testData = minimumValidJson({ cos: [] });
        let task = () => {
          validate(testData, true);
        };
        assert.throws(
          task,
          "At least one Object Storage Instance is required. Got 0"
        );
      });
      it("should throw an error if no encryption key is provided for an object storage bucket", () => {
        let invalidCos = minimumValidJson({}).cos;
        invalidCos[0].buckets[0].kms_key = null;
        let testData = minimumValidJson({ cos: invalidCos });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Object Storage Buckets require a encryption key, `atracker-cos` bucket `atracker-bucket` kms_key is null."
        );
      });
    });
    describe("clusters", () => {
      it("should throw an error if an openshift cluster has a null cos name", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.cos_name = null;
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "OpenShift clusters require a cos instance. Cluster `workload-cluster` cos_name is null."
        );
      });
      it("should throw an error if a cluster has a null vpc name", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.vpc_name = null;
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Clusters require a VPC Name, `workload-cluster` vpc_name is null."
        );
      });
      it("should throw an error if a cluster has null resource group", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.resource_group = null;
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Clusters require a resource group, `workload-cluster` resource_group is null."
        );
      });
      it("should throw an error if a cluster has no subnet names", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.subnet_names = [];
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Clusters require at least one subnet to provision, `workload-cluster` subnet_names is []."
        );
      });
      it("should throw an error if a cluster has no kms key", () => {
        let invalidCluster = defaultCluster();
        invalidCluster.kms_config.crk_name = null;
        let testData = minimumValidJson({ clusters: [invalidCluster] });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Clusters require a encryption key, `workload-cluster` kms_key is null."
        );
      });
      describe("worker_pools", () => {
        it("should throw an error if a cluster worker pool has no subnet names", () => {
          let invalidCluster = defaultCluster();
          invalidCluster.worker_pools[0].subnet_names = [];
          let testData = minimumValidJson({ clusters: [invalidCluster] });
          let task = () => validate(testData, true);
          assert.throws(
            task,
            "Worker Pools require at least one subnet to provision, `workload-cluster` worker_pool `logging-worker-pool` subnet_names is []."
          );
        });
        it("should not throw an error when no worker pools", () => {
          let validCluster = defaultCluster();
          validCluster.worker_pools = [];
          let testData = minimumValidJson({ clusters: [validCluster] });
          let task = () => validate(testData, true);
          assert.doesNotThrow(task, Error, null, "it should not throw");
        });
      });
    });
    describe("transit_gateway", () => {
      it("should throw an error if transit_gateway_resource_group is null", () => {
        let testData = minimumValidJson();
        testData.transit_gateway_resource_group = null;
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Transit Gateway requires a resource group, transit_gateway_resource_group is null."
        );
      });
    });
    describe("virtual_private_endpoints", () => {
      it("should throw an error if a vpe has no vpcs", () => {
        let testData = minimumValidJson();
        testData.virtual_private_endpoints[0].vpcs = [];
        let task = () => validate(testData);
        assert.throws(
          task,
          "Virtual Private Endpoints must have at least one VPC. Service name `cos` got 0."
        );
      });
      it("should throw an error if a vpe vpc has no subnets", () => {
        let testData = minimumValidJson();
        testData.virtual_private_endpoints[0].vpcs[0].subnets = [];
        let task = () => validate(testData);
        assert.throws(
          task,
          "Virtual Private Endpoints must have at least one VPC subnet. Service name `cos` VPC Name `management` has 0."
        );
      });
    });
    describe("vpcs", () => {
      it("should throw an error if vpc has no resource group", () => {
        let testData = minimumValidJson();
        testData.vpcs[0].resource_group = null;
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "VPCs require a resource group, `management` resource_group is null."
        );
      });
    });
    describe("vpn_gateways", () => {
      it("should throw an error if vpn gateway subnet is null", () => {
        let testData = minimumValidJson();
        testData.vpn_gateways[0].subnet_name = null;
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "VPN Gateways require a subnet name, `management-gateway` subnet_name is null."
        );
      });
    });
    describe("appid", () => {
      it("should throw an error if resource group for appid is null and appid is enabled", () => {
        let testData = minimumValidJson({
          appid: {
            use_appid: true,
            resource_group: null,
          },
        });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "App ID requires a resource group, App ID resource_group is null."
        );
      });
    });
    describe("secrets_manager", () => {
      it("should throw an error if resource group for secrets_manager is null and secrets_manager is enabled", () => {
        let testData = minimumValidJson({
          secrets_manager: {
            use_secrets_manager: true,
            resource_group: null,
          },
        });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Secrets Manager requires a resource group, Secrets Manager Resource Group is null."
        );
      });
      it("should throw an error if secrets manager is enabled and encryption key is null", () => {
        let testData = minimumValidJson({
          secrets_manager: {
            use_secrets_manager: true,
            resource_group: "yes",
            kms_key_name: null,
          },
        });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          "Secrets Manager requires a encryption key, `undefined` kms_key_name is null."
        );
      });
    });
    describe("ssh keys", () => {
      it("should throw an error if ssh key does not have a valid public key", () => {
        let testData = minimumValidJson({
          ssh_keys: [
            {
              name: "bad key",
              public_key: "frog",
            },
          ],
        });
        let task = () => validate(testData, true);
        assert.throws(
          task,
          'SSH Keys require a valid public key. Invalid public key for SSH key "bad key"'
        );
      });
    });
  });
  describe("no old variables", () => {
    it("should throw an error when a deleted variable is provided", () => {
      let testData = minimumValidJson();
      testData.vpcs[0].clean_default_security_group = [3];
      let task = () => validate(testData);
      assert.throws(
        task,
        "clean_default_security_group has been removed. Use clean_default_sg_acl instead."
      );
    });
  });
});
