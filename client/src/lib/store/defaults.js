/**
 * create new default kms
 * @returns key management object
 */
function newDefaultKms() {
  return {
    keys: [
      {
        key_ring: "slz-slz-ring",
        name: "slz-atracker-key",
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
      },
      {
        key_ring: "slz-slz-ring",
        name: "slz-slz-key",
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
      }
    ],
    name: "slz-slz-kms",
    resource_group: "service-rg",
    use_hs_crypto: false,
    use_data: false
  };
}

/**
 * create new default cos object
 */
function newDefaultCos() {
  return [
    {
      buckets: [
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "slz-atracker-key",
          name: "atracker-bucket",
          storage_class: "standard"
        }
      ],
      keys: [
        {
          name: "cos-bind-key",
          role: "Writer",
          enable_HMAC: false
        }
      ],
      name: "atracker-cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      random_suffix: true
    },
    {
      buckets: [
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "slz-slz-key",
          name: "management-bucket",
          storage_class: "standard"
        },
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "slz-slz-key",
          name: "workload-bucket",
          storage_class: "standard"
        }
      ],
      random_suffix: true,
      keys: [],
      name: "cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false
    }
  ];
}

function newDefaultVpcs() {
  return [
    {
      flow_logs_bucket_name: "management-bucket",
      classic_access: false,
      default_network_acl_name: null,
      default_routing_table_name: null,
      default_security_group_name: null,
      default_security_group_rules: [],
      network_acls: [
        {
          add_ibm_cloud_internal_rules: true,
          add_vpc_connectivity_rules: true,
          name: "management-acl",
          rules: [
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            }
          ]
        }
      ],
      prefix: "management",
      resource_group: "management-rg",
      subnets: {
        "zone-1": [
          {
            acl_name: "management-acl",
            cidr: "10.10.10.0/24",
            name: "vsi-zone-1",
            public_gateway: false
          },
          {
            acl_name: "management-acl",
            cidr: "10.10.20.0/24",
            name: "vpe-zone-1",
            public_gateway: false
          },
          {
            acl_name: "management-acl",
            cidr: "10.10.30.0/24",
            name: "vpn-zone-1",
            public_gateway: false
          }
        ],
        "zone-2": [
          {
            acl_name: "management-acl",
            cidr: "10.20.10.0/24",
            name: "vsi-zone-2",
            public_gateway: false
          },
          {
            acl_name: "management-acl",
            cidr: "10.20.20.0/24",
            name: "vpe-zone-2",
            public_gateway: false
          }
        ],
        "zone-3": [
          {
            acl_name: "management-acl",
            cidr: "10.30.10.0/24",
            name: "vsi-zone-3",
            public_gateway: false
          },
          {
            acl_name: "management-acl",
            cidr: "10.30.20.0/24",
            name: "vpe-zone-3",
            public_gateway: false
          }
        ]
      },
      use_public_gateways: {
        "zone-1": false,
        "zone-2": false,
        "zone-3": false
      }
    },
    {
      classic_access: false,
      default_network_acl_name: null,
      default_routing_table_name: null,
      default_security_group_name: null,
      default_security_group_rules: [],
      flow_logs_bucket_name: "workload-bucket",
      network_acls: [
        {
          add_ibm_cloud_internal_rules: true,
          add_vpc_connectivity_rules: true,
          name: "workload-acl",
          rules: [
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              icmp: {
                type: null,
                code: null
              },
              tcp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              },
              udp: {
                port_min: null,
                port_max: null,
                source_port_min: null,
                source_port_max: null
              }
            }
          ]
        }
      ],
      prefix: "workload",
      resource_group: "workload-rg",
      subnets: {
        "zone-1": [
          {
            acl_name: "workload-acl",
            cidr: "10.40.10.0/24",
            name: "vsi-zone-1",
            public_gateway: false
          },
          {
            acl_name: "workload-acl",
            cidr: "10.40.20.0/24",
            name: "vpe-zone-1",
            public_gateway: false
          }
        ],
        "zone-2": [
          {
            acl_name: "workload-acl",
            cidr: "10.50.10.0/24",
            name: "vsi-zone-2",
            public_gateway: false
          },
          {
            acl_name: "workload-acl",
            cidr: "10.50.20.0/24",
            name: "vpe-zone-2",
            public_gateway: false
          }
        ],
        "zone-3": [
          {
            acl_name: "workload-acl",
            cidr: "10.60.10.0/24",
            name: "vsi-zone-3",
            public_gateway: false
          },
          {
            acl_name: "workload-acl",
            cidr: "10.60.20.0/24",
            name: "vpe-zone-3",
            public_gateway: false
          }
        ]
      },
      use_public_gateways: {
        "zone-1": false,
        "zone-2": false,
        "zone-3": false
      }
    }
  ];
}

