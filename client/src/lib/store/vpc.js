import pkg from "lazy-z";
const {
  containsKeys,
  arraySplatIndex,
  revision,
  eachKey,
  carve,
  contains,
  splat,
  transpose,
  eachZone,
  formatCidrBlock,
  buildNetworkingRule,
  numberToZoneList,
  parseIntFromZone
 } = pkg;
import { buildSubnet } from "../builders.js";
import { reservedSubnetNameExp } from "../constants.js";
import {
  newDefaultEdgeAcl,
  newDefaultF5ExternalAcl,
  newF5VpeSg,
  newDefaultVpcs,
  newF5ManagementSg,
  newF5ExternalSg,
  newF5WorkloadSg,
  newF5BastionSg,
  firewallTiers,
  newVpc
} from "./defaults.js";
import { formatNetworkingRule, updateNetworkingRule } from "./utils.js";
import { setUnfoundResourceGroup, pushAndUpdate } from "./store.utils.js";

/**
 * save subnet tier
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs list of vpcs
 * @param {string} slz.store.edge_vpc_prefix
 * @param {Object} stateData
 * @param {string} stateData.networkAcl
 * @param {number} stateData.zones
 * @param {boolean} stateData.addPublicGateway
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {object} componentProps.tier
 * @param {string} componentProps.tier.name tier name
 */
function updateSubnetTier(slz, stateData, componentProps) {
  // set acl to null
  if (stateData.networkAcl === "") stateData.networkAcl = null;
  delete stateData.hide; // delete hidden from state
  delete stateData.showDeleteModal; // remove show delete modal
  let newTierName = componentProps.tier.name,
    oldTierName = componentProps.tier.name,
    vpcName = componentProps.vpc_name, // vpc name
    zones = stateData.zones, // zones
    vpcIndex = arraySplatIndex(
      // vpc index
      slz.store.configDotJson.vpcs,
      "prefix",
      vpcName
    ),
    oldTiers = slz.store.subnetTiers[componentProps.vpc_name], // old subnet tiers;
    newTiers = []; // new subnet tiers
  if (containsKeys(stateData, "name")) {
    newTierName = stateData.name;
  }
  // for each subnet tier
  oldTiers.forEach(tier => {
    // if not being deleted
    if (
      (tier.name === oldTierName && zones !== 0) || // if zones is not 0 and tier name is old name
      tier.name !== oldTierName // or if tiername is different
    ) {
      let staleTierName = tier.name === oldTierName; // tier name is the same
      // if the tier name is the old name, and the old name has changed
      let tierName =
        staleTierName && oldTierName !== newTierName
          ? newTierName // new tier name
          : tier.name; // otherwise old name
      // if the tier name is old name and zones have changed
      let tierZones =
        staleTierName && tier.zones !== zones
          ? zones // new zones
          : tier.zones; // otherwise, old zones
      newTiers.push({
        name: tierName,
        zones: tierZones
      });
    }
  });

  // edit subnets
  new revision(slz.store.configDotJson)
    .child("vpcs", vpcName, "prefix") // get vpc
    .child("subnets") // get subnets
    .then(subnets => {
      // valid zones for subnet tier
      let validZones = zones === 0 ? [] : numberToZoneList(zones);
      // is edge vpc tier
      let isEdgeVpcTier =
        slz.store.edge_vpc_prefix === vpcName &&
        newTierName.match(reservedSubnetNameExp) !== null;
      // for each zone within that subnet
      eachKey(subnets, zone => {
        let zoneSubnets = subnets[zone]; // subnets array
        let zoneSubnetName = `${oldTierName}-${zone}`; // name to search for
        let tierIndex = arraySplatIndex(
          // tier subnet index
          zoneSubnets,
          "name",
          zoneSubnetName
        );
        // if the tier is found and the zone is not valid, remove the subnet from the zone
        if (tierIndex >= 0 && !contains(validZones, zone)) {
          carve(zoneSubnets, "name", zoneSubnetName);
        } else if (tierIndex >= 0 && oldTierName !== newTierName) {
          // if the tier is found and the old tier name is different from the new one
          // change name
          zoneSubnets[tierIndex].name = `${newTierName}-${zone}`;
        } else if (tierIndex === -1 && contains(validZones, zone)) {
          // reserve f5 subnet tiers
          let actualTierIndex = isEdgeVpcTier
            ? [
                "vpn-1",
                "vpn-2",
                "f5-management",
                "f5-external",
                "f5-workload",
                "f5-bastion"
              ].indexOf(newTierName)
            : arraySplatIndex(newTiers, "name", newTierName);
          // if increasing number of zones, add new subnet
          zoneSubnets.push(
            buildSubnet(
              vpcIndex,
              newTierName,
              actualTierIndex,
              stateData?.networkAcl || null,
              parseIntFromZone(zone),
              componentProps.slz.store.configDotJson.vpcs[vpcIndex]
                .use_public_gateways[zone] === false
                ? false
                : stateData.addPublicGateway,
              isEdgeVpcTier
            )
          );
        }

        // if a subnet is not created
        if (tierIndex >= 0 && zones > 0 && contains(validZones, zone)) {
          // optionally change nacl
          if (stateData.networkAcl !== undefined) {
            zoneSubnets[tierIndex].acl_name = stateData.networkAcl;
          }
          // optionally change gateway
          if (
            stateData.addPublicGateway !== undefined &&
            componentProps.slz.store.configDotJson.vpcs[vpcIndex]
              .use_public_gateways[zone]
          ) {
            zoneSubnets[tierIndex].public_gateway = stateData.addPublicGateway;
          }
        }
        // if deleting a tier
        if (zones === 0) {
          let zoneInt = parseIntFromZone(zone);
          zoneSubnets.forEach(subnet => {
            if (
              // do not replace f5 tiers
              !contains(
                [
                  "vpn-1",
                  "vpn-2",
                  "f5-workload",
                  "f5-management",
                  "f5-external",
                  "f5-bastion"
                ],
                subnet.name.replace(/-zone-\d/g, "")
              )
            )
              subnet.cidr = formatCidrBlock(
                vpcIndex,
                zoneInt, // zone number
                zoneSubnets.indexOf(subnet)
              );
          });
        }
      });
    });
  slz.store.subnetTiers[vpcName] = newTiers;
}

