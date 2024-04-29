import { assert } from "chai";
import {
  hasInvalidName,
  iamAccountSettingsInvalidRange,
  iamAccountSettingsInvalidIpString,
  hasInvalidRuleProtocol,
  hasInvalidCidrOrAddress,
  hasDuplicateName,
  iamAccountSettingsInvalidNumber,
  isInvalidPrefix,
} from "../client/src/lib/error-text-utils.js";

describe("error text utils", () => {
  describe("hasInvalidName", () => {
    it("should return the error text and validation", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Invalid Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/`,
      };
      let actualData = hasInvalidName("resource_groups", "44444");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
    it("should return the error text and validation when use data and illegal characters", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Invalid name`,
      };
      let actualData = hasInvalidName(
        "resource_groups",
        "$$$$",
        {
          slz: {
            store: {
              configDotJson: {
                resource_groups: [],
              },
            },
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
    it("should return the error text and validation when use data and ends in hyphen", () => {
      let expectedData = {
        invalid: false,
        invalidText: `Invalid Name. No name provided.`,
      };
      let actualData = hasInvalidName(
        "resource_groups",
        "service-rg-",
        {
          slz: {
            store: {
              configDotJson: {
                resource_groups: [],
              },
            },
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
    it("should return the error text and validation when all caps name", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Invalid Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/`,
      };
      let actualData = hasInvalidName("resource_groups", "MMMMMM");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct text"
      );
    });
    it("should not return invalid if using data and not duplicate", () => {
      let expectedData = {
        invalid: false,
        invalidText: `Invalid Name. No name provided.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "resource_groups",
          "MMM",
          {
            slz: {
              store: { configDotJson: { resource_groups: [{ name: "hi" }] } },
            },
            data: {
              name: "hi",
            },
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if using data and duplicate", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "resource_groups",
          "MMM",
          {
            slz: {
              store: {
                configDotJson: {
                  resource_groups: [{ name: "oh" }, { name: "MMM" }],
                },
              },
            },
            data: {
              name: "oh",
            },
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if duplicate vpc", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "vpcs",
          "MMM",
          {
            slz: {
              store: {
                vpcList: ["oh", "MMM"],
              },
            },
            data: {
              prefix: "f",
            },
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if duplicate vpc in modal", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "vpcs",
          "MMM",
          {
            slz: {
              store: {
                vpcList: ["oh", "MMM"],
              },
            },
            isModal: true,
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if duplicate network rule name", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "networking_rule",
          "MMM",
          {
            slz: {
              store: {
                configDotJson: {
                  security_groups: [
                    {
                      name: "hi",
                      rules: [
                        {
                          name: "MMMM",
                        },
                        {
                          name: "MMM",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            data: {
              name: "fdd",
            },
            parent_name: "hi",
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if duplicate network rule name in vsi security group", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "networking_rule",
          "MMM",
          {
            slz: {
              store: {
                configDotJson: {
                  vsi: [
                    {
                      name: "hi",
                      security_group: {
                        rules: [
                          {
                            name: "MMMM",
                          },
                          {
                            name: "MMM",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            data: {
              security_group: {
                name: "mmm",
              },
            },
            vsiName: "hi",
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });
    it("should return invalid if duplicate security group name in vsi security group", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name MMM already in use.`,
      };
      assert.deepEqual(
        hasInvalidName(
          "security_groups",
          "MMM",
          {
            slz: {
              store: {
                configDotJson: {
                  teleport_vsi: [
                    {
                      security_group: {
                        name: "MMM",
                      },
                    },
                  ],
                  vsi: [],
                  security_groups: [],
                },
              },
            },
            data: {
              name: "f",
              security_group: {
                name: "f",
              },
            },
            addText: "Create a Virtual Server Instance Deployment",
          },
          true
        ),
        expectedData,
        "it should return expected data"
      );
    });

    it("should return true if access group has invalid name", () => {
      let expectedData = {
        invalid: true,
        invalidText:
          "Invalid Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/",
      };
      let actualData = hasInvalidName("access_groups", "$$$$", {});
      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });
    it("should return true if access group policy has invalid name", () => {
      let expectedData = {
        invalid: true,
        invalidText:
          "Invalid Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/",
      };
      let actualData = hasInvalidName("policies", "$$$$", {});
      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });
    it("should return true if access group dynamic policy has invalid name", () => {
      let expectedData = {
        invalid: true,
        invalidText:
          "Invalid Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]/",
      };
      let actualData = hasInvalidName("dynamic_policies", "$$$$", {});
      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });

    it("should return true if access group has duplicate name", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name frog already in use.`,
      };
      let actualData = hasInvalidName("access_groups", "frog", {
        slz: {
          store: {
            configDotJson: {
              access_groups: [
                {
                  name: "frog",
                },
              ],
            },
          },
        },
      });

      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });
    it("should return true if access group policy has duplicate name", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name frog already in use.`,
      };
      let actualData = hasInvalidName("policies", "frog", {
        slz: {
          store: {
            configDotJson: {
              access_groups: {
                name: "hi",
                policies: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
        },
      });

      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });
    it("should return true if access group dynamic policy has duplicate name", () => {
      let expectedData = {
        invalid: true,
        invalidText: `Name frog already in use.`,
      };
      let actualData = hasInvalidName("dynamic_policies", "frog", {
        slz: {
          store: {
            configDotJson: {
              access_groups: {
                name: "hi",
                dynamic_policies: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
        },
      });

      assert.deepEqual(
        actualData,
        expectedData,
        "It should return expected data"
      );
    });
  });
  describe("hasDuplicateName", () => {
    it("should return the correct duplicate name function for teleport in modal", () => {
      assert.isFalse(
        hasDuplicateName("security_groups", "bastion-vsi-sg", {
          isTeleport: true,
          data: {
            security_group: null,
          },
          slz: {
            store: {
              configDotJson: {
                security_groups: [],
                vsi: [],
                teleport_vsi: [],
              },
            },
          },
        }),
        "it should be false"
      );
    });
  });
  describe("iamAccountSettingsInvalidRange", () => {
    it("should return true invalid object when value is not within the range", () => {
      let testData = {
        invalid: true,
        invalidText: "Must be a whole number between 900 and 7200",
      };
      let actualData = iamAccountSettingsInvalidRange(750, 900, 7200);
      assert.deepEqual(actualData, testData, "it should be invalid");
    });
    it("should return invalid object when value is not a whole number", () => {
      let testData = {
        invalid: true,
        invalidText: "Must be a whole number between 900 and 7200",
      };
      let actualData = iamAccountSettingsInvalidRange(920.5, 900, 7200);
      assert.deepEqual(actualData, testData, "it should be invalid");
    });
    it("should not return an invalid object when value is null or empty string", () => {
      let testData = {
        invalid: false,
        invalidText: "Must be a whole number between 900 and 7200",
      };
      let actualData = iamAccountSettingsInvalidRange("", 900, 7200);
      assert.deepEqual(actualData, testData, "it should not be invalid");
    });
  });
  describe("iamAccountSettingsInvalidIpString", () => {
    it("should return true invalid object when string is invalid", () => {
      let testData = {
        invalid: true,
        invalidText:
          "Please enter a comma separated list of IP addresses or CIDR blocks",
      };
      let actualData = iamAccountSettingsInvalidIpString("1.1.1");
      assert.deepEqual(actualData, testData, "it should be invalid");
    });
    it("should return false invalid object when string is not invalid", () => {
      let testData = {
        invalid: false,
        invalidText:
          "Please enter a comma separated list of IP addresses or CIDR blocks",
      };
      let actualData = iamAccountSettingsInvalidIpString(
        "1.1.1.1,10.10.10.10/16"
      );
      assert.deepEqual(actualData, testData, "it should not be invalid");
    });
  });
  describe("iamAccountSettingsInvalidNumber", () => {
    it("should return an invalid object when number is less than zero", () => {
      let testData = {
        invalid: true,
        invalidText: "Must be a whole number greater than 0",
      };
      let actualData = iamAccountSettingsInvalidNumber(-1);
      assert.deepEqual(actualData, testData, "it should be invalid");
    });
    it("should return an invalid object when number is not a whole number", () => {
      let testData = {
        invalid: true,
        invalidText: "Must be a whole number greater than 0",
      };
      let actualData = iamAccountSettingsInvalidNumber(17.7);
      assert.deepEqual(actualData, testData, "it should be invalid");
    });
    it("should not return an invalid object when number is null or empty string", () => {
      let testData = {
        invalid: false,
        invalidText: "Must be a whole number greater than 0",
      };
      let actualData = iamAccountSettingsInvalidNumber("");
      assert.deepEqual(actualData, testData, "it should not be invalid");
    });
  });
  describe("hasInvalidRuleProtocol", () => {
    it("should return false if the value is null", () => {
      assert.isFalse(hasInvalidRuleProtocol("type", null).invalid);
    });
    it("should return false if the value is empty string", () => {
      assert.isFalse(hasInvalidRuleProtocol("type", "").invalid);
    });
    it("should return correct invalid text when name is type and port invalid", () => {
      assert.deepEqual(hasInvalidRuleProtocol("type", 2556), {
        invalid: true,
        invalidText: "0 to 254",
      });
    });
    it("should return the correct invalid text if name is code and port invalid", () => {
      assert.deepEqual(hasInvalidRuleProtocol("code", 2556), {
        invalid: true,
        invalidText: "0 to 255",
      });
    });
    it("should return the correct invalid text if name is not type or code", () => {
      assert.deepEqual(hasInvalidRuleProtocol("port_min", 233445), {
        invalid: true,
        invalidText: "1 to 65535",
      });
    });
    it("should return invalid false when valid", () => {
      assert.deepEqual(hasInvalidRuleProtocol("code", 23), {
        invalid: false,
        invalidText: "",
      });
    });
  });
  describe("hasInvalidCidrOrAddress", () => {
    it("should return false if valid cidr", () =>
      assert.isFalse(hasInvalidCidrOrAddress("2.2.2.2/16").invalid));
    it("should return false if valid address", () =>
      assert.isFalse(hasInvalidCidrOrAddress("2.2.2.2").invalid));
    it("should return true with invalid text if invalid", () =>
      assert.deepEqual(hasInvalidCidrOrAddress("2"), {
        invalid: true,
        invalidText: "Please provide a valid IPV4 IP address or CIDR notation.",
      }));
  });
  describe("isInvalidPrefix", () => {
    it("should return true if does not match /[a-z][a-z0-9-]*[a-z0-9]/", () =>
      assert.isTrue(isInvalidPrefix("hi=").invalid));
    it("should return true if does not match /[a-z][a-z0-9-]*[a-z0-9]/", () =>
      assert.isTrue(isInvalidPrefix("24hi").invalid));
    it("should return false if does match /[a-z][a-z0-9-]*[a-z0-9]/", () =>
      assert.isFalse(isInvalidPrefix("slz-test-prefix").invalid));
    it("should return true if the prefix is uppercase", () =>
      assert.isTrue(isInvalidPrefix("Slz").invalid));
    it("should return true if the prefix starts with _", () =>
      assert.isTrue(isInvalidPrefix("_").invalid));
    it("should return true if the prefix starts with /", () =>
      assert.isTrue(isInvalidPrefix("/").invalid));
    it("should return true if the prefix starts with [", () =>
      assert.isTrue(isInvalidPrefix("[").invalid));
    it("should return true if the prefix starts with ]", () =>
      assert.isTrue(isInvalidPrefix("[").invalid));
    it("should return invalidText when invalid", () =>
      assert.deepEqual(
        isInvalidPrefix("=").invalidText,
        "Invalid prefix. Must match the regular expression: /[a-z][a-z0-9-]*[a-z0-9]/",
        "it should return correct text"
      ));
  });
});