function newVpc() {
  return {
    default_security_group_rules: [],
    flow_logs_bucket_name: null,
    network_acls: [],
    prefix: null,
    resource_group: null,
    use_public_gateways: {
      "zone-1": false,
      "zone-2": false,
      "zone-3": false
    },
    classic_access: false,
    default_network_acl_name: null,
    default_security_group_name: null,
    default_routing_table_name: null,
    subnets: {
      "zone-1": [],
      "zone-2": [],
      "zone-3": []
    }
  };
}

function newDefaultManagementCluster() {
  return {
    cos_name: "cos",
    entitlement: "cloud_pak",
    kube_type: "openshift",
    kube_version: "default",
    operating_system: "REDHAT_8_64",
    machine_type: "bx2.16x64",
    name: "management-cluster",
    resource_group: "management-rg",
    kms_config: {
      crk_name: "slz-roks-key",
      private_endpoint: true
    },
    subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    vpc_name: "management",
    worker_pools: [
      {
        entitlement: "cloud_pak",
        flavor: "bx2.16x64",
        name: "logging-worker-pool",
        subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc_name: "management",
        workers_per_subnet: 2
      }
    ],
    workers_per_subnet: 2
  };
}

function newDefaultWorkloadCluster() {
  return {
    cos_name: "cos",
    entitlement: "cloud_pak",
    kube_type: "openshift",
    kube_version: "default",
    operating_system: "REDHAT_8_64",
    machine_type: "bx2.16x64",
    name: "workload-cluster",
    resource_group: "workload-rg",
    kms_config: {
      crk_name: "slz-roks-key",
      private_endpoint: true
    },
    subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    vpc_name: "workload",
    worker_pools: [
      {
        entitlement: "cloud_pak",
        flavor: "bx2.16x64",
        name: "logging-worker-pool",
        subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc_name: "workload",
        workers_per_subnet: 2
      }
    ],
    workers_per_subnet: 2
  };
}

function newDefaultManagementServer() {
  return {
    boot_volume_encryption_key_name: "slz-vsi-volume-key",
    image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
    machine_type: "cx2-4x8",
    name: "management-server",
    resource_group: "management-rg",
    security_group: {
      name: "management",
      rules: [
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ]
    },
    ssh_keys: ["slz-ssh-key"],
    subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    vpc_name: "management",
    vsi_per_subnet: 1,
    security_groups: []
  };
}

function newDefaultWorkloadServer() {
  return {
    boot_volume_encryption_key_name: "slz-vsi-volume-key",
    image_name: "ibm-ubuntu-18-04-6-minimal-amd64-2",
    machine_type: "cx2-4x8",
    name: "workload-server",
    resource_group: "workload-rg",
    security_group: {
      name: "workload",
      rules: [
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ]
    },
    ssh_keys: ["slz-ssh-key"],
    subnet_names: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    vpc_name: "workload",
    vsi_per_subnet: 1,
    security_groups: []
  };
}

function newDefaultVpe() {
  return [
    {
      service_name: "cos",
      service_type: "cloud-object-storage",
      resource_group: "service-rg",
      vpcs: [
        {
          name: "management",
          security_group_name: "management-vpe-sg",
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"]
        },
        {
          name: "workload",
          security_group_name: "workload-vpe-sg",
          subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"]
        }
      ]
    }
  ];
}

