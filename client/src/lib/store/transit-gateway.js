import { contains, containsKeys } from "lazy-z";

/**
 * initialize transit gateway
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function transitGatewayInit(slz) {
  slz.store.configDotJson.enable_transit_gateway = true;
  slz.store.configDotJson.transit_gateway_connections = [
    "management",
    "workload"
  ];
  slz.store.configDotJson.transit_gateway_resource_group = "service-rg";
}

/**
 * transit gateway on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<string>} slz.store.configDotJson.transit_gateway_connections
 * @param {string} slz.store.configDotJson.transit_gateway_resource_group
 */
function transitGatewayOnStoreUpdate(slz) {
  let goodConnections = [];
  if (slz.store.configDotJson.transit_gateway_connections)
    slz.store.configDotJson.transit_gateway_connections.forEach(connection => {
      if (contains(slz.store.vpcList, connection)) {
        goodConnections.push(connection);
      }
    });
  slz.store.configDotJson.transit_gateway_connections = goodConnections;
  if (
    !contains(
      slz.store.resourceGroups,
      slz.store.configDotJson.transit_gateway_resource_group
    )
  )
    slz.store.configDotJson.transit_gateway_resource_group = null;
}

/**
 * transit gateway save
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<string>} slz.store.configDotJson.transit_gateway_connections
 * @param {string} slz.store.configDotJson.transit_gateway_resource_group
 * @param {boolean} slz.store.configDotJson.enable_transit_gateway
 * @param {object} stateData
 * @param {Array<string>} slz.store.configDotJson.transit_gateway_connections
 * @param {string} slz.store.configDotJson.transit_gateway_resource_group
 * @param {boolean} slz.store.configDotJson.enable_transit_gateway
 */
function transitGatewaySave(slz, stateData) {
  slz.store.configDotJson.transit_gateway_resource_group =
    stateData.transit_gateway_resource_group;
  slz.store.configDotJson.transit_gateway_connections =
    stateData.transit_gateway_connections;
  if (containsKeys(stateData, "enable_transit_gateway")) {
    // use contains keys to read from value when `false`
    slz.store.configDotJson.enable_transit_gateway =
      stateData.enable_transit_gateway;
  }
}

export {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewaySave
};
