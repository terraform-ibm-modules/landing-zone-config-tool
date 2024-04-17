import { contains } from "lazy-z";
import { lazyZstate } from "lazy-z/lib/store.js";
import { validate } from "./validate.js";
import { buildSubnetTiers } from "./store/utils.js";
import {
  accessGroupInit,
  accessGroupOnStoreUpdate,
  accessGroupCreate,
  accessGroupSave,
  accessGroupDelete,
  accessGroupPolicyCreate,
  accessGroupPolicySave,
  accessGroupPolicyDelete,
  accessGroupDynamicPolicyCreate,
  accessGroupDynamicPolicySave,
  accessGroupDynamicPolicyDelete
} from "./store/access-groups.js";
import {
  clusterInit,
  clusterOnStoreUpdate,
  clusterCreate,
  clusterSave,
  clusterDelete,
  clusterWorkerPoolCreate,
  clusterWorkerPoolSave,
  clusterWorkerPoolDelete
} from "./store/clusters.js";
import {
  f5Init,
  f5OnStoreUpdate,
  f5TemplateSave,
  f5VsiCreate,
  f5VsiSave,
  f5InstanceSave
} from "./store/f5.js";
import {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  kmsKeyCreate,
  kmsKeyDelete,
  kmsKeySave
} from "./store/key-management.js";
import {
  appidInit,
  appidOnStoreUpdate,
  appidSave
} from "./store/appid.js";
import {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave
} from "./store/atracker.js";
import {  iamInit, iamSave } from "./store/iam.js";
import {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
} from "./store/resource-groups.js";
import {
  cosInit,
  cosOnStoreUpdate,
  cosCreate,
  cosSave,
  cosDelete,
  cosBucketCreate,
  cosBucketSave,
  cosBucketDelete,
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete
} from "./store/cos.js";
import {
  secretsManagerInit,
  secretsManagerOnStoreUpdate,
  secretsManagerSave
} from "./store/secrets-manager.js";
import {
  securityGroupInit,
  securityGroupCreate,
  securityGroupDelete,
  securityGroupRulesCreate,
  securityGroupRulesSave,
  securityGroupRulesDelete,
  securityGroupOnStoreUpdate,
  securityGroupSave
} from "./store/security-groups.js";
import {
  sshKeyInit,
  sshKeyOnStoreUpdate,
  sshKeyCreate,
  sshKeySave,
  sshKeyDelete
} from "./store/ssh-keys.js";
import {
  vsiInit,
  vsiCreate,
  vsiOnStoreUpdate,
  vsiSave,
  vsiDelete,
  vsiSecurityGroupSave,
  vsiSecurityGroupRuleCreate,
  vsiSecurityGroupRuleSave,
  vsiSecurityGroupRuleDelete
} from "./store/vsi.js";
import {
  teleportInit,
  teleportOnStoreUpdate,
  teleportSave,
  teleportClaimsToRolesCreate,
  teleportClaimsToRolesSave,
  teleportClaimsToRolesDelete
} from "./store/teleport.js";
import {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewaySave
} from "./store/transit-gateway.js";
import {
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
} from "./store/vpc.js";
import {
  vpnInit,
  vpnOnStoreUpdate,
  vpnCreate,
  vpnSave,
  vpnDelete
} from "./store/vpn.js";
import {
  vpeInit,
  vpeOnStoreUpdate,
  vpeCreate,
  vpeSave,
  vpeDelete
} from "./store/vpe.js";

