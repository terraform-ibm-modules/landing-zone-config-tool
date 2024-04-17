import { assert } from "chai";
import { slzState as state } from "../client/src/lib/state.js";
import {
  newF5ManagementSg,
  newF5ExternalSg,
  newF5WorkloadSg,
  newF5BastionSg,
  newF5VpeSg,
  defaultSecurityGroups,
} from "../client/src/lib/store/defaults.js";
import edgeDefaults from "./data-files/f5-config.json" assert { type: "json" };
const defaultEdgeVpnAndWaf = edgeDefaults["vpn-and-waf"];
const managementEdgeVpnAndWaf = edgeDefaults["management-vpn-and-waf"];
const defaultEdgeFullTunnel = edgeDefaults["full-tunnel"];
const defaultEdgeWaf = edgeDefaults["waf"];

describe("edge network", () => {
  describe("createEdgeVpc", () => {
    it("should create the default vpn and waf edge vpc and security groups", () => {
      let slz = new state();
      slz.setUpdateCallback(() => {});
      slz.createEdgeVpc("vpn-and-waf");
      assert.deepEqual(
        slz.store.configDotJson.vpcs[0],
        defaultEdgeVpnAndWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        slz.store.configDotJson.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5WorkloadSg(),
          newF5BastionSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default full-tunnel edge vpc and security groups", () => {
      let slz = new state();
      slz.setUpdateCallback(() => {});
      slz.createEdgeVpc("full-tunnel");
      assert.deepEqual(
        slz.store.configDotJson.vpcs[0],
        defaultEdgeFullTunnel,
        "it should return correct vpc"
      );
      assert.deepEqual(
        slz.store.configDotJson.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5BastionSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default waf edge vpc and security groups", () => {
      let slz = new state();
      slz.setUpdateCallback(() => {});
      slz.createEdgeVpc("waf");
      assert.deepEqual(
        slz.store.configDotJson.vpcs[0],
        defaultEdgeWaf,
        "it should return correct vpc"
      );
      assert.deepEqual(
        slz.store.configDotJson.security_groups,
        [
          newF5ManagementSg(),
          newF5ExternalSg(),
          newF5WorkloadSg(),
          newF5VpeSg(),
        ].concat(defaultSecurityGroups()),
        "it should have the correct security groups"
      );
    });
    it("should create the default vpn and waf edge vpc on management", () => {
      let slz = new state();
      slz.setUpdateCallback(() => {});
      slz.createEdgeVpc("vpn-and-waf", true);
      assert.deepEqual(
        slz.store.configDotJson.vpcs[0],
        managementEdgeVpnAndWaf,
        "it should return correct vpc"
      );
    });
  });
});