/**
 * initialize vpc store
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 */
function vpcInit(slz) {
  slz.store.configDotJson.vpcs = newDefaultVpcs();
  slz.store.subnets = {};
  slz.store.subnetTiers = {
    management: [
      {
        name: "vsi",
        zones: 3
      },
      { name: "vpe", zones: 3 },
      { name: "vpn", zones: 1 }
    ],
    workload: [
      {
        name: "vsi",
        zones: 3
      },
      { name: "vpe", zones: 3 }
    ]
  };
  slz.store.networkAcls = {};
  slz.store.vpcList = ["management", "workload"];
}

/**
 * get cidr order for edge tier
 */
function getCidrOrder() {
  return [
    "vpn-1",
    "vpn-2",
    "f5-management",
    "f5-external",
    "f5-workload",
    "f5-bastion",
    "vpe"
  ];
}

/**
 * create an edge vpc
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {string} pattern name of pattern can be vpn-and-waf, waf, or full-tunnel
 * @param {boolean=} useManagementVpc create edge data on management vpc
 */
function createEdgeVpc(slz, pattern, useManagementVpc) {
  // edge vpc requires address prefixes, to ensure terraform can compile to list
  // address prefixes are added here
  slz.store.configDotJson.vpcs.forEach(network => {
    network.address_prefixes = {
      "zone-1": [],
      "zone-2": [],
      "zone-3": []
    };
  });
  slz.store.edge_vpc_prefix = "edge";
  slz.store.edge_pattern = pattern;
  slz.store.f5_on_management = useManagementVpc || false;
  let edgeTiers = firewallTiers[pattern]();
  let cidrOrder = getCidrOrder();
  let newSecurityGroups = [newF5ManagementSg(), newF5ExternalSg()];

  // add security groups and edit cidr order based on pattern
  if (pattern === "full-tunnel") {
    // delete workload subnet for full-tunnel
    cidrOrder.splice(4, 1);
    // add bastion sg
    newSecurityGroups.push(newF5BastionSg());
  } else if (pattern === "waf") {
    // delete vpn and bastion for waf
    cidrOrder.splice(5, 1);
    cidrOrder.shift();
    cidrOrder.shift();
    // add workload sg
    newSecurityGroups.push(newF5WorkloadSg());
  } else {
    // add workload and bastion
    newSecurityGroups.push(newF5WorkloadSg());
    newSecurityGroups.push(newF5BastionSg());
  }
  // add f5 vpe group
  newSecurityGroups.push(newF5VpeSg());

  // create edge network object
  let newEdgeNetwork = useManagementVpc
    ? slz.store.configDotJson.vpcs[0]
    : {
        classic_access: false,
        default_network_acl_name: null,
        default_routing_table_name: null,
        default_security_group_name: null,
        default_security_group_rules: [],
        flow_logs_bucket_name: null,
        prefix: "edge",
        resource_group: `edge-rg`,
        use_public_gateways: {
          "zone-1": false,
          "zone-2": false,
          "zone-3": false
        },
        subnets: {
          "zone-1": [],
          "zone-2": [],
          "zone-3": []
        },
        network_acls: [newDefaultEdgeAcl(), newDefaultF5ExternalAcl()]
      };

  // set address prefixes
  newEdgeNetwork.address_prefixes = {
    "zone-1": useManagementVpc
      ? ["10.5.0.0/16", "10.10.10.0/16"]
      : ["10.5.0.0/16"],
    "zone-2": useManagementVpc
      ? ["10.6.0.0/16", "10.20.10.0/16"]
      : ["10.6.0.0/16"],
    "zone-3": useManagementVpc
      ? ["10.7.0.0/16", "10.30.10.0/16"]
      : ["10.7.0.0/16"]
  };

  // add edge to vpc
  if (!useManagementVpc) edgeTiers.push("vpe");
  else newEdgeNetwork.network_acls.push(newDefaultF5ExternalAcl());
  // if not waf, add vpn subnets
  if (pattern !== "waf") {
    edgeTiers.push("vpn-1");
    edgeTiers.push("vpn-2");
  }
  // for each tier
  edgeTiers.forEach(tier => {
    // for each zone
    eachZone(3, zone => {
      // add a new subnet
      newEdgeNetwork.subnets[zone].push({
        name: `${tier}-${zone}`, // name
        acl_name:
          tier === "f5-external"
            ? "f5-external-acl"
            : `${useManagementVpc ? "management" : "edge"}-acl`, // acl
        public_gateway: false,
        cidr: `10.${parseIntFromZone(zone) + 4}.${cidrOrder.indexOf(tier) +
          1}0.0/24` // dynamic CIDR block creation
      });
    });
  });

  let edgeTiersWithZones = [];
  edgeTiers.forEach(tier => {
    edgeTiersWithZones.push({ name: tier, zones: 3 });
  });

  // if management vpc
  if (useManagementVpc) {
    // overwrite with new data
    slz.store.configDotJson.vpcs[0] = newEdgeNetwork;
    slz.store.edge_vpc_prefix = slz.store.configDotJson.vpcs[0].prefix;
    // for each security group
    newSecurityGroups.forEach(group => {
      // match vpc name and rg
      group.vpc_name = newEdgeNetwork.prefix;
      group.resource_group = newEdgeNetwork.resource_group;
    });
    let managementVpcTiers = // management tiers
      slz.store.subnetTiers[slz.store.configDotJson.vpcs[0].prefix];
    // add edge tiers to management tiers
    slz.store.subnetTiers[
      slz.store.configDotJson.vpcs[0].prefix
    ] = edgeTiersWithZones.concat(managementVpcTiers);
  } else {
    // add edge rg
    slz.store.configDotJson.resource_groups.push({
      create: true,
      use_prefix: true,
      name: "edge-rg"
    });

    // add to front
    slz.store.configDotJson.vpcs.unshift(newEdgeNetwork);
    slz.store.vpcList.push("edge");
    slz.store.subnetTiers.edge = edgeTiersWithZones;
  }
  // set security groups to new list and then add existing to end
  slz.store.configDotJson.security_groups = newSecurityGroups.concat(
    slz.store.configDotJson.security_groups
  );
  slz.update();
}

