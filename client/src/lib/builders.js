import pkg from "lazy-z";
const {
  transpose,
  azsort,
  formatCidrBlock
} = pkg;
import { firewallTiers } from "./store/defaults.js";
/**
 * build an encryption key
 * @param {Object} keyParams key management params
 * @param {string} keyParams.name name
 * @param {boolean} keyParams.root_key root_key value
 * @param {string} keyParams.payload payload value
 * @param {string} keyParams.key_ring key_ring value
 * @param {boolean} keyParams.force_delete force_delete value
 * @param {string} keyParams.endpoint endpoint value
 * @param {string} keyParams.iv_value iv_value value
 * @param {string} keyParams.encrypted_nonce encrypted_nonce value
 * @param {number} keyParams.interval_month interval month for policy
 * @returns {Object} encryption key object
 */
function buildNewEncryptionKey(keyParams) {
  let params = keyParams;
  let newKey = {
    name: `new-key`,
    root_key: true,
    payload: null,
    key_ring: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  };
  if (params?.interval_month) {
    newKey.policies.rotation.interval_month = params.interval_month;
    delete params.interval_month;
  }
  transpose(params, newKey);
  return newKey;
}

/**
 * Build a subnet object
 * @param {number} vpcIndex index of vpc in array, used for CIDR calculation
 * @param {string} tierName name of the tier
 * @param {number} tierIndex index of tier in array, used for CIDR calculation
 * @param {string} aclName name of the acl
 * @param {number} zone zone, can be 1,2, or 3
 * @param {boolean} addPublicGateway add public gateway
 * @param {boolean=} isEdgeVpc is edge vpc
 * @returns {Object} subnet object
 */
function buildSubnet(
  vpcIndex,
  tierName,
  tierIndex,
  aclName,
  zone,
  addPublicGateway,
  isEdgeVpc
) {
  // create a subnet based on vpc, tier, index, and zone
  return {
    name: tierName + "-zone-" + zone,
    cidr: formatCidrBlock(vpcIndex, zone, tierIndex, isEdgeVpc),
    acl_name: aclName === null ? null : `${aclName}`,
    public_gateway: addPublicGateway || false
  };
}

/**
 * add the default vsi encryption key
 * @param {slzStateStore} parent state store
 */
function addVsiEncryptionKey(parent) {
  parent.store.configDotJson.key_management.keys.push({
    key_ring: "slz-slz-ring",
    name: "slz-vsi-volume-key",
    root_key: true,
    payload: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  });
}

/**
 * create a new f5 vsi
 * @param {string} pattern pattern name
 * @param {string} zone zone formatted zone-{zone}
 * @param {boolean=} useManagementVpc use management VPC
 * @param {*} params
 * @param {string} params.f5_image_name
 * @param {string} params.resource_group
 * @param {Array<string>} params.ssh_keys
 * @param {string} params.machine_type
 * @returns {Object} f5 vsi object
 */
function newF5Vsi(pattern, zone, useManagementVpc, params) {
  let vpcName = useManagementVpc ? "management" : "edge"; // get vpc
  let tiers = firewallTiers[pattern](); // get tiers
  let secondarySubnetNames = []; // secondary subnet names
  let secondarySecurityGroupNames = []; // secondary sg names

  // for each tier in alphabetical order
  tiers.sort(azsort).forEach(tier => {
    // if a secondary tier
    if (tier !== "f5-management") {
      // add subnet and sg to secondary interface options
      secondarySubnetNames.push(tier + "-" + zone);
      secondarySecurityGroupNames.push({
        group_name: tier + "-sg",
        interface_name: `slz-${vpcName}-${tier}-${zone}`
      });
    }
  });

  // create new vsi
  let vsi = {
    boot_volume_encryption_key_name: "slz-vsi-volume-key",
    domain: "local",
    enable_external_floating_ip: true,
    enable_management_floating_ip: false,
    f5_image_name:
      params?.f5_image_name || "f5-bigip-16-1-2-2-0-0-28-all-1slot",
    hostname: "f5-ve-01",
    machine_type: params?.machine_type || "cx2-4x8",
    name: "f5-" + zone,
    primary_subnet_name: `f5-management-${zone}`,
    resource_group: params?.resource_group || `${vpcName}-rg`,
    secondary_subnet_names: secondarySubnetNames,
    secondary_subnet_security_group_names: secondarySecurityGroupNames,
    security_groups: ["f5-management-sg"],
    ssh_keys: params?.ssh_keys || ["slz-ssh-key"],
    vpc_name: vpcName
  };
  return vsi;
}

/**
 * prevent reference from having invalid data
 * @param {slz} slz
 * @returns cluster instance
 */
function newFormClusterInstance() {
  return {
    cos_name: null,
    entitlement: null,
    kube_type: "",
    kube_version: "",
    operating_system: "",
    machine_type: "",
    kms_config: {
      crk_name: "",
      private_endpoint: true
    },
    name: "",
    resource_group: "",
    subnet_names: [],
    vpc_name: "",
    worker_pools: [],
    workers_per_subnet: 2
  };
}

function newTeleportConfig() {
  let teleportConfig = {
    teleport_license: null,
    https_cert: null,
    https_key: null,
    domain: null,
    cos_bucket_name: null,
    cos_key_name: null,
    teleport_version: null,
    message_of_the_day: null,
    hostname: null,
    app_id_key_name: null,
    claims_to_roles: []
  };
  return teleportConfig;
}

export {
  buildNewEncryptionKey,
  buildSubnet,
  addVsiEncryptionKey,
  newF5Vsi,
  newFormClusterInstance,
  newTeleportConfig
};
