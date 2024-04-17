const {
  accessGroupInit,
  appidInit,
  atrackerInit,
  cosInit,
  f5Init,
  iamInit,
  keyManagementInit,
  resourceGroupInit,
  securityGroupInit,
  sshKeyInit,
  teleportInit,
  transitGatewayInit,
  vpcInit,
  vpeInit,
  vpnInit,
  clusterInit,
} = require("../client/src/lib/store");
const {
  newDefaultManagementServer,
  newDefaultWorkloadServer,
  newDefaultManagementCluster,
} = require("../client/src/lib");
const { slzState } = require("../client/src/lib");
const fs = require("fs");
const { carve, prettyJSON } = require("lazy-z");

if (process.argv[2]) {

  if (!fs.existsSync("patterns/" + process.argv[2])){
    fs.mkdirSync("patterns/" + process.argv[2], { recursive: true });
  }
  fs.writeFileSync(
    "patterns/" + process.argv[2] + "/override.json",
    generateOverride(process.argv[2])
  );
} else {
  console.error(
    "No pattern provided. A pattern is required to generate an override."
  );
}

function generateOverride(pattern) {
  let slz = new slzState();
  resourceGroupInit(slz);
  keyManagementInit(slz);
  cosInit(slz);
  vpcInit(slz);
  transitGatewayInit(slz);
  securityGroupInit(slz);
  vpeInit(slz);
  vpnInit(slz);
  accessGroupInit(slz);
  atrackerInit(slz);
  appidInit(slz);
  f5Init(slz);
  iamInit(slz);
  teleportInit(slz);
  clusterInit(slz);

  switch(pattern) {
    case "roks":
      slz.store.configDotJson.key_management.keys.pop();
      slz.store.configDotJson.ssh_keys = [];
      slz.store.configDotJson.vsi = [];
      slz.store.configDotJson.clusters.push(newDefaultManagementCluster());
      break;
    case "vsi":
      slz.store.configDotJson.vsi = [newDefaultManagementServer()];
      slz.store.configDotJson.vsi.push(newDefaultWorkloadServer());
      slz.store.configDotJson.clusters = [];
      carve(
        slz.store.configDotJson.key_management.keys,
        "name",
        "slz-roks-key"
      );
      sshKeyInit(slz);
      break;
    case "vpc":
      slz.store.configDotJson.clusters = [];
      slz.store.configDotJson.key_management.keys.pop();
      slz.store.configDotJson.ssh_keys = [];
      slz.store.configDotJson.vsi = [];
      break;
  }

  return prettyJSON(slz.store.configDotJson);
}