/**
 * on store update
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 */
function vpcOnStoreUpdate(slz) {
  // for each network
  slz.store.configDotJson.vpcs.forEach(network => {
    let subnetList = []; // create a new list
    // for each zone
    eachKey(network.subnets, zone => {
      // add the names of the subnets to the list
      subnetList = subnetList.concat(splat(network.subnets[zone], "name"));
    });
    // set subnets object vpc name to list
    slz.store.subnets[network.prefix] = subnetList;
    // set acls object to the list of acls
    slz.store.networkAcls[network.prefix] = splat(network.network_acls, "name");
    if (!contains(slz.store.cosBuckets, network.flow_logs_bucket_name)) {
      network.flow_logs_bucket_name = null;
    }
    setUnfoundResourceGroup(slz, network);
    // set subnets with unfound acl name to null
    eachZone(3, zone => {
      network.subnets[zone].forEach(subnet => {
        if (!contains(slz.store.networkAcls[network.prefix], subnet.acl_name)) {
          subnet.acl_name = null;
        }
        if (network.use_public_gateways[zone] === false) {
          subnet.public_gateway = false;
        }
      });
    });
  });
  slz.store.vpcList = splat(slz.store.configDotJson.vpcs, "prefix");
}

/**
 * update existing vpc
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.subnetTiers tiers
 * @param {string=} slz.store.edge_vpc_prefix edge prefix
 * @param {object} stateData component state dat
 * @param {boolean} stateData.show
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.prefix vpc prefix
 */
