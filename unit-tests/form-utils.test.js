import { assert } from "chai";
import {
  toggleMarginBottom,
  saveChangeButtonClass,
  forceShowForm,
  toggleFormComponentName,
  toggleFormDeleteDisabled,
  disableDeleteMessage,
  addClassName,
  getRuleProtocol,
  getSubRule,
  getCodeMirrorDisplay,
  buildComposedComponentNameHelperText,
  getFormCrudOperations,
  getSlzArrayFormArrayData,
  formatFieldName,
  subnetGatewayToggleShouldBeDisabled,
  subnetTierVpcHasNoEnabledGateways,
  parentHasRandomSuffix,
  subnetTierInitState,
  nonReservedSubnetTierList,
  nextSubnetTierIndex,
  subnetTierModalList,
  subnetTierFormList,
  subnetTierName,
  getCosKeysFromBucket,
  getBucketInstance,
  codeMirrorJson,
} from "../client/src/lib/form-utils.js";
import { slzState } from "../client/src/lib/state.js";
import { prettyJSON } from "lazy-z";

describe("form-utils", () => {
  describe("toggleMarginBottom", () => {
    it("should return margin bottom small when adding margin bottom", () => {
      assert.deepEqual(
        toggleMarginBottom(true),
        "",
        "it should return className"
      );
    });
    it("should return empty string when not shown or toggle form", () => {
      assert.deepEqual(
        toggleMarginBottom(false),
        " marginBottomSmall",
        "it should return className"
      );
    });
  });
  describe("saveChangeButtonClass", () => {
    it("should return default styles with no params", () => {
      assert.deepEqual(
        saveChangeButtonClass({}),
        "forceTertiaryButtonStyles marginRightSmall tertiaryButtonColors",
        "it should return button styles"
      );
    });
    it("should return default styles with topLevelToggleForm params", () => {
      assert.deepEqual(
        saveChangeButtonClass({ topLevelToggleForm: true }),
        "forceTertiaryButtonStyles marginRightSmall tertiaryButtonColors",
        "it should return button styles"
      );
    });
    it("should return default styles when not hiding delete", () => {
      assert.deepEqual(
        saveChangeButtonClass({ noDeleteButton: true }),
        "forceTertiaryButtonStyles tertiaryButtonColors",
        "it should return button styles"
      );
    });
    it("should return default styles when save is disabled", () => {
      assert.deepEqual(
        saveChangeButtonClass({ disabled: true }),
        "forceTertiaryButtonStyles marginRightSmall",
        "it should return button styles"
      );
    });
  });
  describe("forceShowForm", () => {
    let fakeStore = {
      store: {
        resourceGroups: ["service-rg", "management-rg", "workload-rg"],
        vpcList: ["management", "workload"],
        encryptionKeys: [
          "slz-atracker-key",
          "slz-slz-key",
          "slz-roks-key",
          "slz-vsi-volume-key",
        ],
      },
    };
    it("should return true if kms and no rg", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "key_management",
            slz: {
              store: {
                configDotJson: {
                  key_management: {
                    resource_group: null,
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if tgw and no rg", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "transit_gateway",
            slz: {
              store: {
                configDotJson: {
                  transit_gateway_resource_group: null,
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if atracker and no rg", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "atracker",
            slz: {
              store: {
                configDotJson: {
                  atracker: {
                    resource_group: null,
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if atracker and no bucket", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "atracker",
            slz: {
              store: {
                configDotJson: {
                  atracker: {
                    resource_group: "hi",
                    collector_bucket_name: null,
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if atracker and no key", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "atracker",
            slz: {
              store: {
                atrackerKey: null,
                configDotJson: {
                  atracker: {
                    resource_group: "hi",
                    collector_bucket_name: "hello",
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if appid and no rg", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "appid",
            slz: {
              store: {
                configDotJson: {
                  appid: {
                    resource_group: null,
                    use_appid: true,
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if teleport_config and appid disabled", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "teleport_config",
            slz: {
              store: {
                configDotJson: {
                  appid: {
                    use_appid: false,
                  },
                },
              },
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if cos and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "cos",
            data: {
              resource_group: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if buckets and no key", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "buckets",
            data: {
              kms_key: null,
            },
          }
        )
      );
    });
    it("should return true if vpc and no resource group or flow log bucket", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpcs",
            data: {
              resource_group: null,
              flow_logs_bucket_name: null,
            },
            innerForm: {
              name: "VpcNetworkForm",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpc and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpcs",
            data: {
              resource_group: null,
              flow_logs_bucket_name: "test",
            },
            innerForm: {
              name: "VpcNetworkForm",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpc and no flow log bucket", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpcs",
            data: {
              resource_group: "service-rg",
              flow_logs_bucket_name: null,
            },
            innerForm: {
              name: "VpcNetworkForm",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return false if vpc and innerFrom.name is VpcNaclForm", () => {
      assert.isFalse(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpcs",
            data: {
              resource_group: "service-rg",
              flow_logs_bucket_name: null,
            },
            innerForm: {
              name: "VpcNaclForm",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if security group and no resource group or vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "security_groups",
            data: {
              resource_group: null,
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if security group and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "security_groups",
            data: {
              resource_group: null,
              vpc_name: "workload",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if security group and no vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "security_groups",
            data: {
              resource_group: "service-rg",
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpe and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "virtual_private_endpoints",
            data: {
              resource_group: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if ssh keys and no resource group or public key", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "ssh_keys",
            data: {
              resource_group: null,
              public_key: "<user-determined-value>",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if ssh keys and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "ssh_keys",
            data: {
              resource_group: null,
              public_key: "test",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if ssh keys and no public key", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "ssh_keys",
            data: {
              resource_group: "service-rg",
              public_key: "<user-determined-value>",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vsi and no resource group, vpc name, or ssh keys", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vsi",
            data: {
              resource_group: null,
              vpc_name: null,
              ssh_keys: [],
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vsi and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vsi",
            data: {
              resource_group: null,
              vpc_name: "workload",
              ssh_keys: ["test"],
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vsi and no vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vsi",
            data: {
              resource_group: "service-rg",
              vpc_name: null,
              ssh_keys: ["test"],
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vsi and no ssh keys", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vsi",
            data: {
              resource_group: "service-rg",
              vpc_name: "workload",
              ssh_keys: [],
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if clusters and no resource group, crk name, cos name, or vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "clusters",
            data: {
              resource_group: null,
              kms_config: {
                crk_name: null,
              },
              cos_name: null,
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if clusters and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "clusters",
            data: {
              resource_group: null,
              kms_config: {
                crk_name: "slz-slz-key",
              },
              cos_name: "test",
              vpc_name: "workload",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if clusters and no crk name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "clusters",
            data: {
              resource_group: "service-rg",
              kms_config: {
                crk_name: null,
              },
              cos_name: "test",
              vpc_name: "workload",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if clusters and no cos name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "clusters",
            data: {
              resource_group: "service-rg",
              kms_config: {
                crk_name: "slz-slz-key",
              },
              cos_name: null,
              vpc_name: "workload",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if clusters and no vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "clusters",
            data: {
              resource_group: "service-rg",
              kms_config: {
                crk_name: "slz-slz-key",
              },
              cos_name: "test",
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpn gateways and no resource group or vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpn_gateways",
            data: {
              resource_group: null,
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpn gateways and no resource group", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpn_gateways",
            data: {
              resource_group: null,
              vpc_name: "workload",
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return true if vpn gateways and no vpc name", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            slz: fakeStore,
            submissionFieldName: "vpn_gateways",
            data: {
              resource_group: "service-rg",
              vpc_name: null,
            },
          }
        ),
        "it should be shown"
      );
    });
    it("should return state otherwise", () => {
      assert.isTrue(
        forceShowForm(
          { show: true },
          {
            submissionFieldName: "other",
            slz: {
              store: {
                configDotJson: {
                  appid: {
                    resource_group: null,
                    use_appid: false,
                  },
                },
              },
            },
          }
        ),
        "it should return true"
      );
    });
  });
  describe("toggleFormComponentName", () => {
    it("should return prefix if inner form name VpcNetworkForm", () => {
      assert.deepEqual(
        toggleFormComponentName({
          addText: "Create a VPC",
          data: {
            prefix: "hi",
          },
        }),
        "hi",
        "it should return prefix"
      );
    });
    it("should return prefix if inner form name VpcNaclForm", () => {
      assert.deepEqual(
        toggleFormComponentName({
          addText: "Create a Network Access Control List",
          data: {
            prefix: "hi",
          },
        }),
        "hi VPC",
        "it should return prefix"
      );
    });
    it("should return service_name if inner form name VPEForm", () => {
      assert.deepEqual(
        toggleFormComponentName({
          addText: "Create a virtual private endpoint",
          data: {
            service_name: "hi",
          },
        }),
        "hi",
        "it should return prefix"
      );
    });
    it("should return email if inner form name TeleportClaimToRoleForm", () => {
      assert.deepEqual(
        toggleFormComponentName({
          addText: "Create a Claim to Roles",
          data: {
            email: "hi",
          },
        }),
        "hi",
        "it should return prefix"
      );
    });
    it("should return name if form not specified otherwise", () => {
      assert.deepEqual(
        toggleFormComponentName({
          innerForm: {
            name: "hi",
          },
          data: {
            name: "hi",
          },
        }),
        "hi",
        "it should return prefix"
      );
    });
  });
  describe("toggleFormDeleteDisabled", () => {
    it("should disable delete if ssh key is in use by vsi", () => {
      assert.isTrue(
        toggleFormDeleteDisabled({
          submissionFieldName: "ssh_keys",
          data: {
            name: "hi",
          },
          slz: {
            store: {
              configDotJson: {
                vsi: [
                  {
                    ssh_keys: ["hi"],
                  },
                ],
                teleport_vsi: [],
              },
            },
          },
        }),
        "it should be disabled"
      );
    });
    it("should disable delete if only one vpc", () => {
      assert.isTrue(
        toggleFormDeleteDisabled({
          addText: "Create a VPC",
          slz: {
            store: {
              configDotJson: {
                vpcs: ["1"],
              },
            },
          },
        }),
        "it should be disabled "
      );
    });
    it("should disable delete if only one resource group", () => {
      assert.isTrue(
        toggleFormDeleteDisabled({
          submissionFieldName: "resource_groups",
          slz: {
            store: {
              configDotJson: {
                resource_groups: ["1"],
              },
            },
          },
        }),
        "it should be disabled "
      );
    });
    it("should disable delete if vsi is read only", () => {
      assert.isTrue(
        toggleFormDeleteDisabled({
          submissionFieldName: "vsi",
          readOnly: true,
        }),
        "it should be disabled"
      );
    });
    it("should otherwise be fasle", () => {
      assert.isFalse(
        toggleFormDeleteDisabled({ innerForm: { name: "f" } }),
        "it should be enabled"
      );
    });
  });
  describe("disableDeleteMessage", () => {
    it("should provide correct message for ssh key form", () => {
      assert.deepEqual(
        disableDeleteMessage({ submissionFieldName: "ssh_keys" }),
        "Cannot delete SSH Key. This key is currently used by virtual servers.",
        "it should return the correct message"
      );
    });
    it("should provide correct message for VpcNetworkForm", () => {
      assert.deepEqual(
        disableDeleteMessage({
          addText: "Create a VPC",
        }),
        "Cannot delete VPC. At least one VPC is required",
        "it should return the correct message"
      );
    });
    it("should provide correct message for ResourceGroupForm", () => {
      assert.deepEqual(
        disableDeleteMessage({
          submissionFieldName: "resource_groups",
        }),
        "Cannot delete resource group. At least one resource group is required",
        "it should return the correct message"
      );
    });
    it("should otherwise return false", () => {
      assert.isUndefined(
        disableDeleteMessage({ innerForm: { name: "f" } }),
        "it should provide"
      );
    });
  });
  describe("addClassName", () => {
    it("should add classname if found", () => {
      assert.deepEqual(
        addClassName("hi", { className: "mom" }),
        "hi mom",
        "it should return class"
      );
    });
    it("should return classname if not found", () => {
      assert.deepEqual(addClassName("hi"), "hi", "it should return class");
    });
    it("should remove marginRight and not marginRightSmall if noMarginRight is passed as a param", () => {
      assert.deepEqual(
        addClassName("hi", {
          className: "mom marginRight marginRightSmall frog",
          noMarginRight: true,
        }),
        "hi mom marginRightSmall frog",
        "it should return class"
      );
    });
  });
  describe("getRuleProtocol", () => {
    it("should return all if all fields are null for icmp, tcp, and udp", () => {
      assert.deepEqual(
        getRuleProtocol({
          icmp: {
            test: null,
          },
          udp: {
            test: null,
          },
          tcp: {
            test: null,
          },
        }),
        "all",
        "it should return all"
      );
    });
    it("should return tcp if all fields are null for icmp, and udp", () => {
      assert.deepEqual(
        getRuleProtocol({
          icmp: {
            test: null,
          },
          udp: {
            test: null,
          },
          tcp: {
            test: 1,
          },
        }),
        "tcp",
        "it should return tcp"
      );
    });
    it("should return udp if all fields are null for icmp, and tcp", () => {
      assert.deepEqual(
        getRuleProtocol({
          icmp: {
            test: null,
          },
          tcp: {
            test: null,
          },
          udp: {
            test: 1,
          },
        }),
        "udp",
        "it should return udp"
      );
    });
    it("should return icmp if all fields are null for udp, and tcp", () => {
      assert.deepEqual(
        getRuleProtocol({
          udp: {
            test: null,
          },
          tcp: {
            test: null,
          },
          icmp: {
            test: 1,
          },
        }),
        "icmp",
        "it should return icmp"
      );
    });
  });
  describe("getSubRule", () => {
    it("should return default rule with all protocol when not sg", () => {
      assert.deepEqual(
        getSubRule(false, {}, "all"),
        {
          port_max: null,
          port_min: null,
          source_port_max: null,
          source_port_min: null,
          type: null,
          code: null,
        },
        "it should return correct data"
      );
    });
    it("should return default rule with all protocol when sg", () => {
      assert.deepEqual(
        getSubRule(true, {}, "all"),
        {
          port_max: null,
          port_min: null,
          type: null,
          code: null,
        },
        "it should return correct data"
      );
    });
    it("should return default rule with tcp protocol when sg", () => {
      assert.deepEqual(
        getSubRule(
          true,
          {
            tcp: {
              port_max: 1,
            },
          },
          "tcp"
        ),
        {
          port_max: 1,
          port_min: null,
          type: null,
          code: null,
        },
        "it should return correct data"
      );
    });
  });
  describe("getCodeMirrorDisplay", () => {
    it("should get correct display for `/vpcs`", () => {
      let actualData = getCodeMirrorDisplay("/vpcs", {
        vpcs: [
          {
            prefix: "hi",
            flow_logs_bucket_name: "hi",
            classic_access: "hi",
            default_network_acl_name: "hi",
            default_routing_table_name: "hi",
            default_security_group_name: "hi",
            use_public_gateways: "hi",
            resource_group: "hi",
          },
        ],
      });
      let expectedData = [
        {
          prefix: "hi",
          flow_logs_bucket_name: "hi",
          classic_access: "hi",
          default_network_acl_name: "hi",
          default_routing_table_name: "hi",
          default_security_group_name: "hi",
          use_public_gateways: "hi",
          resource_group: "hi",
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for `/transitGateway`", () => {
      let actualData = getCodeMirrorDisplay("/transitGateway", {
        enable_transit_gateway: "hi",
        transit_gateway_connections: "hi",
        transit_gateway_resource_group: "hi",
      });
      let expectedData = {
        enable_transit_gateway: "hi",
        transit_gateway_connections: "hi",
        transit_gateway_resource_group: "hi",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for `/f5BigIP`", () => {
      let actualData = getCodeMirrorDisplay("/f5BigIP", {
        f5_template_data: "hi",
        f5_vsi: "hi",
      });
      let expectedData = {
        f5_template_data: "hi",
        f5_vsi: "hi",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for `/teleport`", () => {
      let actualData = getCodeMirrorDisplay("/teleport", {
        teleport_config: "hi",
        teleport_vsi: "hi",
      });
      let expectedData = {
        teleport_config: "hi",
        teleport_vsi: "hi",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for `/subnets`", () => {
      let actualData = getCodeMirrorDisplay("/subnets", {
        vpcs: [
          {
            prefix: "hi",
            subnets: "hi",
          },
        ],
      });
      let expectedData = {
        hi: "hi",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for `/nacls`", () => {
      let actualData = getCodeMirrorDisplay("/nacls", {
        vpcs: [
          {
            prefix: "hi",
            network_acls: "hi",
          },
        ],
      });
      let expectedData = {
        hi: "hi",
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should get correct display for '/accessGroups'", () => {
      let expectedData = [{ name: "hi" }];
      let actualData = getCodeMirrorDisplay("/accessGroups", {
        access_groups: [{ name: "hi" }],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct display data"
      );
    });
    it("should otherwise return object", () => {
      let actualData = getCodeMirrorDisplay("/iamAccountSettings", {
        iam_account_settings: "hi",
      });
      assert.deepEqual(actualData, "hi", "it should return object");
    });
  });

  describe("buildComposedComponentNameHelperText", () => {
    it("should create name with use data", () => {
      assert.deepEqual(
        buildComposedComponentNameHelperText("hi", "frog", { useData: true }),
        "Composed name: frog",
        "it should return name"
      );
    });
    it("should create name with prefix", () => {
      assert.deepEqual(
        buildComposedComponentNameHelperText("hi", "frog"),
        "Composed name: hi-frog",
        "it should return name"
      );
    });
    it("should create name with prefix and random suffix", () => {
      assert.deepEqual(
        buildComposedComponentNameHelperText("hi", "frog", {
          suffix: "<random-suffix>",
        }),
        "Composed name: hi-frog-<random-suffix>",
        "it should return name"
      );
    });
    it("should create name with prefix and random suffix and parentName", () => {
      assert.deepEqual(
        buildComposedComponentNameHelperText("hi", "frog", {
          suffix: "<random-suffix>",
          parentName: "fff",
        }),
        "Composed name: hi-fff-frog-<random-suffix>",
        "it should return name"
      );
    });
  });
  it("should create name with prefix and specified suffix", () => {
    assert.deepEqual(
      buildComposedComponentNameHelperText("hi", "frog", {
        suffix: "<field name>",
      }),
      "Composed name: hi-frog-<field name>",
      "it should return name"
    );
  });

  describe("getFormCrudOperations", () => {
    it("should get fom operations from from config field", () => {
      let actualData = getFormCrudOperations({
        configDotJsonField: "hi",
        slz: {
          hi: {
            create: true,
            save: true,
            delete: true,
          },
        },
      });
      let expectedData = {
        onSubmit: true,
        onSave: true,
        onDelete: true,
      };
      assert.deepEqual(actualData, expectedData, "it should return operations");
    });
    it("should get fom operations from from config subfield", () => {
      let actualData = getFormCrudOperations({
        configDotJsonField: "hi",
        configDotJsonSubField: "hello",
        slz: {
          hi: {
            hello: {
              create: true,
              save: true,
              delete: true,
            },
          },
        },
      });
      let expectedData = {
        onSubmit: true,
        onSave: true,
        onDelete: true,
      };
      assert.deepEqual(actualData, expectedData, "it should return operations");
    });
  });
  describe("getSlzArrayFormArrayData", () => {
    it("should return correct data when no subfield", () => {
      let expectedData = [1, 2, 3, 4];
      let actualData = getSlzArrayFormArrayData({
        slz: {
          store: {
            configDotJson: {
              hi: [1, 2, 3, 4],
            },
          },
        },
        configDotJsonField: "hi",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return array from json"
      );
    });
    it("should return correct data when subfield but no array parent name", () => {
      let expectedData = [1, 2, 3, 4];
      let actualData = getSlzArrayFormArrayData({
        slz: {
          store: {
            configDotJson: {
              hi: {
                hello: [1, 2, 3, 4],
              },
            },
          },
        },
        configDotJsonField: "hi",
        configDotJsonSubField: "hello",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return array from json"
      );
    });
    it("should return correct data when subfield and array parent name and not vpc", () => {
      let expectedData = [1, 2, 3, 4];
      let actualData = getSlzArrayFormArrayData({
        slz: {
          store: {
            configDotJson: {
              hi: [
                {
                  name: "welcome",
                  hello: [1, 2, 3, 4],
                },
              ],
            },
          },
        },
        configDotJsonField: "hi",
        configDotJsonSubField: "hello",
        arrayParentName: "welcome",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return array from json"
      );
    });
    it("should return correct data when subfield and array parent name and parent is vpc", () => {
      let expectedData = [1, 2, 3, 4];
      let actualData = getSlzArrayFormArrayData({
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "welcome",
                  hello: [1, 2, 3, 4],
                },
              ],
            },
          },
        },
        configDotJsonField: "vpcs",
        configDotJsonSubField: "hello",
        arrayParentName: "welcome",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return array from json"
      );
    });
  });
  describe("formatFieldName", () => {
    it("should replace vpc with VPC", () => {
      assert.deepEqual(formatFieldName("vpcs"), "VPCs");
    });
    it("should split on underscore", () => {
      assert.deepEqual(formatFieldName("foo_bar"), "foo bar");
    });
  });
  describe("subnetGatewayToggleShouldBeDisabled", () => {
    it("should return true if no gateway is enabled in same zone as subnet", () => {
      let expectedProps = {
        prefix: "management",
        subnet: {
          name: "vsi-zone-1",
        },
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "management",
                  use_public_gateways: {
                    "zone-1": false,
                  },
                },
              ],
            },
          },
        },
      };
      assert.isTrue(
        subnetGatewayToggleShouldBeDisabled(expectedProps),
        "it should be true"
      );
    });
    it("should return false if gateway is enabled in same zone as subnet", () => {
      let expectedProps = {
        prefix: "management",
        subnet: {
          name: "vsi-zone-1",
        },
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "management",
                  use_public_gateways: {
                    "zone-1": true,
                  },
                },
              ],
            },
          },
        },
      };
      assert.isFalse(
        subnetGatewayToggleShouldBeDisabled(expectedProps),
        "it should be false"
      );
    });
  });
  describe("subnetTierVpcHasNoEnabledGateways", () => {
    it("should return true if no gateways are enabled", () => {
      let expectedProps = {
        vpc_name: "management",
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "management",
                  use_public_gateways: {
                    "zone-1": false,
                    "zone-2": false,
                    "zone-3": false,
                  },
                },
              ],
            },
          },
        },
      };
      assert.isTrue(
        subnetTierVpcHasNoEnabledGateways(expectedProps),
        "it should be disabled"
      );
    });
    it("should return false if any gateways are enabled", () => {
      let expectedProps = {
        vpc_name: "management",
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
      };
      assert.isFalse(
        subnetTierVpcHasNoEnabledGateways(expectedProps),
        "it should be enabled"
      );
    });
  });
  describe("parentHasRandomSuffix", () => {
    it("should return random suffix value based on array parent name", () => {
      assert.isTrue(
        parentHasRandomSuffix({
          slz: {
            store: {
              configDotJson: {
                cos: [
                  {
                    name: "todd",
                    random_suffix: true,
                  },
                ],
              },
            },
          },
          arrayParentName: "todd",
        }),
        "it should be true"
      );
    });
  });
  describe("subnetTierInitState", () => {
    it("should return the correct state if modal", () => {
      let expectedData = {
        name: "",
        zones: 1,
        networkAcl: "",
        addPublicGateway: false,
        hide: true,
        showDeleteModal: false,
      };
      let actualData = subnetTierInitState({ isModal: true, hide: true });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state if not modal", () => {
      let expectedData = {
        name: "frog",
        zones: 3,
        networkAcl: "todd-acl",
        addPublicGateway: true,
        hide: true,
        showDeleteModal: false,
      };
      let actualData = subnetTierInitState({
        tier: {
          name: "frog",
          zones: 3,
        },
        vpc_name: "todd",
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "todd",
                  subnets: {
                    "zone-1": [
                      {
                        name: "frog-zone-1",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                    "zone-2": [
                      {
                        name: "frog-zone-2",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                    "zone-3": [
                      {
                        name: "frog-zone-3",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return the correct state if not modal with cheats enabled", () => {
      let expectedData = {
        name: "frog",
        zones: 3,
        networkAcl: "todd-acl",
        addPublicGateway: true,
        hide: false,
        showDeleteModal: false,
      };
      let actualData = subnetTierInitState({
        tier: {
          name: "frog",
          zones: 3,
        },
        vpc_name: "todd",
        slz: {
          store: {
            cheatsEnabled: true,
            configDotJson: {
              vpcs: [
                {
                  prefix: "todd",
                  subnets: {
                    "zone-1": [
                      {
                        name: "frog-zone-1",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                    "zone-2": [
                      {
                        name: "frog-zone-2",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                    "zone-3": [
                      {
                        name: "frog-zone-3",
                        acl_name: "todd-acl",
                        public_gateway: true,
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("nonReservedSubnetTierList", () => {
    it("should return an empty array if not f5 on management", () => {
      assert.deepEqual(
        nonReservedSubnetTierList({
          vpc_name: "management",
          slz: {
            store: {
              f5_on_management: null,
            },
          },
        }),
        [],
        "it should return correct data"
      );
    });
    it("should return a list of non-reserved subnet tier names if f5 on management", () => {
      let expectedData = [{ name: "frog" }];
      let actualData = nonReservedSubnetTierList({
        vpc_name: "management",
        slz: {
          store: {
            f5_on_management: true,
            subnetTiers: {
              management: [{ name: "f5-external" }, { name: "frog" }],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("nextSubnetTierIndex", () => {
    it("should return 1 if no subnets and f5_on_management", () => {
      let actualData = nextSubnetTierIndex({
        vpc_name: "management",
        slz: {
          store: {
            f5_on_management: true,
            subnetTiers: {
              management: [],
            },
          },
        },
      });
      assert.deepEqual(actualData, 1, "it should return 1");
    });
    it("should return length if f5 on management and vpc is edge vpc", () => {
      let actualData = nextSubnetTierIndex({
        vpc_name: "management",
        slz: {
          store: {
            f5_on_management: true,
            edge_vpc_prefix: "management",
            subnetTiers: {
              management: [{ name: "f5-external" }, { name: "frog" }],
            },
          },
        },
      });
      assert.deepEqual(actualData, 1, "it should return 1");
    });
    it("should otherwise return length if not f5 on management and not edge vpc", () => {
      let actualData = nextSubnetTierIndex({
        vpc_name: "management",
        slz: {
          store: {
            f5_on_management: false,
            edge_vpc_prefix: "null",
            subnetTiers: {
              management: [{ name: "frog" }, { name: "frog-2" }],
            },
          },
        },
      });
      assert.deepEqual(actualData, 2, "it should return 1");
    });
  });
  describe("subnetTierModalList", () => {
    it("should return data for subnet tier modal", () => {
      let actualData = subnetTierModalList(
        {
          zones: 2,
          name: "test",
          networkAcl: "",
          addPublicGateway: true,
        },
        {
          vpc_name: "management",
          slz: {
            store: {
              f5_on_management: true,
              edge_vpc_prefix: "management",
              subnetTiers: {
                management: [{ name: "frog" }, { name: "frog-2" }],
              },
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
          isModal: true,
        }
      );
      let expectedData = [
        {
          name: "test-zone-1",
          cidr: "10.10.30.0/24",
          acl_name: "",
          public_gateway: true,
        },
        {
          name: "test-zone-2",
          cidr: "10.20.30.0/24",
          acl_name: "",
          public_gateway: false,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected data"
      );
    });
  });
  describe("subnetTierFormList", () => {
    it("should return a list of subnets when increasing from one zone to three zones", () => {
      let expectedData = [
        {
          acl_name: "management-acl",
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          public_gateway: true,
        },
        {
          acl_name: "management-acl",
          cidr: "10.20.30.0/24",
          name: "vpn-zone-2",
          public_gateway: true,
        },
        {
          acl_name: "management-acl",
          cidr: "10.30.30.0/24",
          name: "vpn-zone-3",
          public_gateway: false,
        },
      ];
      let actualData = subnetTierFormList(
        {
          name: "vpn",
          zones: 3,
          networkAcl: "management-acl",
          addPublicGateway: true,
        },
        {
          tier: {
            name: "vpn",
            zones: 1,
          },
          vpc_name: "management",
          slz: {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "management",
                    subnets: {
                      "zone-1": [
                        {
                          acl_name: "management-acl",
                          cidr: "10.10.30.0/24",
                          name: "vpn-zone-1",
                          public_gateway: true,
                        },
                      ],
                      "zone-2": [],
                      "zone-3": [],
                    },
                    use_public_gateways: {
                      "zone-1": true,
                      "zone-2": true,
                      "zone-3": false,
                    },
                  },
                ],
              },
              subnetTiers: {
                management: [
                  {
                    name: "vsi",
                  },
                  {
                    name: "vpe",
                  },
                  {
                    name: "vpn",
                    zones: 1,
                  },
                ],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected data"
      );
    });
    it("should return a list of subnets when increasing from one zone to three zones on edge vpc", () => {
      let expectedData = [
        {
          acl_name: "management-acl",
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          public_gateway: true,
        },
        {
          acl_name: "management-acl",
          cidr: "10.20.30.0/24",
          name: "vpn-zone-2",
          public_gateway: true,
        },
        {
          acl_name: "management-acl",
          cidr: "10.30.30.0/24",
          name: "vpn-zone-3",
          public_gateway: false,
        },
      ];
      let actualData = subnetTierFormList(
        {
          name: "vpn",
          zones: 3,
          networkAcl: "management-acl",
          addPublicGateway: true,
        },
        {
          tier: {
            name: "vpn",
            zones: 1,
          },
          vpc_name: "management",
          slz: {
            store: {
              edge_vpc_prefix: "management",
              f5_on_management: true,
              configDotJson: {
                vpcs: [
                  {
                    prefix: "management",
                    subnets: {
                      "zone-1": [
                        {
                          acl_name: "management-acl",
                          cidr: "10.10.30.0/24",
                          name: "vpn-zone-1",
                          public_gateway: true,
                        },
                      ],
                      "zone-2": [],
                      "zone-3": [],
                    },
                    use_public_gateways: {
                      "zone-1": true,
                      "zone-2": true,
                      "zone-3": false,
                    },
                  },
                ],
              },
              subnetTiers: {
                management: [
                  {
                    name: "vsi",
                  },
                  {
                    name: "vpe",
                  },
                  {
                    name: "vpn",
                    zones: 1,
                  },
                ],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected data"
      );
    });
    it("should return a list of subnets when decreasing from two zones to one zones", () => {
      let expectedData = [
        {
          acl_name: "management-acl",
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          public_gateway: true,
        },
      ];
      let actualData = subnetTierFormList(
        {
          name: "vpn",
          zones: 1,
          networkAcl: "management-acl",
          addPublicGateway: true,
        },
        {
          tier: {
            name: "vpn",
            zones: 2,
          },
          vpc_name: "management",
          slz: {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "management",
                    subnets: {
                      "zone-1": [
                        {
                          acl_name: "management-acl",
                          cidr: "10.10.30.0/24",
                          name: "vpn-zone-1",
                          public_gateway: true,
                        },
                      ],
                      "zone-2": [
                        {
                          acl_name: "management-acl",
                          cidr: "10.20.30.0/24",
                          name: "vpn-zone-2",
                          public_gateway: false,
                        },
                      ],
                      "zone-3": [],
                    },
                    use_public_gateways: {
                      "zone-1": false,
                      "zone-2": false,
                      "zone-3": false,
                    },
                  },
                ],
              },
              subnetTiers: {
                management: [
                  {
                    name: "vsi",
                  },
                  {
                    name: "vpe",
                  },
                  {
                    name: "vpn",
                    zones: 1,
                  },
                ],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected data"
      );
    });
    it("should return a list of subnets when props match state", () => {
      let expectedData = [
        {
          acl_name: "management-acl",
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          public_gateway: false,
        },
      ];
      let actualData = subnetTierFormList(
        {
          name: "vpn",
          zones: 1,
          networkAcl: "management-acl",
          addPublicGateway: false,
        },
        {
          tier: {
            name: "vpn",
            zones: 1,
          },
          vpc_name: "management",
          slz: {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "management",
                    subnets: {
                      "zone-1": [
                        {
                          acl_name: "management-acl",
                          cidr: "10.10.30.0/24",
                          name: "vpn-zone-1",
                          public_gateway: false,
                        },
                      ],
                      "zone-2": [],
                      "zone-3": [],
                    },
                    use_public_gateways: {
                      "zone-1": true,
                      "zone-2": false,
                      "zone-3": false,
                    },
                  },
                ],
              },
              subnetTiers: {
                management: [
                  {
                    name: "vsi",
                  },
                  {
                    name: "vpe",
                  },
                  {
                    name: "vpn",
                    zones: 1,
                  },
                ],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected data"
      );
    });
  });
  describe("subnetTierName", () => {
    it("should create a display name for all caps title", () => {
      let expectedData = "VSI subnet tier";
      let actualData = subnetTierName("vsi");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create a display name for modal", () => {
      let expectedData = "New subnet tier";
      let actualData = subnetTierName("");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create a display name", () => {
      let expectedData = "frog subnet tier";
      let actualData = subnetTierName("frog");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("getCosKeysFromBucket", () => {
    it("should get a list of keys from data", () => {
      let expectedData = ["frog"];
      let actualData = getCosKeysFromBucket(
        {
          teleport_config: {
            cos_bucket_name: "test",
          },
        },
        {
          slz: {
            store: {
              configDotJson: {
                cos: [
                  {
                    name: "test",
                    buckets: [
                      {
                        name: "test",
                      },
                    ],
                    keys: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("getBucketInstance", () => {
    it("should get a list of keys from data", () => {
      let expectedData = "frog";
      let actualData = getBucketInstance("test", {
        slz: {
          store: {
            configDotJson: {
              cos: [
                {
                  name: "test",
                  buckets: [],
                },
                {
                  name: "frog",
                  buckets: [
                    {
                      name: "test",
                    },
                  ],
                },
              ],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("codeMirrorJson", () => {
    it("should return empty string", () => {
      let actualData = codeMirrorJson("/home", {});
      assert.deepEqual(actualData, "", "it should return empty string");
    });
    it("should return json for code mirror", () => {
      let state = new slzState();
      state.store.configDotJson.f5_template_data.tmos_admin_password = "fooooo";
      state.store.configDotJson.f5_template_data.license_password = "fooooo";
      let expectedData = {
        f5_template_data: {
          tmos_admin_password: "****************************",
          license_type: "none",
          byol_license_basekey: "null",
          license_host: "null",
          license_password: "****************************",
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
        },
        f5_vsi: [],
      };
      let actualData = codeMirrorJson("/f5BigIP", state);
      assert.deepEqual(
        actualData,
        prettyJSON(expectedData),
        "it should return correct data"
      );
    });
    it("should return json for code mirror", () => {
      let state = new slzState();
      state.store.configDotJson.ssh_keys.public_key = "foo";
      let expectedData = [
        {
          name: "slz-ssh-key",
          public_key: "****************************",
          resource_group: "management-rg",
        },
      ];
      let actualData = codeMirrorJson("/sshKeys", state);
      assert.deepEqual(
        actualData,
        prettyJSON(expectedData),
        "it should return correct data"
      );
    });
    it("should return empty json", () => {
      let state = new slzState();
      let expectedData = "{}";
      let actualData = codeMirrorJson("/foo", state);
      assert.deepEqual(actualData, expectedData, "it should return empty json");
    });
  });
});
