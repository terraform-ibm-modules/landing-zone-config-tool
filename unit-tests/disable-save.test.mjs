import { assert } from "chai";
import { disableSave } from "../client/src/lib/disable-save.js";

describe("disableSave", () => {
  describe("appid", () => {
    it("should return false when use_data is true and name is not empty", () => {
      let disableAppid = disableSave(
        "appid",
        { use_data: true, name: "f", resource_group: "toad" },
        {
          slz: {
            store: {
              resourceGroups: ["toad"],
            },
          },
        }
      );
      assert.isFalse(disableAppid, "it should be enabled");
    });
    it("should return true if otherwise invalid", () => {
      let disableAppid = disableSave(
        "appid",
        {
          use_appid: true,
          use_data: false,
          name: "$$$$$",
          resource_group: "toad",
        },
        {
          slz: {
            store: {
              resourceGroups: ["toad"],
            },
          },
        }
      );
      assert.isTrue(disableAppid, "it should be disabled");
    });
    it("should return false when use_data is true and name is not empty", () => {
      let disableAppid = disableSave(
        "appid",
        { use_data: true, name: "f", resource_group: "toad" },
        {
          slz: {
            store: {
              resourceGroups: ["toad"],
            },
          },
        }
      );
      assert.isFalse(disableAppid, "it should be enabled");
    });
  });
  describe("key_management", () => {
    it("should return true if using data and instance name is empty", () => {
      let disabledKms = disableSave(
        "key_management",
        {
          use_data: true,
          name: "",
        },
        {
          slz: {
            store: {
              resourceGroups: ["hi"],
            },
          },
        }
      );
      assert.isTrue(disabledKms, "it should be disabled");
    });
    it("should return true if not using data and instance name is valid", () => {
      let disabledKms = disableSave(
        "key_management",
        {
          name: "frog",
          resource_group: "frog",
        },
        {
          slz: {
            store: {
              resourceGroups: ["frog"],
            },
          },
        }
      );
      assert.isFalse(disabledKms, "it should be enabled");
    });
  });
  describe("secrets_manager", () => {
    it("should return false if secrets_manager is not enabled", () => {
      let data = disableSave("secrets_manager", {
        use_secrets_manager: false,
      });
      assert.isFalse(data, "it should be enabled");
    });
    it("should return true if a required field is invalid when enabled", () => {
      let data = disableSave(
        "secrets_manager",
        {
          use_secrets_manager: true,
          name: "$$$$",
        },
        {
          slz: {
            store: {
              resourceGroups: [],
            },
          },
        }
      );
      assert.isTrue(data, "it should be disabled");
    });
    it("should return false if all is well", () => {
      let data = disableSave(
        "secrets_manager",
        {
          use_secrets_manager: true,
          name: "s",
          kms_key_name: "f",
          resource_group: "f",
        },
        {
          slz: {
            store: {
              resourceGroups: ["f"],
              encryptionKeys: ["f"],
            },
          },
        }
      );
      assert.isFalse(data, "it should be enabled");
    });
  });
  describe("networking_rule", () => {
    it("should return true if a rule is invalid", () => {
      assert.isTrue(
        disableSave(
          "networking_rule",
          {
            rule: {
              code: 9999999,
            },
            ruleProtocol: "icmp",
          },
          {}
        ),
        "it should be disabled"
      );
    });
    it("should return false if a rule is valid and passes enable submit test", () => {
      assert.isFalse(
        disableSave(
          "networking_rule",
          {
            name: "todd",
            rule: {
              code: 1,
              type: null,
            },
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            destination: "1.2.3.4",
          },
          {
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "test",
                      network_acls: [
                        {
                          name: "todd",
                          rules: [],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            parent_name: "todd",
            vpc_name: "test",
            isAclForm: true,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if a rule is valid with invalid destination", () => {
      assert.isTrue(
        disableSave(
          "networking_rule",
          {
            name: "todd",
            rule: {
              code: 1,
              type: null,
            },
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            destination: "$$",
          },
          {
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "test",
                      network_acls: [
                        {
                          name: "todd",
                          rules: [],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            parent_name: "todd",
            vpc_name: "test",
            isAclForm: true,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if a rule is valid and passes enable submit test when acl rule", () => {
      assert.isFalse(
        disableSave(
          "networking_rule",
          {
            name: "todd",
            rule: {
              code: 1,
              type: null,
            },
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            destination: "1.2.3.4",
          },
          {
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "test",
                      network_acls: [
                        {
                          name: "todd",
                          rules: [],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            parent_name: "todd",
            vpc_name: "test",
            isAclForm: true,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if a rule is valid and passes enable submit test when acl rule that has invalid name", () => {
      assert.isTrue(
        disableSave(
          "networking_rule",
          {
            name: "22222",
            rule: {
              code: 1,
              type: null,
            },
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            destination: "1.2.3.4",
          },
          {}
        ),
        "it should be disabled"
      );
    });
    it("should return true if a security group rule is valid", () => {
      assert.isFalse(
        disableSave(
          "networking_rule",
          {
            name: "todd",
            rule: {
              code: 1,
              type: null,
            },
            ruleProtocol: "icmp",
            source: "1.2.3.4",
          },
          {
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "test",
                      network_acls: [
                        {
                          name: "todd",
                          rules: [],
                        },
                      ],
                    },
                  ],
                  security_groups: [
                    {
                      name: "todd",
                      rules: [],
                    },
                  ],
                },
              },
            },
            parent_name: "todd",
            vpc_name: "test",
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("buckets", () => {
    it("should return true when the bucket name already exists", () => {
      assert.isTrue(
        disableSave(
          "buckets",
          {
            name: "honk",
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                cosBuckets: ["honk", "test"],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if the name is different and does not exist", () => {
      assert.isFalse(
        disableSave(
          "buckets",
          {
            name: "honk",
            kms_key: "test",
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                cosBuckets: ["test"],
                encryptionKeys: ["test"],
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should return true if no data is passed", () => {
      assert.isTrue(
        disableSave(
          "buckets",
          {
            name: "honk",
          },
          {
            slz: {
              store: {
                cosBuckets: ["test"],
                encryptionKeys: [],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if the bucket has the same name and is valid", () => {
      assert.isFalse(
        disableSave(
          "buckets",
          {
            name: "honk",
            kms_key: "hi",
          },
          {
            data: {
              name: "honk",
            },
            slz: {
              store: {
                cosBuckets: ["test"],
                encryptionKeys: ["hi"],
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("cos", () => {
    it("should return true when the cos name already exists", () => {
      assert.isTrue(
        disableSave(
          "cos",
          {
            name: "honk",
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                resourceGroups: ["moose"],
                configDotJson: {
                  cos: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false if the name is different and does not exist and valid resource group", () => {
      assert.isFalse(
        disableSave(
          "cos",
          {
            name: "honk",
            resource_group: "moose",
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                resourceGroups: ["moose"],
                configDotJson: {
                  cos: [],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should return false if the instance has the same name and resource group are valid", () => {
      assert.isFalse(
        disableSave(
          "cos",
          {
            name: "honk",
            resource_group: "moose",
          },
          {
            data: {
              name: "honk",
            },
            slz: {
              store: {
                resourceGroups: ["moose"],
                configDotJson: {
                  cos: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should return false if the instance has the same name and resource group are valid", () => {
      assert.isFalse(
        disableSave(
          "cos",
          {
            name: "honk",
            resource_group: "moose",
          },
          {
            data: {
              name: "honk",
            },
            slz: {
              store: {
                resourceGroups: ["moose"],
                configDotJson: {
                  cos: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("cos_keys", () => {
    it("should get a list of all key names from the parent instance and return true if a duplicate is found", () => {
      assert.isTrue(
        disableSave(
          "cos_keys",
          { name: "frog" },
          {
            data: { name: "todd" },
            arrayParentName: "cos",
            slz: {
              store: {
                configDotJson: {
                  cos: [
                    {
                      name: "cos",
                      keys: [
                        {
                          name: "frog",
                        },
                        {
                          name: "todd",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if no data is passed", () => {
      assert.isTrue(
        disableSave(
          "cos_keys",
          { name: "frog", cos_name: "good" },
          {
            arrayParentName: "cos",
            slz: {
              store: {
                configDotJson: {
                  cos: [
                    {
                      name: "cos",
                      keys: [
                        {
                          name: "frog",
                        },
                        {
                          name: "todd",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("clusters", () => {
    it("should disable save on openshift clusters with fewer than 2 workers", () => {
      assert.isTrue(
        disableSave(
          "clusters",
          {
            cluster: {
              name: "frog",
              workers_per_subnet: 1,
              subnet_names: ["subnet"],
              kube_type: "openshift",
              cos_name: "frog",
            },
          },
          {
            cluster: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "todd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save on openshift clusters with no cos name", () => {
      assert.isTrue(
        disableSave(
          "clusters",
          {
            cluster: {
              name: "frog",
              workers_per_subnet: 1,
              subnet_names: ["subnet"],
              kube_type: "openshift",
              cos_name: "",
            },
          },
          {
            cluster: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "todd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should save on openshift clusters with at least 2 workers where all else is valid", () => {
      assert.isFalse(
        disableSave(
          "clusters",
          {
            cluster: {
              name: "frog",
              workers_per_subnet: 2,
              subnet_names: ["subnet"],
              kube_type: "openshift",
              cos_name: "frog",
              vpc_name: "hi",
              resource_group: "hi",
              kms_config: {
                crk_name: "hi",
              },
              machine_type: "aaaaaaa",
              kube_version: "aaaaaaa",
              operating_system: "aaaaaaa",
            },
          },
          {
            data: {
              name: "frog",
            },
            slz: {
              store: {
                encryptionKeys: ["hi"],
                vpcList: ["hi"],
                resourceGroups: ["hi"],
                configDotJson: {
                  clusters: [
                    {
                      name: "todd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should save on openshift clusters with at least 2 workers in modal with valid rg and vpc", () => {
      assert.isFalse(
        disableSave(
          "clusters",
          {
            cluster: {
              name: "frog",
              workers_per_subnet: 2,
              subnet_names: ["subnet"],
              kube_type: "openshift",
              cos_name: "frog",
              vpc_name: "hi",
              resource_group: "hello",
              kms_config: {
                crk_name: "hi",
              },
              machine_type: "aaaaaaa",
              kube_version: "aaaaaaa",
              operating_system: "aaaaaaa",
            },
          },
          {
            slz: {
              store: {
                encryptionKeys: ["hi"],
                resourceGroups: ["hello"],
                vpcList: ["hi"],
                configDotJson: {
                  clusters: [
                    {
                      name: "todd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("worker_pools", () => {
    it("should return true if a duplicate worker pool name is found in the cluster where a pool is provisioned", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            pool: {
              name: "todd",
              subnet_names: ["frog"],
              flavor: "buffalo ranch",
            },
          },
          {
            arrayParentName: "cluster",
            data: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "cluster",
                      worker_pools: [
                        {
                          name: "todd",
                        },
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
        ),
        "it should be disabled"
      );
    });
    it("should return true when no data is passed", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            pool: {
              name: "todd",
            },
          },
          {
            arrayParentName: "cluster",
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "cluster",
                      worker_pools: [
                        {
                          name: "todd",
                        },
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
        ),
        "it should be disabled"
      );
    });
    it("should return true if no subnet names", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            pool: {
              name: "todd2",
              subnet_names: [],
              flavor: "buffalo ranch",
            },
          },
          {
            arrayParentName: "cluster",
            data: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "cluster",
                      worker_pools: [
                        {
                          name: "todd",
                        },
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
        ),
        "it should be disabled"
      );
    });
    it("should return true if no flavor", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            pool: {
              name: "todd2",
              subnet_names: ["hi"],
              flavor: "",
            },
          },
          {
            arrayParentName: "cluster",
            data: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  clusters: [
                    {
                      name: "cluster",
                      worker_pools: [
                        {
                          name: "todd",
                        },
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
        ),
        "it should be disabled"
      );
    });
  });
  describe("kms_key", () => {
    it("should return true if an encryption key with a duplicate name is found", () => {
      assert.isTrue(
        disableSave(
          "kms_key",
          {
            name: "frog",
          },
          {
            data: {
              name: "help",
            },
            slz: {
              store: {
                configDotJson: {
                  key_management: {
                    keys: [
                      {
                        name: "frog",
                      },
                      {
                        name: "key",
                      },
                    ],
                  },
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("acl", () => {
    it("should return true if a duplicate acl name is found in the vpc where an acl is provisioned", () => {
      assert.isTrue(
        disableSave(
          "acl",
          {
            name: "todd",
          },
          {
            arrayParentName: "cluster",
            data: {
              name: "frog",
            },
            slz: {
              store: {
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "cluster",
                      network_acls: [
                        {
                          name: "todd",
                        },
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
        ),
        "it should be disabled"
      );
    });
  });
  describe("resource_groups", () => {
    it("should return true when the resource group name already exists", () => {
      assert.isTrue(
        disableSave(
          "resource_groups",
          {
            name: "honk",
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                configDotJson: {
                  resource_groups: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false when a non-created resource group has a hyphen at the end", () => {
      assert.isFalse(
        disableSave(
          "resource_groups",
          {
            name: "honk-",
            create: false,
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                configDotJson: {
                  resource_groups: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("security_groups", () => {
    it("should return true when the security group name already exists", () => {
      assert.isTrue(
        disableSave(
          "security_groups",
          {
            name: "honk",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                resourceGroups: [],
                vpcList: [],
                configDotJson: {
                  security_groups: [{ name: "honk" }],
                  vsi: [],
                  teleport_vsi: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false when valid", () => {
      assert.isFalse(
        disableSave(
          "security_groups",
          {
            name: "honk",
            resource_group: "hi",
            vpc_name: "hello",
          },
          {
            slz: {
              store: {
                resourceGroups: ["hi"],
                vpcList: ["hello"],
                configDotJson: {
                  security_groups: [],
                  vsi: [],
                  teleport_vsi: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("ssh_keys", () => {
    it("should return true when the ssh key name already exists", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "honk",
            resource_group: "hi",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                configDotJson: {
                  ssh_keys: [{ name: "honk", public_key: "1234" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when the ssh key has no rg", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "honk",
            resource_group: "",
            public_key:
              "ssh-rsAAAAB3NzaC1yc2thisisaninvalidsshkey... test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                configDotJson: {
                  ssh_keys: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when the public key value already exists", () => {
      assert.isTrue(
        disableSave(
          "ssh_keys",
          {
            name: "test",
            resource_group: "hi",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                configDotJson: {
                  ssh_keys: [
                    {
                      name: "honk",
                      public_key:
                        "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("vpn_gateways", () => {
    it("should return true when the vpn gateway name already exists", () => {
      assert.isTrue(
        disableSave(
          "vpn_gateways",
          {
            name: "honk",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                vpcList: [],
                resourceGroups: [],
                configDotJson: {
                  vpn_gateways: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when none subnet name", () => {
      assert.isTrue(
        disableSave(
          "vpn_gateways",
          {
            name: "honk2",
            resource_group: "hi",
            vpc_name: "hi",
            subnet_name: null,
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                vpcList: ["hi"],
                resourceGroups: ["hi"],
                configDotJson: {
                  vpn_gateways: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("vsi", () => {
    it("should return true when the vsi name already exists", () => {
      assert.isTrue(
        disableSave(
          "vsi",
          {
            name: "honk",
            subnet_names: ["frog"],
            vpc_name: "hi",
            ssh_keys: ["hi"],
            vsi_per_subnet: 1,
            image_name: "aaaaaaaa",
            machine_type: "aaaaaaa",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                resourceGroups: [],
                vpcList: [],
                configDotJson: {
                  vsi: [{ name: "honk" }],
                  teleport_vsi: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when none subnets", () => {
      assert.isTrue(
        disableSave(
          "vsi",
          {
            name: "honk",
            subnet_names: [],
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                configDotJson: {
                  vsi: [{ name: "honk" }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false when a valid vsi is passed", () => {
      assert.isFalse(
        disableSave(
          "vsi",
          {
            name: "sdfsdf",
            subnet_names: ["frog"],
            vpc_name: "hi",
            resource_group: "frog",
            boot_volume_encryption_key_name: "hi",
            image_name: "aaaaaaaa",
            machine_type: "aaaaaaa",
            ssh_keys: ["aaa"],
            vsi_per_subnet: 1,
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                encryptionKeys: ["hi"],
                resourceGroups: ["frog"],
                vpcList: ["hi"],
                configDotJson: { vsi: [], teleport_vsi: [] },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("teleport_vsi", () => {
    it("should return true when the vsi name already exists", () => {
      assert.isTrue(
        disableSave(
          "teleport_vsi",
          {
            name: "honk",
            resource_group: "hi",
            image_name: "ffffff",
            machine_type: "ffffff",
            ssh_keys: ["aaa"],
            vpc_name: "test",
            subnet_names: ["a"],
          },
          {
            data: {
              name: "test",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                vpcList: ["test"],
                configDotJson: {
                  teleport_vsi: [{ name: "honk" }],
                  vsi: [],
                },
              },
            },
          },
          true
        ),
        "it should be disabled"
      );
    });
    it("should return true when none subnet name", () => {
      assert.isTrue(
        disableSave(
          "vsi",
          {
            name: "frog",
            subnet_name: "",
            resource_group: "hi",
            vpc_name: "todd",
            boot_volume_encryption_key_name: "hi",
            image_name: "ffffff",
            machine_type: "ffffff",
            ssh_keys: ["aaa"],
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                vpcList: ["todd"],
                resourceGroups: ["hi"],
                encryptionKeys: ["hi"],
                configDotJson: { vsi: [], teleport_vsi: [] },
              },
            },
            isTeleport: true,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true when vsi has invalid security_group name", () => {
      assert.isTrue(
        disableSave(
          "vsi",
          {
            name: "frog",
            subnet_name: "",
            resource_group: "hi",
            vpc_name: "todd",
            boot_volume_encryption_key_name: "hi",
            image_name: "ffffff",
            machine_type: "ffffff",
            ssh_keys: ["aaa"],
            security_group: {
              name: "$$$$",
            },
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                vpcList: ["todd"],
                resourceGroups: ["hi"],
                encryptionKeys: ["hi"],
                configDotJson: { vsi: [], teleport_vsi: [] },
              },
            },
            isTeleport: true,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false when a valid vsi is passed", () => {
      assert.isFalse(
        disableSave(
          "vsi",
          {
            name: "frog",
            subnet_names: ["frog"],
            resource_group: "hi",
            vpc_name: "todd",
            boot_volume_encryption_key_name: "hi",
            image_name: "ffffff",
            machine_type: "ffffff",
            ssh_keys: ["aaa"],
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                vpcList: ["todd"],
                resourceGroups: ["hi"],
                encryptionKeys: ["hi"],
                configDotJson: { vsi: [], teleport_vsi: [] },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("subnet_tiers", () => {
    it("should disable when a reserved subnet tier name is passed to a non-edge vpc", () => {
      assert.isTrue(
        disableSave(
          "subnet_tiers",
          {
            name: "f5-external",
          },
          {
            vpc_name: "frog",
            slz: {
              store: {
                edge_vpc_prefix: "edge",
                subnetTiers: {
                  frog: [{ name: "edge" }],
                },
              },
            },
            tier: {
              name: "",
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should enable when name is not reserved and name is valid", () => {
      assert.isFalse(
        disableSave(
          "subnet_tiers",
          {
            name: "hmmm",
          },
          {
            vpc_name: "frog",
            tier: {
              name: "eh",
            },
            slz: {
              store: {
                edge_vpc_prefix: "edge",
                subnetTiers: {
                  frog: [{ name: "vsi" }],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should disable when subnet has no acl", () => {
      assert.isTrue(
        disableSave(
          "subnet_tiers",
          {
            name: "hmm",
            networkAcl: "",
          },
          {
            vpc_name: "frog",
            slz: {
              store: {
                edge_vpc_prefix: "edge",
                subnetTiers: {
                  frog: [{ name: "edge" }],
                },
              },
            },
            tier: {
              name: "",
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("vpcs", () => {
    it("should enable save when everything is fine", () => {
      assert.isFalse(
        disableSave(
          "vpcs",
          {
            prefix: "help",
            resource_group: "hi",
            flow_logs_bucket_name: "jo",
            default_routing_table_name: null,
            default_security_group_name: null,
            default_network_acl_name: null,
          },
          {
            data: {
              prefix: "frog",
            },
            slz: {
              store: {
                cosBuckets: ["jo"],
                resourceGroups: ["hi"],
                vpcList: ["frog"],
                configDotJson: {
                  vpcs: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when changing the vpc name to a duplicate name", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "help",
          },
          {
            data: {
              prefix: "frog",
            },
            slz: {
              store: {
                resourceGroups: [],
                vpcList: ["help", "frog"],
                configDotJson: {
                  vpcs: [],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when changing the vpc default acl name to a duplicate acl name", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "dddd",
            default_network_acl_name: "double",
          },
          {
            data: {
              prefix: "help",
            },
            slz: {
              store: {
                resourceGroups: [],
                vpcList: ["help", "frog"],
                configDotJson: {
                  vpcs: [
                    {
                      prefix: "help",
                      network_acls: [{ name: "double" }],
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when changing the vpc default security group name to a duplicate security group name", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "a",
            default_security_group_name: "double",
            resource_group: "hi",
            flow_logs_bucket_name: "hi",
            default_network_acl_name: "",
            default_routing_table_name: null,
          },
          {
            data: {
              prefix: "dddd",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                cosBuckets: ["hi"],
                vpcList: ["dddd", "frog"],
                configDotJson: {
                  security_groups: [
                    {
                      name: "double",
                    },
                  ],
                  vsi: [],
                  teleport_vsi: [],
                  vpcs: [
                    {
                      prefix: "dddd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when changing the vpc default routing table name to an invalid routing table name", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "a",
            default_security_group_name: null,
            resource_group: "hi",
            flow_logs_bucket_name: "hi",
            default_network_acl_name: null,
            default_routing_table_name: "$$$$",
          },
          {
            data: {
              prefix: "dddd",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                cosBuckets: ["hi"],
                vpcList: ["dddd", "frog"],
                configDotJson: {
                  security_groups: [
                    {
                      name: "double",
                    },
                  ],
                  vsi: [],
                  teleport_vsi: [],
                  vpcs: [
                    {
                      prefix: "dddd",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when changing the vpc default routing table name to a duplicate name", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "a",
            default_security_group_name: null,
            resource_group: "hi",
            flow_logs_bucket_name: "hi",
            default_network_acl_name: null,
            default_routing_table_name: "dupe",
          },
          {
            data: {
              prefix: "dddd",
              default_routing_table_name: "",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                cosBuckets: ["hi"],
                vpcList: ["dddd", "frog"],
                configDotJson: {
                  security_groups: [
                    {
                      name: "double",
                    },
                  ],
                  vsi: [],
                  teleport_vsi: [],
                  vpcs: [
                    {
                      prefix: "dddd",
                    },
                    {
                      prefix: "frog",
                      default_routing_table_name: "dupe",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should disable save when adding classic access when another vpc has classic access", () => {
      assert.isTrue(
        disableSave(
          "vpcs",
          {
            prefix: "help",
            classic_access: true,
          },
          {
            data: {
              prefix: "frog",
              classic_access: false,
            },
            slz: {
              store: {
                vpcList: ["help", "frog"],
                configDotJson: {
                  vpcs: [{ classic_access: true }, { classic_access: false }],
                },
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("virtual_private_endpoints", () => {
    it("should disable vpe if no vpcs are added", () => {
      assert.isTrue(
        disableSave("virtual_private_endpoints", {
          vpe: {
            vpcs: [],
          },
        }),
        "it should be disabled"
      );
    });
    it("should disable vpe if no subnets are added to a vpc field in vpcData", () => {
      assert.isTrue(
        disableSave("virtual_private_endpoints", {
          vpe: {
            vpcs: ["test"],
          },
          vpcData: {
            test: {
              subnets: [],
            },
          },
        }),
        "it should be disabled"
      );
    });
    it("should enable with a valid name and at least one vpc with at least one subnet", () => {
      assert.isFalse(
        disableSave(
          "virtual_private_endpoints",
          {
            vpe: {
              service_name: "todd",
              vpcs: [
                {
                  name: "hi",
                },
              ],
              resource_group: "hi",
            },
            vpcData: {
              test: {
                subnets: ["hmm"],
              },
            },
          },
          {
            data: {
              service_name: "frog",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                configDotJson: {
                  virtual_private_endpoints: [
                    {
                      service_name: "eh",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should disable with a valid name and at least one vpc with at least one subnet and no security group", () => {
      assert.isTrue(
        disableSave(
          "virtual_private_endpoints",
          {
            vpe: {
              service_name: "todd",
              vpcs: [
                {
                  name: "hi",
                },
              ],
              resource_group: "hi",
            },
            vpcData: {
              test: {
                subnets: ["hmm"],
                security_group_name: null,
              },
              test2: {
                subnets: ["hmm"],
                security_group_name: "yes",
              },
            },
          },
          {
            data: {
              service_name: "frog",
            },
            slz: {
              store: {
                resourceGroups: ["hi"],
                configDotJson: {
                  virtual_private_endpoints: [
                    {
                      service_name: "eh",
                    },
                  ],
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("access_groups", () => {
    it("it should disable save if access group name is invalid", () => {
      assert.isTrue(
        disableSave("access_groups", { name: "$$" }),
        "it should be disabled"
      );
    });
    it("it should disable save if access group policy name is invalid", () => {
      assert.isTrue(
        disableSave("policies", { name: "$$" }),
        "it should be disabled"
      );
    });

    it("it should disable save if access group dynamic policy name is invalid", () => {
      assert.isTrue(
        disableSave("dynamic_policies", { name: "$$" }),
        "it should be disabled"
      );
    });

    it("it should disable save if identity provider uri length is invalid", () => {
      assert.isFalse(
        disableSave(
          "dynamic_policies",
          {
            name: "frog",
            identity_provider: "fffffff",
          },
          {
            data: {
              data: "test",
            },
            slz: {
              store: {
                configDotJson: {
                  access_groups: { name: "hi", dynamic_policies: [] },
                },
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
  });
  describe("teleport_config", () => {
    it("should return true if bucket name is invalid", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: { cos_bucket_name: "null" },
            keys: [],
          },
          {
            slz: {
              store: {
                cosBuckets: [],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if key name is not found in list", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: { cos_bucket_name: "frog", cos_key_name: "todd" },
            keys: [""],
          },
          {
            slz: {
              store: {
                cosBuckets: [],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });

    it("should return true if only one key (empty string)", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: { cos_bucket_name: "frog" },
            keys: [""],
          },
          {
            slz: {
              store: {
                cosBuckets: [],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if key is invalid", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: { cos_bucket_name: "frog", cos_key_name: "todd" },
            keys: ["", "eh"],
          },
          {
            slz: {
              store: {
                cosBuckets: [],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if no hostname", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: {
              cos_bucket_name: "frog",
              cos_key_name: "todd",
              app_id_key_name: null,
            },
          },
          {
            slz: {
              store: {
                cosBuckets: ["frog"],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should otherwise return enable submit", () => {
      assert.isFalse(
        disableSave(
          "teleport_config",
          {
            teleport_config: {
              cos_bucket_name: "frog",
              cos_key_name: "todd",
              hostname: "ffffffff",
              app_id_key_name: "key name",
            },
          },
          {
            slz: {
              store: {
                cosBuckets: ["frog"],
              },
            },
          }
        ),
        "it should be enabled"
      );
    });
    it("should be disabled when invalid hostname", () => {
      assert.isTrue(
        disableSave(
          "teleport_config",
          {
            teleport_config: {
              hostname: null,
              cos_bucket_name: "frog",
              cos_key_name: "todd",
              app_id_key_name: "key name",
            },
          },
          {
            slz: {
              store: {
                cosBuckets: ["frog"],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("claims_to_roles", () => {
    it("should return true if the email is invalid", () => {
      assert.isTrue(
        disableSave("claims_to_roles", { email: "frog" }),
        "it should be disabled"
      );
    });
    it("should return true if the email is valid and roles empty", () => {
      assert.isTrue(
        disableSave("claims_to_roles", { email: "frog@frog.frog", roles: [] }),
        "it should be disabled"
      );
    });
    it("should return true if the email is valid and roles invalid length", () => {
      assert.isTrue(
        disableSave("claims_to_roles", {
          email: "frog@frog.frog",
          roles: ["mmm"],
        }),
        "it should be disabled"
      );
    });
  });
  describe("transit_gateway", () => {
    it("should return false if disabled", () => {
      assert.isFalse(
        disableSave("transit_gateway", { enable_transit_gateway: false }),
        "it should be enabled"
      );
    });
    it("should return true if tgw enabled with no rg", () => {
      assert.isTrue(
        disableSave(
          "transit_gateway",
          { enable_transit_gateway: true, transit_gateway_resource_group: "" },
          {
            slz: {
              store: {
                resourceGroups: ["what"],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
    it("should return true if tgw enabled with no vpcs", () => {
      assert.isTrue(
        disableSave(
          "transit_gateway",
          {
            enable_transit_gateway: true,
            transit_gateway_resource_group: "what",
            transit_gateway_connections: [],
          },
          {
            slz: {
              store: {
                resourceGroups: ["what"],
              },
            },
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("atracker", () => {
    it("should return true if atracker has invalid resource group", () => {
      assert.isTrue(
        disableSave(
          "atracker",
          { resource_group: "" },
          { slz: { store: { resourceGroups: ["eh"] } } }
        ),
        "it should be disabled"
      );
    });
    it("should return true if atracker has invalid cos bucket", () => {
      assert.isTrue(
        disableSave(
          "atracker",
          { resource_group: "eh", collector_bucket_name: "" },
          { slz: { store: { resourceGroups: ["eh"], cosBuckets: [] } } }
        ),
        "it should be disabled"
      );
    });
    it("should return true if atracker has invalid cos key", () => {
      assert.isTrue(
        disableSave(
          "atracker",
          {
            resource_group: "eh",
            collector_bucket_name: "eh",
            atracker_key: "",
          },
          { slz: { store: { resourceGroups: ["eh"], cosBuckets: ["eh"] } } }
        ),
        "it should be disabled"
      );
    });
  });
  describe("f5_template_data", () => {
    it("should not disable with valid data", () => {
      assert.isFalse(
        disableSave("f5_template_data", {
          license_type: "none",
          template_version: "22",
          template_source: "valid/source",
        }),
        "it should be enabled"
      );
    });
    it("should not disable with empty optional data", () => {
      assert.isFalse(
        disableSave("f5_template_data", { app_id: "" }),
        "it should be enabled"
      );
    });
    it("should disable with empty required data", () => {
      assert.isTrue(
        disableSave("f5_template_data", { template_version: "" }),
        "it should be disabled"
      );
    });
    it("should disable with invalid url", () => {
      assert.isTrue(
        disableSave("f5_template_data", { phone_home_url: "invalid" }),
        "it should be disabled"
      );
    });
    it("should disable with invalid tmos_admin_password", () => {
      assert.isTrue(
        disableSave("f5_template_data", { tmos_admin_password: "invalid" }),
        "it should be disabled"
      );
    });
  });
  describe("iam_account_settings", () => {
    it("should return false if it's fine", () => {
      assert.isFalse(
        disableSave("iam_account_settings", {
          if_match: 2,
          max_sessions_per_identity: 2,
          session_invalidation_in_seconds: 900,
          session_expiration_in_seconds: 900,
          allowed_ip_addresses: "1.2.3.4,1.2.3.4/10",
        }),
        "it should be enabled"
      );
    });
  });
  describe("f5_vsi", () => {
    it("should return true if no ssh keys", () => {
      assert.isTrue(
        disableSave("f5_vsi", { machine_type: "aaaaaa", ssh_keys: [] }),
        "it should be disabled"
      );
    });
  });
  describe("f5_vsi_config", () => {
    it("should return true if no ssh keys", () => {
      assert.isTrue(
        disableSave("f5_vsi_config", { machine_type: "aaaaaa", ssh_keys: [] }),
        "it should be disabled"
      );
    });
  });
});