function vpcSave(slz, stateData, componentProps) {
  let vpc = stateData;
  delete vpc.show;
  let oldName = componentProps.data.prefix;
  [
    "default_network_acl_name",
    "default_routing_table_name",
    "default_security_group_name",
    "prefix"
  ].forEach(field => {
    if (vpc[field] === "") {
      vpc[field] = null;
    }
  });
  if (vpc.prefix !== oldName) {
    // add to empty array to prevent reference to original object
    slz.store.subnetTiers[stateData.prefix] = [];
    slz.store.subnetTiers[oldName].forEach(tier => {
      slz.store.subnetTiers[vpc.prefix].push(tier);
    });
    delete slz.store.subnetTiers[oldName];
  }
  new revision(slz.store.configDotJson)
    .child("vpcs", oldName, "prefix")
    .update(stateData)
    .then(() => {
      if (
        oldName === slz.store.edge_vpc_prefix &&
        stateData.prefix !== oldName
      ) {
        slz.store.edge_vpc_prefix = stateData.prefix;
      }
    });
}

/**
 * create a new vpc
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store
 * @param {object} slz.store.subnetTiers tiers
 * @param {object} stateData component state data
 */
function vpcCreate(slz, stateData) {
  let vpc = newVpc();
  transpose(stateData, vpc);
  slz.store.subnetTiers[vpc.prefix] = [];
  pushAndUpdate(slz, "vpcs", vpc);
}

/**
 * delete vpc
 * @param {slzStateStore} slz
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {object} slz.store.subnetTiers
 * @param {Object} stateData
 * @param {object} componentProps
 * @param {object} componentProps.data
 * @param {string} componentProps.data.prefix prefix to delete
 */

function vpcDelete(slz, stateData, componentProps) {
  delete slz.store.subnetTiers[componentProps.data.prefix];
  carve(slz.store.configDotJson.vpcs, "prefix", componentProps.data.prefix);
}

/**
 * get subnet zone from name
 * @param {string} name subnet name
 * @return {string} zone name
 */
function subnetZoneFromName(name) {
  return name.replace(/.+(?=zone-\d)/g, "");
}

/**
 * update a subnet in place
 * @param {slzStateStore} slz
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {string} stateData.name name
 * @param {string} stateData.acl_name network acl name
 * @param {object} componentProps
 * @param {object} componentProps.subnet
 * @param {string} componentProps.subnet.name subnet name
 * @param {string} componentProps.prefix vpc name
 */
function subnetSave(slz, stateData, componentProps) {
  let subnetName = componentProps.subnet.name;
  if (stateData.acl_name === "") {
    stateData.acl_name = null;
  }
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.prefix, "prefix")
    .child("subnets")
    .child(subnetZoneFromName(subnetName), subnetName)
    .update(stateData);
}

/**
 * delete a subnet
 * @param {slzStateStore} slz
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {object} componentProps
 * @param {object} componentProps.subnet
 * @param {string} componentProps.subnet.name subnet name
 * @param {string} componentProps.prefix vpc name
 */

function subnetDelete(slz, stateData, componentProps) {
  let subnetName = componentProps.subnet.name;
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.prefix, "prefix")
    .child("subnets")
    .child(subnetZoneFromName(subnetName))
    .deleteArrChild(subnetName);
}

/**
 * update a subnet in place
 * @param {slzStateStore} slz
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {string} stateData.name name
 * @param {object} componentProps
 * @param {string} componentProps.prefix vpc name
 */

function subnetCreate(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.prefix, "prefix")
    .child("subnets")
    .child(subnetZoneFromName(stateData.name))
    .push(stateData);
}

