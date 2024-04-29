import { assert } from "chai";
import {
  buildNewEncryptionKey,
  newF5Vsi,
  newFormClusterInstance,
  newTeleportConfig,
} from "../client/src/lib/builders.js"
import {
  newDefaultManagementCluster,
  newDefaultWorkloadServer,
} from "../client/src/lib/store/defaults.js";

describe("builders", () => {
  describe("newDefaultManagementCluster", () => {
    it("should return correct cluster", () => {
      assert.deepEqual(
        newDefaultManagementCluster(),
        {
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
        },
        "it should return cluster"
      );
    });
  });
  describe("newDefaultWorkloadServer", () => {
    it("should return correct data", () => {
      assert.deepEqual(
        newDefaultWorkloadServer(),
        {
          boot_volume_encryption_key_name: "slz-vsi-volume-key",
          image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          machine_type: "cx2-4x8",
          name: "workload-server",
          resource_group: "workload-rg",
          security_group: {
            name: "workload",
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
                  port_max: 443,
                  port_min: 443,
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
          vpc_name: "workload",
          vsi_per_subnet: 1,
          security_groups: [],
        },
        "it should return data"
      );
    });
  });
  describe("buildNewEncryptionKey", () => {
    it("should build an encryption key with interval month", () => {
      let actualData = buildNewEncryptionKey({ interval_month: 3 });
      let expectedData = {
        name: `new-key`,
        root_key: true,
        payload: null,
        key_ring: null,
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
        actualData,
        expectedData,
        "it should change interval month"
      );
    });
  });
  describe("newF5Vsi", () => {
    it("should create a vsi on management", () => {
      let vsi = newF5Vsi("vpn-and-waf", "zone-1", true);
      let expectedData = {
        boot_volume_encryption_key_name: "slz-vsi-volume-key",
        domain: "local",
        enable_external_floating_ip: true,
        enable_management_floating_ip: false,
        f5_image_name: "f5-bigip-16-1-2-2-0-0-28-all-1slot",
        hostname: "f5-ve-01",
        machine_type: "cx2-4x8",
        name: "f5-zone-1",
        primary_subnet_name: "f5-management-zone-1",
        resource_group: "management-rg",
        secondary_subnet_names: [
          "f5-bastion-zone-1",
          "f5-external-zone-1",
          "f5-workload-zone-1",
        ],
        secondary_subnet_security_group_names: [
          {
            group_name: "f5-bastion-sg",
            interface_name: "slz-management-f5-bastion-zone-1",
          },
          {
            group_name: "f5-external-sg",
            interface_name: "slz-management-f5-external-zone-1",
          },
          {
            group_name: "f5-workload-sg",
            interface_name: "slz-management-f5-workload-zone-1",
          },
        ],
        security_groups: ["f5-management-sg"],
        ssh_keys: ["slz-ssh-key"],
        vpc_name: "management",
      };
      assert.deepEqual(vsi, expectedData, "it should create vsi");
    });
  });
  describe("newFormClusterInstance", () => {
    it("should return correct data with none slz", () => {
      let actualData = newFormClusterInstance({
        store: {
          encryptionKeys: [],
          resourceGroups: [],
        },
      });
      let expectedData = {
        cos_name: null,
        entitlement: null,
        kube_type: "",
        kube_version: "",
        machine_type: "",
        kms_config: {
          crk_name: "",
          private_endpoint: true,
        },
        name: "",
        resource_group: "",
        subnet_names: [],
        vpc_name: "",
        worker_pools: [],
        workers_per_subnet: 2,
      };
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return correct data with slz", () => {
      let actualData = newFormClusterInstance({
        store: {
          encryptionKeys: ["hi"],
          resourceGroups: ["mom"],
        },
      });
      let expectedData = {
        cos_name: null,
        entitlement: null,
        kube_type: "",
        kube_version: "",
        machine_type: "",
        kms_config: {
          crk_name: "",
          private_endpoint: true,
        },
        name: "",
        resource_group: "",
        subnet_names: [],
        vpc_name: "",
        worker_pools: [],
        workers_per_subnet: 2,
      };
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
  });

  describe("validNewTeleportConfig", () => {
    it("should return the default teleport configuration", () => {
      let testTeleportConfig = newTeleportConfig();
      assert.deepEqual(
        testTeleportConfig,
        {
          teleport_license: null,
          https_cert: null,
          https_key: null,
          domain: null,
          cos_bucket_name: null,
          cos_key_name: null,
          teleport_version: null,
          message_of_the_day: null,
          hostname: null,
          app_id_key_name: null,
          claims_to_roles: [],
        },
        "it should return correct teleport_config"
      );
    });
  });
});