function defaultSecurityGroups() {
  return [
    {
      name: "management-vpe-sg",
      resource_group: "management-rg",
      rules: [
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ],
      vpc_name: "management"
    },
    {
      name: "workload-vpe-sg",
      resource_group: "workload-rg",
      rules: [
        {
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ],
      vpc_name: "workload"
    }
  ];
}

function newDefaultEdgeAcl() {
  return {
    add_ibm_cloud_internal_rules: false,
    add_vpc_connectivity_rules: false,
    name: "edge-acl",
    rules: [
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    ]
  };
}

function newDefaultF5ExternalAcl() {
  return {
    add_ibm_cloud_internal_rules: false,
    add_vpc_connectivity_rules: false,
    name: "f5-external-acl",
    rules: [
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-f5-external-443-inbound",
        source: "0.0.0.0/0",
        tcp: {
          port_max: 443,
          port_min: 443,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    ]
  };
}

function newF5ManagementSg() {
  return {
    name: "f5-management-sg",
    resource_group: "edge-rg",
    rules: [
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc_name: "edge"
  };
}

function newF5ExternalSg() {
  return {
    name: "f5-external-sg",
    resource_group: "edge-rg",
    rules: [
      {
        direction: "inbound",
        name: "allow-inbound-443",
        source: "0.0.0.0/0",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc_name: "edge"
  };
}

function newF5WorkloadSg() {
  return {
    name: "f5-workload-sg",
    resource_group: "edge-rg",
    rules: [
      {
        direction: "inbound",
        name: "allow-workload-subnet-1",
        source: "10.10.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-workload-subnet-2",
        source: "10.20.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-workload-subnet-3",
        source: "10.30.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-workload-subnet-4",
        source: "10.40.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-workload-subnet-5",
        source: "10.50.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-workload-subnet-6",
        source: "10.60.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc_name: "edge"
  };
}

function newF5BastionSg() {
  return {
    name: "f5-bastion-sg",
    resource_group: "edge-rg",
    rules: [
      {
        direction: "inbound",
        name: "1-inbound-3023",
        source: "10.5.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "1-inbound-3080",
        source: "10.5.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "2-inbound-3023",
        source: "10.6.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "2-inbound-3080",
        source: "10.6.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "3-inbound-3023",
        source: "10.7.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "3-inbound-3080",
        source: "10.7.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc_name: "edge"
  };
}

function newF5VpeSg() {
  return {
    name: "edge-vpe-sg",
    resource_group: "edge-rg",
    rules: [
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc_name: "edge"
  };
}

// tiers by zone use function to prevent update in place
const firewallTiers = {
  "full-tunnel": () => {
    return ["f5-bastion", "f5-external", "f5-management"];
  },
  waf: () => {
    return ["f5-external", "f5-management", "f5-workload"];
  },
  "vpn-and-waf": () => {
    return ["f5-bastion", "f5-external", "f5-management", "f5-workload"];
  }
};

/**
 * create new bastion sg
 * @returns default bastion sg
 */
function newTeleportSg() {
  return {
    name: "bastion-vsi-sg",
    rules: [
      {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "inbound",
        name: "allow-inbound-443",
        source: "0.0.0.0/0",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ]
  };
}

export {
  newDefaultCos,
  newDefaultKms,
  newDefaultVpcs,
  newVpc,
  newDefaultManagementCluster,
  newDefaultWorkloadCluster,
  newDefaultManagementServer,
  newDefaultWorkloadServer,
  newDefaultVpe,
  defaultSecurityGroups,
  newDefaultEdgeAcl,
  newDefaultF5ExternalAcl,
  newF5BastionSg,
  newF5ExternalSg,
  newF5ManagementSg,
  newF5WorkloadSg,
  newF5VpeSg,
  firewallTiers,
  newTeleportSg
};