/**
 * delete subnet tier
 * @param {slzStateStore} slz landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function subnetTierDelete(slz, stateData, componentProps) {
  updateSubnetTier(slz, { zones: 0 }, componentProps);
}

/**
 * create a new subnet tier
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.networkAcl
 * @param {boolean} stateData.addPublicGateway
 * @param {number} stateData.zones
 * @param {boolean} stateData.hide
 * @param {object} componentProps props from component form
 * @param {string} componentProps.vpc_name
 */
function subnetTierCreate(slz, stateData, componentProps) {
  let vpcName = componentProps.vpc_name;
  // get index of vpc for CIDR calculation
  let vpcIndex = splat(slz.store.configDotJson.vpcs, "prefix").indexOf(vpcName);
  // for each zone
  for (let i = 0; i < stateData.zones; i++) {
    // add subnet to that zone
    slz.store.configDotJson.vpcs[vpcIndex].subnets[`zone-${i + 1}`].push(
      buildSubnet(
        vpcIndex,
        stateData.name,
        slz.store.subnetTiers[vpcName].length,
        stateData?.networkAcl ? stateData.networkAcl : null,
        i + 1,
        slz.store.configDotJson.vpcs[vpcIndex].use_public_gateways[
          `zone-${i + 1}`
        ] === false
          ? false
          : stateData.addPublicGateway
      )
    );
  }
  // add tier to subnetTiers
  slz.store.subnetTiers[vpcName].push({
    name: stateData.name,
    zones: stateData.zones
  });
}

/**
 * create acl
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {Object} stateData
 * @param {boolean} stateData.add_cluster_rules
 * @param {string} stateData.name
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name vpc name
 */
function naclCreate(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.vpc_name, "prefix")
    .then(data => {
      data.network_acls.push({
        add_cluster_rules: stateData.add_cluster_rules,
        name: stateData.name,
        rules: []
      });
    });
}

/**
 * delete acl
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {Object} stateData
 * @param {object} componentProps
 * @param {string} componentProps.arrayParentName vpc name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name acl old name
 */

function naclDelete(slz, stateData, componentProps) {
  // new revision
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.arrayParentName, "prefix") // get vpc
    .child("network_acls") // get network acl
    .deleteArrChild(componentProps.data.name); // delete acl
}

/**
 * save acl
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {Object} stateData
 * @param {boolean} stateData.add_cluster_rules
 * @param {string} stateData.name
 * @param {object} componentProps
 * @param {string} componentProps.arrayParentName vpc name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name acl old name
 */

function naclSave(slz, stateData, componentProps) {
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.arrayParentName, "prefix")
    .child("network_acls", componentProps.data.name)
    .update(stateData);
}

/**
 * create nacl rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 */
function naclRuleCreate(slz, stateData, componentProps) {
  stateData.inbound = stateData.direction === "inbound" ? true : false;
  stateData.allow = stateData.action === "allow" ? true : false;
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.vpc_name, "prefix")
    .child("network_acls", componentProps.parent_name)
    .child("rules")
    .push(buildNetworkingRule(stateData, true));
}

/**
 * save nacl rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name old rule name
 */
function naclRuleSave(slz, stateData, componentProps) {
  let networkRule = stateData;
  formatNetworkingRule(slz, networkRule, componentProps);
  // new revision
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.vpc_name, "prefix") // get vpc
    .child("network_acls", componentProps.parent_name) // get acls
    .child("rules", componentProps.data.name) // get rule
    .then(data => {
      // update rule
      updateNetworkingRule(true, data, networkRule);
    });
}

/**
 * delete nacl rule
 * @param {slzStateStore} slz landing zone store
 * @param {object} slz.store state store
 * @param {object} slz.store.configDotJson configuration JSON
 * @param {Array<object>} slz.store.configDotJson.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name old rule name
 */

function naclRuleDelete(slz, stateData, componentProps) {
  // new revision
  new revision(slz.store.configDotJson)
    .child("vpcs", componentProps.vpc_name, "prefix") // get vpc name
    .child("network_acls", componentProps.parent_name) // get network acls
    .child("rules") // get rules
    .deleteArrChild(componentProps.data.name); // delete rule
}

export {
  updateSubnetTier,
  vpcInit,
  createEdgeVpc,
  vpcOnStoreUpdate,
  vpcSave,
  vpcCreate,
  vpcDelete,
  subnetSave,
  subnetDelete,
  subnetCreate,
  subnetTierDelete,
  subnetTierCreate,
  naclCreate,
  naclDelete,
  naclSave,
  naclRuleCreate,
  naclRuleSave,
  naclRuleDelete
};
