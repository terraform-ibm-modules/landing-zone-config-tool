import { assert } from "chai";
import { stateInit } from "../client/src/lib/component-state-init.js";

describe("state initializtion functions", () => {
  describe("TransitGateway", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              transit_gateway_resource_group: "frog",
              transit_gateway_connections: ["ok"],
              enable_transit_gateway: false,
            },
          },
        },
      };
      let expectedData = {
        transit_gateway_resource_group: "frog",
        transit_gateway_connections: ["ok"],
        enable_transit_gateway: false,
      };
      let actualData = stateInit("transit_gateway", componentProps);
      assert.deepEqual(actualData, expectedData, "it should initialize");
      componentProps.slz.store.configDotJson.enable_transit_gateway = "NO!";
      assert.isFalse(
        actualData.enable_transit_gateway,
        "it should not reference"
      );
    });
  });
  describe("TeleportConfig", () => {
    it("should return the correct state based on props with data", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              teleport_config: {
                teleport_license: null,
                https_cert: null,
                https_key: null,
                domain: null,
                cos_bucket_name: "frank",
                cos_key_name: "todd",
                teleport_version: null,
                message_of_the_day: null,
                hostname: null,
                app_id_key_name: "moose",
                claims_to_roles: [],
              },
            },
          },
        },
      };
      let expectedData = {
        teleport_license: null,
        https_cert: null,
        https_key: null,
        domain: null,
        teleport_version: null,
        message_of_the_day: "",
        hostname: null,
        cos_bucket_name: "frank",
        cos_key_name: "todd",
        app_id_key_name: "moose",
        claims_to_roles: [],
      };
      assert.deepEqual(
        stateInit("teleport_config", componentProps),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return the correct state based on props with data", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              teleport_config: {
                teleport_license: null,
                https_cert: null,
                https_key: null,
                domain: null,
                cos_bucket_name: "frank",
                cos_key_name: "todd",
                teleport_version: null,
                message_of_the_day: "Frog",
                hostname: null,
                app_id_key_name: "moose",
                claims_to_roles: [],
              },
            },
          },
        },
      };
      let expectedData = {
        teleport_license: null,
        https_cert: null,
        https_key: null,
        domain: null,
        teleport_version: null,
        message_of_the_day: "Frog",
        hostname: null,
        cos_bucket_name: "frank",
        cos_key_name: "todd",
        app_id_key_name: "moose",
        claims_to_roles: [],
      };
      assert.deepEqual(
        stateInit("teleport_config", componentProps),
        expectedData,
        "it should return expected data"
      );
    });
  });
  describe("secrets_manager", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              secrets_manager: {
                kms_key_name: null,
                resource_group: null,
                use_secrets_manager: false,
                name: null,
              },
            },
          },
        },
      };
      let expectedData = {
        kms_key_name: "",
        name: "",
        resource_group: "",
        use_secrets_manager: false,
      };
      assert.deepEqual(
        stateInit("secrets_manager", componentProps),
        expectedData,
        "it should return expected data"
      );
    });
  });
  describe("f5_image_name", () => {
    it("should return the correct state based on props with no f5 vsi", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              f5_vsi: [],
            },
          },
        },
      };
      let expectedData = {
        f5_image_name: "",
        resource_group: "",
        ssh_keys: [],
        machine_type: "",
        zones: "",
      };
      assert.deepEqual(stateInit("f5_vsi", componentProps), expectedData);
    });
    it("should return the correct state based on props with f5 vsi", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              f5_vsi: [
                {
                  f5_image_name: "one",
                  resource_group: "two",
                  ssh_keys: "three",
                  machine_type: "four",
                  zones: "five",
                },
              ],
            },
          },
        },
      };
      let expectedData = {
        f5_image_name: "one",
        resource_group: "two",
        ssh_keys: "three",
        machine_type: "four",
        zones: 1,
      };
      assert.deepEqual(stateInit("f5_vsi", componentProps), expectedData);
    });
  });
  describe("atracker", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              atracker: {
                resource_group: "hi",
                collector_bucket_name: "hello",
                add_route: true,
              },
            },
            atrackerKey: "frog",
          },
        },
      };
      let expectedData = {
        add_route: true,
        resource_group: "hi",
        collector_bucket_name: "hello",
        atracker_key: "frog",
      };
      assert.deepEqual(
        stateInit("atracker", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("appid", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              appid: {
                resource_group: null,
                name: null,
                use_appid: false,
                use_data: false,
                keys: [],
              },
            },
          },
        },
      };
      let expectedData = {
        resource_group: "",
        name: "",
        use_appid: false,
        use_data: false,
        keys: [],
      };
      assert.deepEqual(
        stateInit("appid", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props with use true", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {
              appid: {
                resource_group: null,
                name: null,
                use_appid: true,
                use_data: false,
                keys: [],
              },
            },
          },
        },
      };
      let expectedData = {
        resource_group: "",
        name: "",
        use_appid: true,
        use_data: false,
        keys: [],
      };
      assert.deepEqual(
        stateInit("appid", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vsi", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          name: null,
          image_name: null,
          machine_type: null,
          resource_group: null,
          vpc_name: null,
          subnet_names: [],
          subnet_name: "",
          boot_volume_encryption_key_name: null,
          ssh_keys: [],
          security_group: {
            name: "frog",
            rules: [],
          },
          vsi_per_subnet: null,
          user_data: null,
          enable_floating_ip: false,
          security_groups: [],
        },
      };
      let expectedData = {
        name: "",
        image_name: "",
        machine_type: "",
        resource_group: "",
        vpc_name: "",
        subnet_names: [],
        subnet_name: "",
        boot_volume_encryption_key_name: "",
        ssh_keys: [],
        security_group: {
          name: "frog",
          rules: [],
        },
        vsi_per_subnet: 1,
        user_data: "",
        enable_floating_ip: false,
        security_groups: [],
      };
      assert.deepEqual(
        stateInit("vsi", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props with vsi per subnet", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          name: null,
          image_name: null,
          machine_type: null,
          resource_group: null,
          vpc_name: null,
          subnet_names: [],
          subnet_name: "",
          boot_volume_encryption_key_name: null,
          ssh_keys: [],
          security_group: {
            name: "frog",
            rules: [],
          },
          vsi_per_subnet: 2,
          user_data: null,
          enable_floating_ip: false,
          security_groups: [],
        },
      };
      let expectedData = {
        name: "",
        image_name: "",
        machine_type: "",
        resource_group: "",
        vpc_name: "",
        subnet_names: [],
        subnet_name: "",
        boot_volume_encryption_key_name: "",
        ssh_keys: [],
        security_group: {
          name: "frog",
          rules: [],
        },
        vsi_per_subnet: 2,
        user_data: "",
        enable_floating_ip: false,
        security_groups: [],
      };
      assert.deepEqual(
        stateInit("vsi", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props if teleport and no security group", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          name: null,
          image_name: null,
          machine_type: null,
          resource_group: null,
          vpc_name: null,
          subnet_names: [],
          subnet_name: "",
          boot_volume_encryption_key_name: null,
          ssh_keys: [],
          vsi_per_subnet: null,
          user_data: null,
          enable_floating_ip: false,
          security_groups: null,
        },
        isTeleport: true,
        isModal: true,
      };
      let expectedData = {
        name: "",
        image_name: "",
        machine_type: "",
        resource_group: "",
        vpc_name: "",
        subnet_names: [],
        subnet_name: "",
        boot_volume_encryption_key_name: "",
        ssh_keys: [],
        security_group: {
          name: "bastion-vsi-sg",
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
            {
              direction: "inbound",
              name: "allow-inbound-443",
              source: "0.0.0.0/0",
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
            {
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
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
          ],
        },
        vsi_per_subnet: 1,
        user_data: "",
        enable_floating_ip: false,
        security_groups: [],
      };
      assert.deepEqual(
        stateInit("vsi", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vpn_gateway", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          vpc_name: null,
          subnet_name: null,
          resource_group: null,
          name: null,
        },
      };
      let expectedData = {
        connections: [],
        vpc_name: "",
        subnet_name: "",
        resource_group: "",
        name: "",
      };
      assert.deepEqual(
        stateInit("vpn_gateway", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props when subnet name but not vpc name", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          vpc_name: null,
          subnet_name: "frog",
          resource_group: null,
          name: null,
        },
      };
      let expectedData = {
        vpc_name: "",
        subnet_name: "",
        resource_group: "",
        name: "",
        connections: [],
      };
      assert.deepEqual(
        stateInit("vpn_gateway", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("encryption_key", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          name: "todd",
          root_key: true,
          force_delete: true,
          policies: {
            rotation: {
              interval_month: 12,
            },
          },
        },
      };
      let expectedData = {
        name: "todd",
        root_key: true,
        force_delete: true,
        interval_month: 12,
      };
      assert.deepEqual(
        stateInit("encryption_key", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props with null force delete", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          name: "todd",
          root_key: true,
          force_delete: null,
          policies: {
            rotation: {
              interval_month: 12,
            },
          },
        },
      };
      let expectedData = {
        name: "todd",
        root_key: true,
        force_delete: false,
        interval_month: 12,
      };
      assert.deepEqual(
        stateInit("encryption_key", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("cluster", () => {
    it("should return the correct state based on props", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          cos_name: null,
          entitlement: "cloud_pak",
          kube_type: "openshift",
          kube_version: "default",
          machine_type: "bx2.16x64",
          name: "workload-cluster",
          resource_group: null,
          kms_config: {
            crk_name: null,
            private_endpoint: true,
          },
          subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vpc_name: null,
          worker_pools: [],
          workers_per_subnet: 2,
        },
      };
      let expectedData = {
        cos_name: "",
        entitlement: "cloud_pak",
        kube_type: "openshift",
        kube_version: "default",
        machine_type: "bx2.16x64",
        name: "workload-cluster",
        resource_group: "",
        kms_config: {
          crk_name: "",
          private_endpoint: true,
        },
        subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc_name: "",
        worker_pools: [],
        workers_per_subnet: 2,
      };
      assert.deepEqual(
        stateInit("clusters", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on props with kms key", () => {
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        data: {
          cos_name: null,
          entitlement: "cloud_pak",
          kube_type: "openshift",
          kube_version: "default",
          machine_type: "bx2.16x64",
          name: "workload-cluster",
          resource_group: null,
          kms_config: {
            crk_name: "todd",
            private_endpoint: true,
          },
          subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vpc_name: null,
          worker_pools: [],
          workers_per_subnet: 2,
        },
      };
      let expectedData = {
        cos_name: "",
        entitlement: "cloud_pak",
        kube_type: "openshift",
        kube_version: "default",
        machine_type: "bx2.16x64",
        name: "workload-cluster",
        resource_group: "",
        kms_config: {
          crk_name: "todd",
          private_endpoint: true,
        },
        subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc_name: "",
        worker_pools: [],
        workers_per_subnet: 2,
      };
      assert.deepEqual(
        stateInit("clusters", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("networking_rule", () => {
    it("should return the correct state based on rule type", () => {
      // acl rule
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        isSecurityGroup: false,
        data: {
          name: "",
          action: "allow",
          direction: "inbound",
          destination: "",
          source: "",
          ruleProtocol: "all",
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
        },
      };
      let expectedData = {
        name: "",
        action: "allow",
        direction: "inbound",
        destination: "",
        source: "",
        ruleProtocol: "all",
        rule: {
          port_max: null,
          port_min: null,
          source_port_max: null,
          source_port_min: null,
          type: null,
          code: null,
        },
        showDeleteModal: false,
      };
      assert.deepEqual(
        stateInit("networking_rule", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state based on rule type", () => {
      // sg rule
      let componentProps = {
        slz: {
          store: {
            configDotJson: {},
          },
        },
        isSecurityGroup: true,
        data: {
          name: "",
          direction: "inbound",
          source: "",
          ruleProtocol: "all",
          rule: {
            port_max: null,
            port_min: null,
            source_port_max: null,
            source_port_min: null,
            type: null,
            code: null,
          },
        },
      };
      let expectedData = {
        name: "",
        direction: "inbound",
        source: "",
        ruleProtocol: "all",
        rule: {
          port_max: null,
          port_min: null,
          source_port_max: null,
          source_port_min: null,
          type: null,
          code: null,
        },
        showDeleteModal: false,
      };
      assert.deepEqual(
        stateInit("networking_rule", componentProps),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("all other functions", () => {
    it("should return component props data", () => {
      let componentProps = {
        data: {
          name: "frog",
        },
      };
      assert.deepEqual(
        stateInit("pretend_component", componentProps),
        { name: "frog" },
        "it should return data from props"
      );
    });
  });
  /*
  it("should return the correct state based on props", () => {
    let componentProps = {
      slz: {
        store: {
          configDotJson: {

          }
        }
      }
    };
    let expectedData = {};
    assert.deepEqual(
      stateInit("transit_gateway", componentProps),
      expectedData,
      "it should return correct data"
    );
  });
  */
});
