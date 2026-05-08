import { assert } from "chai";
import { tmosAdminPasswordValidationExp } from "../client/src/lib/constants.js";
import {
  minStringSize,
  validSshKey,
  validName,
  validIpCidr,
  validateRuleData,
  isNotNullOrEmptyString,
  getAllNames,
  duplicateCheck,
  isEmptyOrValidUrl,
  subnetTierHasValueFromSubnets,
  getTierSubnetsFromVpcData,
  validTmosAdminPassword,
  generatePassword,
  getRandomByte,
  getValidAdminPassword
 } from "../client/src/lib/lib-utils.js";
import { initMockWindow } from "./mocks/window.mock.js";

describe("lib utils", () => {
  describe("validName", () => {
    it("should return true if name matches", () => {
      assert.isTrue(validName("good-name"), "it should be true");
    });
    it("should return false if name does not match", () => {
      assert.isFalse(
        validName("55555good-name"),
        "it should be false"
      );
    });
  });
  describe("validSshKey", () => {
    it("should return true if sshKey matches", () => {
      assert.isTrue(
        validSshKey(
          "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT="
        ),
        "it should be true"
      );
    });
    it("should return false if sshKey does not match", () => {
      assert.isFalse(
        validSshKey(
          "ssh-rsAAAAB3NzaC1yc2thisisaninvalidsshkey... test@fakeemail.com"
        ),
        "it should be false"
      );
    });
  });
  describe("minStringSize", () => {
    it("should return true if 6 or more characters", () => {
      assert.isTrue(
        minStringSize("good-name@good.good"),
        "it should be true"
      );
    });
    it("should return false if less than six", () => {
      assert.isFalse(minStringSize("55555"), "it should be false");
    });
  });
  describe("validIpCidr", () => {
    it("should return true if valid", () => {
      assert.isTrue(validIpCidr("1.1.1.1"), "it should be true");
    });
    it("should return false if not valid", () => {
      assert.isFalse(validIpCidr("frog"), "it should be false");
    });
  });
  describe("isNotNullOrEmptyString", () => {
    it("should return true if valid", () => {
      assert.isTrue(
        isNotNullOrEmptyString("1.1.1.1"),
        "it should be true"
      );
    });
    it("should return false if empty string", () => {
      assert.isFalse(isNotNullOrEmptyString(""), "it should be false");
    });
    it("should return false if null", () => {
      assert.isFalse(
        isNotNullOrEmptyString(null),
        "it should be false"
      );
    });
  });
  describe("validateRuleData", () => {
    it("should return true if valid icmp rule", () => {
      assert.isTrue(
        validateRuleData({ type: 1, code: 1 }, true),
        "it should be true"
      );
    });
    it("should return true if valid tcp acl rule with null field", () => {
      assert.isTrue(
        validateRuleData(
          {
            port_min: 1,
            port_max: null,
            source_port_min: null,
            source_port_max: 1,
          },
          false
        ),
        "it should be true"
      );
    });
    it("should return true if valid tcp security group rule with null field", () => {
      assert.isTrue(
        validateRuleData(
          {
            port_min: 1,
            port_max: null,
          },
          false,
          true
        ),
        "it should be true"
      );
    });
    it("should return false if not valid", () => {
      assert.isFalse(
        validateRuleData({ type: 1, code: 100000 }, true),
        "it should be false"
      );
    });
    it("should run the callback if a field is not valid with callback", () => {
      let callbackTest = false;
      let actualData = validateRuleData(
        { type: 1, code: 100000 },
        true,
        false,
        (field) => {
          callbackTest = field;
        }
      );
      assert.isFalse(actualData, "it should be false");
      assert.deepEqual(callbackTest, "code", "it should set callback");
    });
  });
  describe("duplicateCheck", () => {
    let exampleResourceList = ["resource1", "resource2", "resource3"];
    let examplePropNameValue = "test-resource";
    let exampleDuplicateStateNameValue = "resource3";
    let exampleUniqueStateNameValue = "resource4";
    it("should return true if prop value and state value are different & duplicate exists in array", () => {
      assert.isTrue(
        duplicateCheck(
          exampleResourceList,
          examplePropNameValue,
          exampleDuplicateStateNameValue
        ),
        "it should be true"
      );
    });
    it("should return false if prop value and state value are identical", () => {
      assert.isFalse(
        duplicateCheck(
          exampleResourceList,
          examplePropNameValue,
          examplePropNameValue
        ),
        "it should be false"
      );
    });
    it("should return false if prop value and state value are different & duplicate doesn't exist in array", () => {
      assert.isFalse(
        duplicateCheck(
          exampleResourceList,
          examplePropNameValue,
          exampleUniqueStateNameValue
        ),
        "it should be false"
      );
    });
  });
  describe("getAllNames", () => {
    it("should get all vpcs by prefix", () => {
      let expectedData = ["management", "workload"];
      let actualData = getAllNames("vpcs", {
        slz: { store: { vpcList: ["management", "workload"] } },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct list"
      );
    });
    it("should get all network acl names from a vpc in modal", () => {
      let expectedData = ["hi"];
      let actualData = getAllNames("network_acls", {
        vpc_name: "management",
        isModal: true,
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "management",
                  network_acls: [{ name: "hi" }],
                },
              ],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return list of names"
      );
    });
    it("should return all the names of networking rules from a network acl", () => {
      let expectedData = ["hi"];
      let actualData = getAllNames("networking_rule", {
        slz: {
          store: {
            configDotJson: {
              vpcs: [
                {
                  prefix: "management",
                  network_acls: [
                    { name: "management-acl", rules: [{ name: "hi" }] },
                  ],
                },
              ],
            },
          },
        },
        vpc_name: "management",
        parent_name: "management-acl",
        isAclForm: true,
      });
      assert.deepEqual(actualData, expectedData, "it should return rule names");
    });
    it("should return all the names of networking rules from a non-vsi security group", () => {
      let expectedData = ["hi"];
      let actualData = getAllNames("networking_rule", {
        slz: {
          store: {
            configDotJson: {
              security_groups: [
                {
                  name: "management",
                  rules: [{ name: "hi" }],
                },
              ],
            },
          },
        },
        parent_name: "management",
      });
      assert.deepEqual(actualData, expectedData, "it should return rule names");
    });
    it("should return all the names of networking rules from a vsi security group", () => {
      let expectedData = ["hi"];
      let actualData = getAllNames("networking_rule", {
        slz: {
          store: {
            configDotJson: {
              vsi: [
                {
                  name: "management",
                  security_group: {
                    name: "management",
                    rules: [{ name: "hi" }],
                  },
                },
              ],
            },
          },
        },
        parent_name: "management",
        vsiName: "management",
      });
      assert.deepEqual(actualData, expectedData, "it should return rule names");
    });
    it("should return all the names of networking rules from a teleport vsi security group", () => {
      let expectedData = ["hi"];
      let actualData = getAllNames("networking_rule", {
        slz: {
          store: {
            configDotJson: {
              teleport_vsi: [
                {
                  name: "management",
                  security_group: {
                    name: "management",
                    rules: [{ name: "hi" }],
                  },
                },
              ],
            },
          },
        },
        parent_name: "management",
        vsiName: "management",
        isTeleport: true,
      });
      assert.deepEqual(actualData, expectedData, "it should return rule names");
    });
    it("should return all the security group names from security groups, vsi, and teleport vsi", () => {
      let expectedData = ["hello", "hey", "hi"];
      let actualData = getAllNames("security_groups", {
        slz: {
          store: {
            configDotJson: {
              vsi: [
                {
                  security_group: {
                    name: "hey",
                  },
                },
              ],
              teleport_vsi: [
                {
                  security_group: {
                    name: "hi",
                  },
                },
              ],
              security_groups: [{ name: "hello" }],
            },
          },
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return all security groups"
      );
    });
  });
  describe("subnetTierHasValueFromSubnets", () => {
    it("should return true if more than two subnets have pgw enabled", () => {
      assert.isTrue(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          public_gateway: true,
                        },
                      ],
                      "zone-3": [
                        {
                          name: "frog-zone-2",
                          public_gateway: true,
                        },
                      ],
                      "zone-3": [
                        {
                          name: "frog-zone-2",
                          public_gateway: true,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "public_gateway"
        ),
        "it should be true"
      );
    });
    it("should return true if one has gw but only one in subnet tier", () => {
      assert.isTrue(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          public_gateway: true,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "public_gateway"
        ),
        "it should be true"
      );
    });
    it("should return false if two subnets with different values for pgw", () => {
      assert.isFalse(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          public_gateway: true,
                        },
                      ],
                      "zone-2": [
                        {
                          name: "frog-zone-2",
                          public_gateway: false,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "public_gateway"
        ),
        "it should be true"
      );
    });
    it("should return true if more than two subnets have same acl_name", () => {
      assert.isTrue(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          acl_name: true,
                        },
                      ],
                      "zone-3": [
                        {
                          name: "frog-zone-2",
                          acl_name: true,
                        },
                      ],
                      "zone-3": [
                        {
                          name: "frog-zone-2",
                          acl_name: true,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "acl_name"
        ),
        "it should be true"
      );
    });
    it("should return true if one has acl_name but only one in subnet tier", () => {
      assert.isTrue(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          acl_name: true,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "acl_name"
        ),
        "it should be true"
      );
    });
    it("should return empty string when tier has two subnets each with a different acl name", () => {
      assert.deepEqual(
        subnetTierHasValueFromSubnets(
          {
            store: {
              configDotJson: {
                vpcs: [
                  {
                    prefix: "ut",
                    subnets: {
                      "zone-1": [
                        {
                          name: "frog-zone-1",
                          acl_name: true,
                        },
                      ],
                      "zone-2": [
                        {
                          name: "frog-zone-1",
                          acl_name: false,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          "ut",
          "frog",
          "acl_name"
        ),
        "",
        "it should be true"
      );
    });
  });
  describe("getTierSubnetsFromVpcData", () => {
    it("should return list of subnet tiers for titles", () => {
      assert.deepEqual(
        getTierSubnetsFromVpcData(
          {
            subnets: {
              "zone-1": [
                {
                  name: "hi-zone-1",
                },
                {
                  name: "frog-zone-1",
                },
              ],
              "zone-2": [],
              "zone-3": [],
            },
          },
          "hi"
        ),
        [{ name: "hi-zone-1" }],
        "it should return list of names"
      );
    });
  });
  describe("validTmosAdminPassword", () => {
    it("should return true if empty or null", () => {
      assert.isTrue(
        validTmosAdminPassword("") &&
          validTmosAdminPassword(null),
        "it should be true"
      );
    });
    it("should return true if valid password", () => {
      assert.isTrue(
        validTmosAdminPassword("abcdefabcdefABC1"),
        "it should be true"
      );
    });
  });
  describe("isEmptyOrValidUrl", () => {
    it("should return true if empty or null", () => {
      assert.isTrue(
        isEmptyOrValidUrl("") && isEmptyOrValidUrl(null),
        "should be true"
      );
    });
    it("should return false if invalid url", () => {
      assert.isFalse(
        isEmptyOrValidUrl("not-a-url"),
        "should be false"
      );
    });
    it("should return true if valid url", () => {
      assert.isTrue(
        isEmptyOrValidUrl(
          "https://declarations.s3.us-east.cloud-object-storage.appdomain.cloud/do_declaration.json"
        ),
        "should be true"
      );
    });
  });
  describe("getRandomByte", () => {
    beforeEach(() => {
      initMockWindow();
    });
    it("should return a number", () => {
      assert.isFalse(isNaN(getRandomByte()));
    });
    it("should return a number between 0 and 255 (inclusive)", () => {
      let result = getRandomByte();
      assert.isTrue(result >= 0 && result <= 255);
    });
  });
  describe("generatePassword", () => {
    beforeEach(() => {
      initMockWindow();
    });
    it("should return a string", () => {
      assert.strictEqual(typeof generatePassword(15), "string");
    });
    it("should return a string with the correct length", () => {
      const password = generatePassword(15);
      assert.strictEqual(password.length, 15);
    });
    it("should return a string that only contains characters in the specified charset", () => {
      const password = generatePassword(15);
      assert.isTrue(/[a-zA-Z0-9_\-+!$%^&*#]/.test(password));
    });
  });
  describe("getValidAdminPassword", () => {
    beforeEach(() => {
      initMockWindow();
    });
    it("should return a string that fits the requirements of the validation expression", () => {
      const password = getValidAdminPassword(15);
      assert(tmosAdminPasswordValidationExp.test(password));
    });
    it("should return empty string if invalid password generated 5 times", () => {
      const password = getValidAdminPassword(10); // not long enough
      assert.strictEqual(password, "");
    });
  });
});
