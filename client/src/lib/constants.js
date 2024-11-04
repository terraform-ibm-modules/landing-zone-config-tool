import { RegexButWithWords } from "regex-but-with-words";

const nameValidationExp = new RegexButWithWords()
    .stringBegin()
    .set("A-z")
    .group(exp => {
      exp
        .set("a-z0-9-")
        .anyNumber()
        .set("a-z0-9");
    })
    .lazy()
    .stringEnd()
    .done("i");
const maskFieldsExpStep1ReplacePublicKey = new RegexButWithWords()
    .literal("public_key")
    .done("g");
const maskFieldsExpStep2ReplaceTmosAdminPassword = new RegexButWithWords()
    .literal("tmos_admin_password")
    .done("g");
const maskFieldsExpStep3ReplaceLicensePassword = new RegexButWithWords()
    .literal("license_password")
    .done("g");
const maskFieldsExpStep4HideValue = new RegexButWithWords()
    .literal('%%%%":')
    .whitespace()
    .group(exp => {
      exp
        .group(exp =>
          exp
            .literal('"')
            .negatedSet('"')
            .oneOrMore()
            .look.ahead('"')
        )
        .or()
        .literal("null")
        .or()
        .literal('""');
    })
    .done("g");
const emailValidationExp = new RegexButWithWords()
    .stringBegin()
    .set(exp => {
      exp
        .word()
        .digit()
        .literal("_.-");
    })
    .oneOrMore()
    .literal("@")
    .group(
      exp => {
        exp
          .set(exp => {
            exp
              .word()
              .digit()
              .literal("_-");
          })
          .oneOrMore()
          .literal(".");
      },
      1,
      4
    )
    .set(exp => {
      exp.word().digit();
    })
    .oneOrMore()
    .stringEnd()
    .done("g");
  const urlValidationExp = new RegexButWithWords()
    .group(exp => {
      exp
        .literal("ftp")
        .or()
        .literal("http")
        .literal("s")
        .lazy();
    })
    .literal("://")
    .group("www.")
    .lazy()
    .group(exp => {
      exp
        .negatedSet('"\\/')
        .oneOrMore()
        .literal(".");
    })
    .group(exp => {
      exp
        .negatedSet('"\\/')
        .oneOrMore()
        .literal(".");
    })
    .oneOrMore()
    .negatedSet('"\\/.')
    .oneOrMore()
    .literal("/")
    .negatedSet(' "')
    .anyNumber()
    .stringEnd()
    .done("g");
const tmosAdminPasswordValidationExp = new RegexButWithWords()
    .stringBegin()
    .look.ahead(exp => {
      exp
        .any()
        .anyNumber()
        .set("a-z");
    })
    .look.ahead(exp => {
      exp
        .any()
        .anyNumber()
        .set("A-Z");
    })
    .look.ahead(exp => {
      exp
        .any()
        .anyNumber()
        .set("0-9");
    })
    .any(15, "*")
    .stringEnd()
    .done("");
const reservedSubnetNameExp = new RegexButWithWords()
    .stringBegin()
    .group(exp => {
      exp
        .literal("f5-external")
        .or()
        .literal("f5-workload")
        .or()
        .literal("f5-management")
        .or()
        .literal("f5-bastion")
        .or()
        .literal("vpn-1")
        .or()
        .literal("vpn-2")
        .or()
        .any()
        .anyNumber()
        .literal("zone")
        .any()
        .anyNumber();
    })
    .stringEnd()
    .done("g");
