import { assert } from "chai";
import overrideWithEdge from "./data-files/override-with-edge.json" assert { type: "json" };
import {
  cidrBlocksOverlap,
  updateNetworkingRule,
  validSubnetName,
  buildSubnetTiers,
  isNotInitialized,
  notUnset,
  checkNullorEmptyString,
  prependEmptyStringToArrayOnNullOrEmptyString,
  defaultToEmptyStringIfValueNull,
  defaultToEmptyStringIfNullString,
} from "../client/src/lib/store/utils.js";
import { flatten } from "lazy-z";

describe("utils", () => {
  describe("flatten", () => {
    it("should return a flattened list of arrays", () => {
      let testData = [
        "one",
        ["two"],
        [["three", "four"]],
        [[["five", "six", [["seven"]]]]],
      ];
      let expectedData = [
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
      ];
      let actualData = flatten(testData);
      assert.deepEqual(actualData, expectedData, "it should flatten the array");
    });
  });
  describe("cidrBlocksOverlap", () => {
    it("should return true to the overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "192.168.0.1/18";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
    it("should return true since they are the same cidr blocks", () => {
      let testCidr = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidr, testCidr);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "10.0.0.0/16";
      let testCidrB = "192.168.0.1/24";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
  });
  describe("updateNetworkingRule", () => {
    it("should set only updated port value", () => {
      let expectedData = {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "inbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        icmp: { type: null, code: null },
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
      };
      let testData = {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "inbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        icmp: {
          type: "hi",
          code: "12",
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
      };
      updateNetworkingRule(true, testData, {
        ruleProtocol: "tcp",
        rule: { port_max: 8080 },
      });
      assert.deepEqual(testData, expectedData, "it should");
    });
  });
  describe("validSubnetName", () => {
    it("should return false if length is < 1", () => {
      assert.isFalse(validSubnetName(""), "it should be false");
    });
    it("should return false if zone is in the name", () => {
      assert.isFalse(validSubnetName("zone-zone-zone"), "it should be false");
    });
    it("should return false if it matches an f5 subnet name is in the name", () => {
      assert.isFalse(validSubnetName("vpn-1"), "it should be false");
    });
    it("should return true if name is otherwise valid", () => {
      assert.isTrue(validSubnetName("good-name"), "it should be true");
    });
  });
  describe("buildSubnetTiers", () => {
    it("should get subnet tiers from management vpc", () => {
      let actualData = buildSubnetTiers(overrideWithEdge.vpcs[1]);
      assert.deepEqual(
        actualData,
        [
          {
            name: "vsi",
            zones: 3,
          },
          {
            name: "vpe",
            zones: 3,
          },
          {
            name: "vpn",
            zones: 1,
          },
        ],
        "it should get subnet tiers"
      );
    });
    it("should ignore subnets that do not match naming convention", () => {
      let actualData = buildSubnetTiers({
        subnets: {
          "zone-1": [],
          "zone-2": [],
          "zone-3": [
            {
              name: "bad-subnet-name",
            },
          ],
        },
      });
      assert.deepEqual(actualData, [], "it should return empty array");
    });
  });
  describe("isNotInitialized", () => {
    it("should return true if a key is not found", () => {
      let testData = {
        store: {
          configDotJson: {},
        },
      };
      assert.isTrue(
        isNotInitialized(testData, "todd"),
        "todd should not be there"
      );
    });
    it("should return false if a key is found", () => {
      let testData = {
        store: {
          configDotJson: {
            todd: true,
          },
        },
      };
      assert.isFalse(
        isNotInitialized(testData, "todd"),
        "todd should not be there"
      );
    });
  });
  describe("notUnset", () => {
    it("should return true if value is not null or NOT_SET", () => {
      assert.isTrue(notUnset(3));
    });
    it("should return false when value is null", () => {
      assert.isFalse(notUnset(null));
    });
    it("should return false when value is NOT_SET", () => {
      assert.isFalse(notUnset("NOT_SET"));
    });
  });
  describe("checkNullorEmptyString", () => {
    it("should return true if string input is empty", () => {
      assert.isTrue(checkNullorEmptyString(""), "it should be true");
    });
    it("should return true if input is null", () => {
      assert.isTrue(checkNullorEmptyString(null), "it should be true");
    });
    it("should return false otherwise", () => {
      assert.isFalse(checkNullorEmptyString("test"), "it should be false");
    });
  });
  describe("prependEmptyStringToArrayOnNullOrEmptyString", () => {
    it("should return array with empty string prepended if value is null", () => {
      assert.deepEqual(
        prependEmptyStringToArrayOnNullOrEmptyString(null, ["hi"]),
        ["", "hi"],
        "it should prepend empty string"
      );
    });
    it("should return array if value is not null", () => {
      assert.deepEqual(
        prependEmptyStringToArrayOnNullOrEmptyString("hm", ["hi"]),
        ["hi"],
        "it should not prepend empty string"
      );
    });
  });
  describe("defaultToEmptyStringIfValueNull", () => {
    it("should return empty string if value is null", () => {
      assert.deepEqual(
        defaultToEmptyStringIfValueNull(null),
        "",
        "it should return empty string"
      );
    });
    it("should return value if not null", () => {
      assert.deepEqual(
        defaultToEmptyStringIfValueNull("hello"),
        "hello",
        "it should return value"
      );
    });
  });
  describe("defaultToEmptyStringIfNullString", () => {
    it("should return empty string if value is null string", () => {
      assert.deepEqual(
        defaultToEmptyStringIfNullString("null"),
        "",
        "it should return empty string"
      );
    });
    it("should return value if value is not null string", () => {
      assert.deepEqual(
        defaultToEmptyStringIfNullString("frog"),
        "frog",
        "it should return value"
      );
    });
  });
});
