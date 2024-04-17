import { assert } from "chai";
import { validate }  from "../client/src/lib/validate.js";
import { slzState as slzStore } from "../client/src/lib/state.js";
import overrideJson from "./data-files/override.json" assert { type: "json" };

describe("slzState", () => {
  describe("hardSetConfigDotJson", () => {
    it("should set JSON data if valid", () => {
      let slz = new slzStore();
      slz.setUpdateCallback(() => {});
      slz.hardSetConfigDotJson(overrideJson);
      assert.deepEqual(
        slz.store.configDotJson,
        overrideJson,
        "it should set the store"
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
        "it should set subnet tiers"
      );
    });
  });
  describe("validate", () => {
    it("should call validate with correct data", () => {
      let slz = new slzStore();
      let task = () => {
        validate(slz.store.configDotJson);
      };
      assert.doesNotThrow(task, Error, null, "it should not throw");
    });
  });
  describe("updateUnfoundResourceGroup", () => {
    it("should not update the prefix due to null resource group", () => {
      let slz = new slzStore();
      slz.store.prefix = "foo";
      slz.store.oldPrefix = "slz";
      slz.store.resourceGroups = ["todd"];
      let obj = { resource_group: null };
      slz.updateUnfoundResourceGroup(obj, "resource_group");
      assert.deepEqual(obj.resource_group, null, "it should be slz-test-rg");
    });
  });
  describe("updatePrefix", () => {
    it("should update the prefix of slz and set the old prefix to the previous one", () => {
      let slz = new slzStore();
      slz.store.prefix = "foo";
      slz.store.oldPrefix = "slz";
      slz.setUpdateCallback(() => {});
      slz.updatePrefix("dog");
      assert.deepEqual(slz.store.prefix, "dog", "it should be dog");
      assert.deepEqual(slz.store.oldPrefix, "foo", "it should be foo");
    });
  });
});
