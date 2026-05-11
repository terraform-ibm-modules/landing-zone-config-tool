import { assert } from "chai";
import { propsMatchState } from "../client/src/lib/props-match-state.js";

describe("propsMatchState", () => {
  describe("isModal", () => {
    it("should return true if is modal", () => {
      assert.isTrue(
        propsMatchState("", {}, { isModal: true }),
        "it should be true"
      );
    });
  });
  describe("clusters", () => {
    it("should check if clusters match statedata.cluster", () => {
      assert.isTrue(
        propsMatchState(
          "clusters",
          {
            cluster: {
              name: "hi",
              cos_name: "",
              vpc_name: "",
              resource_group: "",
              kms_config: { private_endpoint: true, crk_name: "undefined" },
            },
          },
          {
            data: {
              name: "hi",
              cos_name: "",
              vpc_name: "",
              resource_group: "",
              kms_config: { private_endpoint: true, crk_name: "undefined" },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("worker_pools", () => {
    it("should check stateData.pool for worker_pools", () => {
      assert.isTrue(
        propsMatchState(
          "worker_pools",
          { pool: { name: "frog" } },
          { data: { name: "frog" } }
        ),
        "it should match"
      );
    });
  });
  describe("cos_keys", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "cos_keys",
          { name: "frog" },
          { data: { name: "frog" } }
        ),
        "it should match"
      );
    });
  });
  describe("subnet", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "subnet",
          { name: "frog" },
          { subnet: { name: "frog" } }
        ),
        "it should match"
      );
    });
  });
  describe("key_management", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "key_management",
          { name: "frog" },
          {
            data: { name: "frog" },
            slz: {
              store: {
                configDotJson: { key_management: { name: "frog", keys: [] } },
              },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("iam_account_settings", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "iam_account_settings",
          { name: "frog" },
          {
            data: { name: "frog" },
            slz: {
              store: {
                configDotJson: { iam_account_settings: { name: "frog" } },
              },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("f5_template_data", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "f5_template_data",
          { name: "frog" },
          {
            data: { name: "frog" },
            slz: {
              store: {
                configDotJson: { f5_template_data: { name: "frog" } },
              },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("f5_vsi_config", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "f5_vsi_config",
          {
            resource_group: "hi",
            boot_volume_encryption_key_name: "hello",
            zones: 1,
            ssh_keys: ["todd"],
            f5_image_mage: "frog",
            machine_type: "egg",
          },
          {
            data: {
              resource_group: "hi",
              boot_volume_encryption_key_name: "hello",
              zones: 1,
              ssh_keys: ["todd"],
              f5_image_mage: "frog",
              machine_type: "egg",
            },
            slz: { store: { configDotJson: { f5_vsi: [1] } } },
          }
        ),
        "it should match"
      );
    });
  });
  describe("f5_vsi", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "f5_vsi",
          { resource_group: "hi", boot_volume_encryption_key_name: "hello" },
          {
            data: {
              resource_group: "hi",
              boot_volume_encryption_key_name: "hello",
            },
            slz: { store: { configDotJson: { f5_vsi: [1] } } },
          }
        ),
        "it should match"
      );
    });
  });
  describe("virtual_private_endpoints", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "virtual_private_endpoints",
          {
            name: "frog",
            vpe: {
              service_name: "frog",
              vpcs: [
                {
                  name: "frog",
                  security_group_name: "frog",
                  subnets: ["frog-zone-1"],
                },
              ],
            },
            vpcData: {
              frog: { security_group_name: "frog", subnets: ["frog-zone-1"] },
            },
          },
          {
            data: {
              service_name: "frog",
              vpcs: [
                {
                  name: "frog",
                  security_group_name: "frog",
                  subnets: ["frog-zone-1"],
                },
              ],
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("teleport_config", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "teleport_config",
          {
            teleport_config: {
              teleport_license: undefined,
              https_cert: undefined,
              https_key: undefined,
              domain: undefined,
              teleport_version: undefined,
              hostname: undefined,
              claims_to_roles: undefined,
              cos_bucket_name: undefined,
              cos_key_name: undefined,
              app_id_key_name: undefined,
              message_of_the_day: "",
            },
          },
          {
            data: { name: "frog" },
            slz: {
              store: {
                configDotJson: {
                  teleport_config: {
                    teleport_license: undefined,
                    https_cert: undefined,
                    https_key: undefined,
                    domain: undefined,
                    teleport_version: undefined,
                    hostname: undefined,
                    claims_to_roles: undefined,
                    cos_bucket_name: undefined,
                    cos_key_name: undefined,
                    app_id_key_name: undefined,
                    message_of_the_day: "",
                  },
                },
              },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("subnetTiers", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "subnetTiers",
          { name: "frog", addPublicGateway: false, networkAcl: "" },
          {
            tier: { name: "frog" },
            vpc_name: "ut",
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "ut",
                      subnets: {
                        "zone-1": [
                          {
                            name: "frog-zone-1",
                            acl_name: "true",
                          },
                        ],
                        "zone-2": [
                          {
                            name: "frog-zone-1",
                            acl_name: "false",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should match"
      );
    });
  });
  describe("networking_rule", () => {
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "networking_rule",
          {
            name: "allow-ibm-inbound",
            direction: "inbound",
            action: "allow",
            destination: "10.0.0.0/8",
            source: "161.26.0.0/16",
          },
          {
            data: {
              name: "allow-ibm-inbound",
              direction: "inbound",
              action: "allow",
              destination: "10.0.0.0/8",
              source: "161.26.0.0/16",
            },
            isSecurityGroup: false,
            slz: {
              store: {
                configDotJson: {},
              },
            },
          }
        )
      );
    });
    it("should return true if props match", () => {
      assert.isTrue(
        propsMatchState(
          "networking_rule",
          {
            name: "allow-ibm-inbound",
            direction: "inbound",
            source: "161.26.0.0/16",
          },
          {
            data: {
              name: "allow-ibm-inbound",
              direction: "inbound",
              source: "161.26.0.0/16",
            },
            isSecurityGroup: true,
            slz: {
              store: {
                configDotJson: {},
              },
            },
          }
        )
      );
    });
  });
  it("should test otherwise if match", () => {
    assert.isTrue(
      propsMatchState("frog", { name: "frog" }, { data: { name: "frog" } }),
      "it should match"
    );
  });
});