const commaSeparatedIpListExp = new RegexButWithWords()
    .stringBegin()
    .group(exp => {
      exp.group(exp => {
        exp
          .wordBoundary()
          .group(exp => {
            exp
              .group(exp => {
                exp
                  .literal("25")
                  .set("0-5")
                  .or()
                  .literal("2")
                  .set("0-4")
                  .digit()
                  .or()
                  .set("01")
                  .lazy()
                  .digit(1, 2);
              })
              .literal(".");
          }, 3)
          .group(exp => {
            exp
              .literal("25")
              .set("0-5")
              .or()
              .literal("2")
              .set("0-4")
              .digit()
              .or()
              .set("01")
              .lazy()
              .digit(1, 2);
          })
          .wordBoundary()
          .group(exp => {
            exp.group(exp => {
              exp.literal("/").group(exp => {
                exp
                  .literal("3")
                  .set("0-2")
                  .or()
                  .set("012")
                  .lazy()
                  .digit();
              });
            });
          })
          .lazy();
      });
    })
    .anyNumber()
    .group(exp => {
      exp
        .literal(",")
        .whitespace()
        .anyNumber()
        .wordBoundary()
        .group(exp => {
          exp
            .group(exp => {
              exp
                .literal("25")
                .set("0-5")
                .or()
                .literal("2")
                .set("0-4")
                .digit()
                .or()
                .set("01")
                .lazy()
                .digit(1, 2);
            })
            .literal(".");
        }, 3)
        .group(exp => {
          exp
            .literal("25")
            .set("0-5")
            .or()
            .literal("2")
            .set("0-4")
            .digit()
            .or()
            .set("01")
            .lazy()
            .digit(1, 2);
        })
        .wordBoundary()
        .group(exp => {
          exp.group(exp => {
            exp.literal("/").group(exp => {
              exp
                .literal("3")
                .set("0-2")
                .or()
                .set("012")
                .lazy()
                .digit();
            });
          });
        })
        .lazy();
    })
    .anyNumber()
    .stringEnd()
    .done("gm");
  // /^ssh-rsa AAAA[0-9A-Za-z+/]+([=]{0,3})?$/g
const sshKeyValidationExp = new RegexButWithWords()
    .stringBegin()
    .literal("ssh-rsa AAAA")
    .set("0-9A-Za-z+/")
    .oneOrMore()
    .group(exp => {
      exp.set("=", 0, 3);
    })
    .lazy()
    .stringEnd()
    .done("g");
const conditionOperators = {
      EQUALS: "Equals",
      EQUALS_IGNORE_CASE: "Equals (Ignore Case)",
      IN: "In",
      NOT_EQUALS_IGNORE_CASE: "Not Equals (Ignore Case)",
      NOT_EQUALS: "Not Equals",
      CONTAINS: "Contains"
    };
// required fields for config dot json objects
// these are used to add null values for optional fields on objects that are passed in
// from a raw json document to ensure that all values are present on all objects in a list
// to ensure that terraform will be able to compile the values
const requiredOptionalFields = {
    // first level array components
    shallowComponents: {
      // empty cos object to enable nested search inside existing search
      cos: {
        setToFalse: ["random_suffix"]
      },
      // clusters
      clusters: {
        setToNull: [
          "kube_version",
          "operating_system",
          "entitlement",
          "cos_name"
        ],
        setToEmptyList: ["worker_pools"],
        setToValue: {
          kms_config: {
            crk_name: null,
            private_endpoint: true
          }
        }
      },
      // resource groups
      resource_groups: {
        setToFalse: ["create", "use_prefix"]
      },
      // security groups
      security_groups: {
        setToNull: ["resource_group"]
      },
      // ssh keys
      ssh_keys: {
        setToNull: ["resource_group", "public_key"]
      },
      virtual_private_endpoints: {
        setToNull: ["resource_group"]
      },
      // vsi
      vsi: {
        setToNull: [
          "user_data",
          "resource_group",
          "boot_volume_encryption_key_name"
        ],
        setToEmptyList: ["security_groups"],
        setToFalse: ["enable_floating_ip"]
      },
      // vpc
      vpcs: {
        setToNull: [
          "default_network_acl_name",
          "default_routing_table_name",
          "default_security_group_name"
        ],
        setToFalse: ["classic_access"]
      }
    },
    // nested components
    nestedComponents: {
      // first key is parent
      cos: {
        // child arrays
        keys: {
          setToFalse: ["enable_HMAC"],
          setToNull: ["role"]
        },
        buckets: {
          setToFalse: ["force_delete"],
          setToNull: ["kms_key", "storage_class", "endpoint_type", "kms_key"]
        }
      },
      // clusters
      clusters: {
        worker_pools: {
          setToNull: ["flavor", "entitlement", "workers_per_subnet"]
        }
      },
      // vpe
      virtual_private_endpoints: {
        vpcs: {
          setToNull: ["security_group_name"]
        }
      }
    }
  };