const slzState = function() {
  let slzStore = new lazyZstate({
    _defaults: {
      configDotJson: {
        wait_till: "IngressReady",
        network_cidr: "10.0.0.0/8"
      },
      prefix: "slz",
      cosBuckets: [],
      cosKeys: [],
      enableTeleport: false,
      footerOpen: true,
      hideJson: true
    },
    _no_default: ["oldPrefix"]
  });
  /**
   * update prefix
   * @param {string} prefix prefix
   */
  slzStore.updatePrefix = function(prefix) {
    slzStore.store.oldPrefix = slzStore.store.prefix;
    slzStore.store.prefix = prefix;
    slzStore.update();
  };

  /**
   * update unfound value from store
   * @param {string} listName name of the list within the store
   * @param {Object} obj arbitrary object
   * @param {string} field name of the field on the object to update
   */
  slzStore.updateUnfound = function(listName, obj, field) {
    if (!contains(slzStore.store[listName], obj[field])) {
      obj[field] = null;
    }
  };

  /**
   * update the resourceGroup field for an object
   * @param {Object} obj arbitrary object
   * @param {string=} field name of the field to update default to `resource_group`
   */
  slzStore.updateUnfoundResourceGroup = function(obj, field) {
    let rgField = field || "resource_group";
    slzStore.updateUnfound("resourceGroups", obj, rgField);
  };

  /**
   * hard set config dot json in state store
   * @param {Object} configDotJson slz json configuration object
   */
  slzStore.hardSetConfigDotJson = configDotJson => {
    validate(configDotJson);
    let subnetTiers = {};
    slzStore.store.configDotJson = configDotJson;
    slzStore.store.configDotJson.vpcs.forEach(network => {
      subnetTiers[network.prefix] = buildSubnetTiers(network);
    });
    slzStore.store.subnetTiers = subnetTiers;
    slzStore.store.pattern = "custom";
    slzStore.update();
  };

  slzStore.createEdgeVpc = function(pattern, managementVpc) {
    createEdgeVpc(slzStore, pattern, managementVpc);
  };

  // all components should check resource groups first
  slzStore.newField("resource_groups", {
    init: resourceGroupInit,
    onStoreUpdate: resourceGroupOnStoreUpdate,
    create: resourceGroupCreate,
    save: resourceGroupSave,
    delete: resourceGroupDelete
  });

  // components must check for key management second
  slzStore.newField("key_management", {
    init: keyManagementInit,
    onStoreUpdate: keyManagementOnStoreUpdate,
    save: keyManagementSave,
    subComponents: {
      keys: {
        create: kmsKeyCreate,
        delete: kmsKeyDelete,
        save: kmsKeySave
      }
    }
  });

  // next, update cos
  slzStore.newField("cos", {
    init: cosInit,
    onStoreUpdate: cosOnStoreUpdate,
    create: cosCreate,
    save: cosSave,
    delete: cosDelete,
    subComponents: {
      buckets: {
        create: cosBucketCreate,
        save: cosBucketSave,
        delete: cosBucketDelete
      },
      keys: {
        create: cosKeyCreate,
        save: cosKeySave,
        delete: cosKeyDelete
      }
    }
  });

  slzStore.newField("vpcs", {
    init: vpcInit,
    onStoreUpdate: vpcOnStoreUpdate,
    create: vpcCreate,
    save: vpcSave,
    delete: vpcDelete,
    subComponents: {
      network_acls: {
        create: naclCreate,
        save: naclSave,
        delete: naclDelete,
        subComponents: {
          rules: {
            create: naclRuleCreate,
            save: naclRuleSave,
            delete: naclRuleDelete
          }
        }
      },
      subnets: {
        create: subnetCreate,
        save: subnetSave,
        delete: subnetDelete
      },
      subnetTiers: {
        create: subnetTierCreate,
        save: updateSubnetTier,
        delete: subnetTierDelete
      }
    }
  });

  slzStore.newField("access_groups", {
    init: accessGroupInit,
    onStoreUpdate: accessGroupOnStoreUpdate,
    create: accessGroupCreate,
    save: accessGroupSave,
    delete: accessGroupDelete,
    subComponents: {
      policies: {
        create: accessGroupPolicyCreate,
        save: accessGroupPolicySave,
        delete: accessGroupPolicyDelete
      },
      dynamic_policies: {
        create: accessGroupDynamicPolicyCreate,
        save: accessGroupDynamicPolicySave,
        delete: accessGroupDynamicPolicyDelete
      }
    }
  });

  slzStore.newField("atracker", {
    init: atrackerInit,
    onStoreUpdate: atrackerOnStoreUpdate,
    save: atrackerSave
  });

  slzStore.newField("appid", {
    init: appidInit,
    onStoreUpdate: appidOnStoreUpdate,
    save: appidSave
  });

  slzStore.newField("clusters", {
    init: clusterInit,
    onStoreUpdate: clusterOnStoreUpdate,
    create: clusterCreate,
    save: clusterSave,
    delete: clusterDelete,
    subComponents: {
      worker_pools: {
        create: clusterWorkerPoolCreate,
        save: clusterWorkerPoolSave,
        delete: clusterWorkerPoolDelete
      }
    }
  });

  slzStore.newField("f5", {
    init: f5Init,
    onStoreUpdate: f5OnStoreUpdate,
    subComponents: {
      instance: {
        save: f5InstanceSave
      },
      template: {
        save: f5TemplateSave
      },
      vsi: {
        create: f5VsiCreate,
        save: f5VsiSave
      }
    }
  });

  slzStore.newField("iam_account_settings", {
    init: iamInit,
    save: iamSave
  });

  slzStore.newField("secrets_manager", {
    init: secretsManagerInit,
    onStoreUpdate: secretsManagerOnStoreUpdate,
    save: secretsManagerSave
  });

  slzStore.newField("security_groups", {
    init: securityGroupInit,
    onStoreUpdate: securityGroupOnStoreUpdate,
    create: securityGroupCreate,
    save: securityGroupSave,
    delete: securityGroupDelete,
    subComponents: {
      rules: {
        create: securityGroupRulesCreate,
        save: securityGroupRulesSave,
        delete: securityGroupRulesDelete
      }
    }
  });

  slzStore.newField("ssh_keys", {
    init: sshKeyInit,
    onStoreUpdate: sshKeyOnStoreUpdate,
    create: sshKeyCreate,
    save: sshKeySave,
    delete: sshKeyDelete
  });

  slzStore.newField("teleport_config", {
    init: teleportInit,
    onStoreUpdate: teleportOnStoreUpdate,
    save: teleportSave,
    subComponents: {
      claims_to_roles: {
        create: teleportClaimsToRolesCreate,
        save: teleportClaimsToRolesSave,
        delete: teleportClaimsToRolesDelete
      }
    }
  });

  slzStore.newField("teleport_vsi", {
    init: vsiInit,
    create: vsiCreate,
    save: vsiSave,
    delete: vsiDelete,
    subComponents: {
      security_group: {
        save: vsiSecurityGroupSave,
        subComponents: {
          rules: {
            create: vsiSecurityGroupRuleCreate,
            save: vsiSecurityGroupRuleSave,
            delete: vsiSecurityGroupRuleDelete
          }
        }
      }
    }
  });

  slzStore.newField("vsi", {
    init: vsiInit,
    onStoreUpdate: vsiOnStoreUpdate,
    create: vsiCreate,
    save: vsiSave,
    delete: vsiDelete,
    subComponents: {
      security_group: {
        save: vsiSecurityGroupSave,
        subComponents: {
          rules: {
            create: vsiSecurityGroupRuleCreate,
            save: vsiSecurityGroupRuleSave,
            delete: vsiSecurityGroupRuleDelete
          }
        }
      }
    }
  });

  slzStore.newField("transit_gateway", {
    init: transitGatewayInit,
    onStoreUpdate: transitGatewayOnStoreUpdate,
    save: transitGatewaySave
  });

  slzStore.newField("vpn_gateways", {
    init: vpnInit,
    onStoreUpdate: vpnOnStoreUpdate,
    create: vpnCreate,
    save: vpnSave,
    delete: vpnDelete
  });

  slzStore.newField("virtual_private_endpoints", {
    init: vpeInit,
    onStoreUpdate: vpeOnStoreUpdate,
    create: vpeCreate,
    save: vpeSave,
    delete: vpeDelete
  });

  return slzStore;
};

export { slzState };