const restrictMenuItems = ["Unset", "Yes", "No"];
const iamItems = {
  null: {
    display: null,
    value: null
  },
  NONE: {
    display: "NONE",
    value: "NONE"
  },
  TOTP: {
    display: "TOTP",
    value: "TOTP"
  },
  TOTP4ALL: {
    display: "TOTP4ALL",
    value: "TOTP4ALL"
  },
  LEVEL1: {
    display: "Email-Based MFA",
    value: "LEVEL1"
  },
  LEVEL2: {
    display: "TOTP MFA",
    value: "LEVEL2"
  },
  LEVEL3: {
    display: "U2F MFA",
    value: "LEVEL3"
  },
  NOT_SET: {
    display: "Unset",
    value: "NOT_SET"
  },
  RESTRICTED: {
    display: "Yes",
    value: "RESTRICTED"
  },
  NOT_RESTRICTED: {
    display: "No",
    value: "NOT_RESTRICTED"
  },
  "Email-Based MFA": {
    display: "Email-Based MFA",
    value: "LEVEL1"
  },
  "TOTP MFA": {
    display: "TOTP MFA",
    value: "LEVEL2"
  },
  "U2F MFA": {
    display: "U2F MFA",
    value: "LEVEL3"
  },
  Unset: {
    display: "Unset",
    value: "NOT_SET"
  },
  Yes: {
    display: "Yes",
    value: "RESTRICTED"
  },
  No: {
    display: "No",
    value: "NOT_RESTRICTED"
  }
};
const patterns = [
  {
    title: "VSI on VPC landing zone",
    description:
      "Deploys identical virtual servers across the VSI subnet tier in each VPC.",
    id: "vsi"
  },
  {
    title: "Red Hat OpenShift Container Platform on VPC landing zone",
    description:
      "Deploys identical clusters across the VSI subnet tier in each VPC.",
    id: "roks"
  },
  {
    title: "VPC landing zone",
    description:
      "Deploys a simple IBM Cloud VPC infrastructure without any compute resources.",
    id: "vpc"
  }
];
const edgeNetworkingPatterns = [
  {
    id: "full-tunnel",
    name: "VPN"
  },
  {
    id: "waf",
    name: "Web Application Firewall (WAF)"
  },
  { id: "vpn-and-waf", name: "Both VPN and WAF" }
];
const f5fields = {
  license_types: ["none", "byol", "regkeypool", "utilitypool"],
  urls: [
    "phone_home_url",
    "do_declaration_url",
    "as3_declaration_url",
    "ts_declaration_url",
    "tgstandby_url",
    "tgrefresh_url",
    "tgactive_url"
  ],
  license_fields: [
    "template_version",
    "template_source",
    "byol_license_basekey",
    "license_username",
    "license_password",
    "license_host",
    "license_pool",
    "license_unit_of_measure",
    "license_sku_keyword_1",
    "license_sku_keyword_2",
    "app_id"
  ],
  conditional_fields: {
    none: [],
    byol: ["byol_license_basekey"],
    regkeypool: [
      "license_username",
      "license_password",
      "license_host",
      "license_pool"
    ],
    utilitypool: [
      "license_unit_of_measure",
      "license_sku_keyword_1",
      "license_sku_keyword_2",
      "license_username",
      "license_password",
      "license_host",
      "license_pool"
    ]
  }
};

export {
  // Expression for valid resource name
  nameValidationExp,
  maskFieldsExpStep1ReplacePublicKey,
  maskFieldsExpStep2ReplaceTmosAdminPassword,
  maskFieldsExpStep3ReplaceLicensePassword,
  maskFieldsExpStep4HideValue,
  emailValidationExp,
  urlValidationExp,
  tmosAdminPasswordValidationExp,
  reservedSubnetNameExp,
  commaSeparatedIpListExp,
  sshKeyValidationExp,
  conditionOperators,
  requiredOptionalFields,
  restrictMenuItems,
  iamItems,
  patterns,
  edgeNetworkingPatterns,
  f5fields
};
