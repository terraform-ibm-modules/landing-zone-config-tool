import React from "react";
import { SlzFormTemplate, ToggleForm } from "../icse/index.js";
import {
  ObjectStorageBucketForm,
  ObjectStorageInstancesForm,
  ObjectStorageKeyForm,
  EncryptionKeyForm,
  VpcNetworkForm,
  SSHKeyForm,
  VsiForm,
  SecurityGroupForm,
  ResourceGroupForm,
  VPEForm,
  NetworkAclForm,
  ClusterInstance,
  WorkerPoolForm,
  VpnGatewayForm,
  TeleportClaimToRoleForm,
  AccessGroupForm,
  AccessGroupPolicyForm,
  AccessGroupDynamicPolicyForm
} from "./instance-forms/index.js";
import {
  AccessGroupDocs,
  ResourceGroupDocs,
  ObjectStorageDocs,
  VpcDocs,
  VsiDocs,
  VpeDocs,
  VpnDocs,
  ClusterDocs,
  SshKeysDocs,
  SecurityGroupsDocs,
  AclDocs
} from "./SlzDocs.js";
import VpcNaclForm from "./VpcNaclForm.js";
import {
  getFormCrudOperations,
  getSlzArrayFormArrayData,
  toggleFormComponentName
} from "../../lib/index.js";
import PropTypes from "prop-types";

/**
 * slz array form
 * @param {Object} props component props
 * @param {string} props.name form title
 * @param {string} props.addText text used to add component ex. Create a new VPC
 * @param {string} props.configDotJsonField array field to map
 * @param {string=} props.configDotJsonSubField get a sub field of an array
 * @param {string=} props.arrayParentName name of the parent component when rendering a list from an object in a list
 * @param {string=} props.childKey name of key index will be appended. if not passed, will use JSON.stringify(formProps)
 * @param {boolean=} props.subHeading use subheading
 * @param {slzStoreField} props.slz slz state store
 * @param {ReactElement} props.form form element
 */
const SlzArrayForm = props => {
  // get submission field name for enableSubmit and disableSave
  let submissionFieldName = props.enableSubmitField || props.configDotJsonField;
  // params for form template
  let formTemplateParams = {
    name: props.name, // form name
    addText: props.addText, // form add text
    arrayData: getSlzArrayFormArrayData(props), // array data to render
    arrayParentName: props.arrayParentName, // parent name if child array
    enableSubmitField: submissionFieldName, // disableSave field
    hideFormTitleButton: props.hideFormTitleButton, // form title hidden
    subHeading: props.subHeading, // subheading
    isTeleport: props.isTeleport, // is teleport for vsi
    slz: props.slz, // slz
    innerForm: props.form, // form to render
    cluster: props.cluster, // cluster for worker pools
    docs: props.docs, // docs
    tooltip: props.tooltip, // tooltip
    parentToggle: props.parentToggle // keep nacl open callback
  };
  // params for inner form
  let innerFormParams = {
    slz: props.slz, // slz
    subHeading: props.subHeading, // is subheading
    submissionFieldName: submissionFieldName, // fieldname
    innerForm: props.form, // form
    cluster: props.cluster, // cluster for worker pools
    isTeleport: props.isTeleport, // is teleport for vsi
    addText: props.addText, // add text
    addButtonAtFormTitle: props.addButtonAtFormTitle // add button for nacl form
  };
  return (
    <SlzFormTemplate
      {...formTemplateParams}
      {...getFormCrudOperations(props)}
      // form to map through
      form={(index, formProps) => {
        return (
          <ToggleForm
            {...innerFormParams}
            name={toggleFormComponentName(formProps)}
            key={props.childKey + JSON.stringify(formProps) + index} // ensure each key is unique∂
            data={formProps} // data for form
            {...formProps} // add all other props
            noDeleteButton={props.noDeleteButton}
            noSaveButton={props.noSaveButton}
          />
        );
      }}
    />
  );
};

SlzArrayForm.defaultProps = {
  hideFormTitleButton: false,
  subHeading: false,
  isTeleport: false,
  addButtonAtFormTitle: false
};

SlzArrayForm.propTypes = {
  enableSubmitField: PropTypes.string, // can be undefined
  configDotJsonField: PropTypes.string, // can be undefined
  name: PropTypes.string, // is not used for nacls
  arrayParentName: PropTypes.string, // only used for arrays with parent components
  hideFormTitleButton: PropTypes.bool.isRequired,
  subHeading: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  addText: PropTypes.string,
  form: PropTypes.func.isRequired,
  cluster: PropTypes.object, // only for worker pools
  docs: PropTypes.func, // used only for top level components
  tooltip: PropTypes.object, // used only for cos keys
  parentToggle: PropTypes.object, // used only for nacl
  addButtonAtFormTitle: PropTypes.bool.isRequired, // used only for nacls
  // slz functions
  slz: PropTypes.shape({
    // cluster functions
    clusters: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      // worker pool functions
      worker_pools: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    key_management: PropTypes.shape({
      // kms key functions
      keys: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    // cos
    cos: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      // buckets
      buckets: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired,
      // keys
      keys: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    // resource gorups
    resource_groups: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // security groups
    security_groups: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // ssh keys
    ssh_keys: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // teleport claims to rules
    teleport_config: PropTypes.shape({
      claims_to_roles: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    // vpcs
    vpcs: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      // network acls
      network_acls: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    // vpe
    virtual_private_endpoints: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // vpn
    vpn_gateways: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // vsi
    vsi: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // teleport vsi
    teleport_vsi: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired
    }).isRequired,
    // access groups
    access_groups: PropTypes.shape({
      create: PropTypes.func.isRequired,
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
      // policies
      policies: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired,
      // dynamic policies
      dynamic_policies: PropTypes.shape({
        create: PropTypes.func.isRequired,
        save: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

/**
 * Below are pages that utilize the SlzArrayForm to render
 */

const Clusters = props => {
  return (
    <SlzArrayForm
      name="clusters"
      addText="Create a Cluster"
      configDotJsonField="clusters"
      slz={props.slz}
      form={ClusterInstance}
      docs={ClusterDocs}
      childKey="cluster-"
      enableSubmitField="clusters"
    />
  );
};

/**
 *  form map
 * @param {slzStateStore} props.slz
 * @param {Object} props.cluster parent cluster
 * @param {string} props.arrayParentName name
 * @returns {SlzFormTemplate} editable array form
 */
const ClusterWorkerPools = props => {
  return (
    <SlzArrayForm
      name="Worker pools"
      addText="Create a worker pool"
      configDotJsonField="clusters"
      configDotJsonSubField="worker_pools"
      form={WorkerPoolForm}
      childKey="cluster-pool-edit-"
      enableSubmitField="worker_pools"
      subHeading
      {...props}
    />
  );
};

/**
 * Encryption Key Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */
const EncryptionKeys = props => {
  return (
    <SlzArrayForm
      name="encryption keys"
      addText="Create an encryption key"
      configDotJsonField="key_management"
      configDotJsonSubField="keys"
      slz={props.slz}
      form={EncryptionKeyForm}
      childKey="encryption-key-edit-"
      enableSubmitField="kms_key"
    />
  );
};

/**
 * Object Storage Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */
const ObjectStorage = props => {
  return (
    <SlzArrayForm
      name="Object Storage"
      addText="Create an Object Storage Instance"
      configDotJsonField="cos"
      slz={props.slz}
      form={ObjectStorageInstancesForm}
      childKey="cos-edit-"
      docs={ObjectStorageDocs}
    />
  );
};

/**
 * cos buckets form map
 * @param {slzStateStore} props.slz
 * @param {string} props.arrayParentName cos instance name
 * @returns {SlzFormTemplate} editable array form
 */
const ObjectStorageBuckets = props => {
  return (
    <SlzArrayForm
      name="buckets"
      addText="Create a Bucket"
      configDotJsonField="cos"
      configDotJsonSubField="buckets"
      enableSubmitField="buckets"
      form={ObjectStorageBucketForm}
      childKey="cos-bucket-edit-"
      subHeading
      {...props}
    />
  );
};

/**
 * cos keys form map
 * @param {slzStateStore} props.slz
 * @param {string} props.arrayParentName cos instance name
 * @returns {SlzFormTemplate} editable array form
 */
const ObjectStorageKeys = props => {
  return (
    <SlzArrayForm
      name="service credentials"
      addText="Create a service credential"
      configDotJsonField="cos"
      configDotJsonSubField="keys"
      form={ObjectStorageKeyForm}
      childKey="cos-key-edit-"
      subHeading
      enableSubmitField="cos_keys"
      tooltip={{
        content:
          "A service credential allows for a service instance to connect to Object Storage.",
        link:
          "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-service-credentials"
      }}
      {...props}
    />
  );
};

/**
 * resource group form map
 * @param {slzStateStore} props.slz
 * @returns {SlzFormTemplate} editable array form
 */
const ResourceGroups = props => {
  return (
    <SlzArrayForm
      name="resource groups"
      addText="Create a resource group"
      configDotJsonField="resource_groups"
      slz={props.slz}
      form={ResourceGroupForm}
      childKey="resource-group-edit-"
      docs={ResourceGroupDocs}
    />
  );
};

/**
 * security group form map
 * @param {slzStateStore} props.slz
 * @returns {SlzFormTemplate} editable array form
 */
const SecurityGroups = props => {
  return (
    <SlzArrayForm
      name="security groups"
      addText="Create a security group"
      configDotJsonField="security_groups"
      slz={props.slz}
      form={SecurityGroupForm}
      docs={SecurityGroupsDocs}
      childKey="security-group-edit-"
    />
  );
};

/**
 * SSH Key Form Map
 * @param {slzStateStore} props.slz
 * @returns {SlzFormTemplate} editable array form
 */
const SshKeys = props => {
  return (
    <SlzArrayForm
      name="SSH keys"
      addText="Create an SSH key"
      configDotJsonField="ssh_keys"
      slz={props.slz}
      form={SSHKeyForm}
      docs={SshKeysDocs}
      childKey="ssh-key-edit-"
    />
  );
};

const TeleportClaimToRoles = props => {
  return (
    <SlzArrayForm
      name="Claims to Roles"
      addText="Create a Claim to Roles"
      configDotJsonField="teleport_config"
      configDotJsonSubField="claims_to_roles"
      slz={props.slz}
      form={TeleportClaimToRoleForm}
      childKey="teleport-claim-"
      subHeading
      enableSubmitField="claims_to_roles"
    />
  );
};

/**
 * VPC Form Map
 * @param {slzStateStore} props.slz
 * @returns {SlzFormTemplate} editable array form
 */
const Vpc = props => {
  return (
    <SlzArrayForm
      name="virtual private clouds"
      addText="Create a VPC"
      configDotJsonField="vpcs"
      slz={props.slz}
      form={VpcNetworkForm}
      childKey="vpc-form-edit-"
      docs={VpcDocs}
    />
  );
};

/**
 * VPC Acl form map
 * @param {slzStateStore} props.slz
 * @returns {SlzFormTemplate} editable array form
 */
const VpcAcl = props => {
  return (
    <SlzArrayForm
      name="VPC access control"
      addText="Create a network access control list"
      configDotJsonField="vpcs"
      slz={props.slz}
      form={VpcNaclForm}
      docs={AclDocs}
      childKey="network-acl-vpc-form-"
      noDeleteButton
      noSaveButton
      hideFormTitleButton
    />
  );
};

/**
 * vpc network acl form map
 * @param {slzStateStore} props.slz
 * @param {string} props.arrayParentName vpc instance name
 * @returns {SlzFormTemplate} editable array form
 */
const NetworkAcls = props => {
  return (
    <SlzArrayForm
      name="network access control lists"
      slz={props.slz}
      form={NetworkAclForm}
      childKey="network-acl-edit-form-"
      configDotJsonField="vpcs"
      configDotJsonSubField="network_acls"
      arrayParentName={props.arrayParentName}
      enableSubmitField="acl"
      subHeading
      parentToggle={props.parentToggle}
      hideFormTitleButton
    />
  );
};

/**
 * VPE Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */
const Vpe = props => {
  return (
    <SlzArrayForm
      name="virtual private endpoints"
      addText="Create a virtual private endpoint"
      configDotJsonField="virtual_private_endpoints"
      slz={props.slz}
      form={VPEForm}
      docs={VpeDocs}
    />
  );
};

/**
 * VPN Gateway Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */

const Vpn = props => {
  return (
    <SlzArrayForm
      name="VPN gateways"
      addText="Create a VPN gateway"
      configDotJsonField="vpn_gateways"
      slz={props.slz}
      form={VpnGatewayForm}
      docs={VpnDocs}
    />
  );
};

/**
 * VSI Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */
const Vsi = props => {
  return (
    <SlzArrayForm
      name="virtual server instance deployments"
      addText="Create a virtual server instance deployment"
      configDotJsonField="vsi"
      slz={props.slz}
      childKey="vsi-edit-form-index-"
      form={VsiForm}
      docs={VsiDocs}
    />
  );
};

/**
 * Teleport VSI Form Map
 * @param {Object} props
 * @returns {SlzFormTemplate} editable array form
 */
const TeleportVsi = props => {
  return (
    <SlzArrayForm
      name="Teleport VSI"
      addText="Create a Teleport VSI"
      configDotJsonField="teleport_vsi"
      slz={props.slz}
      childKey="teleport-edit-form-index-"
      form={VsiForm}
      isTeleport
      subHeading
    />
  );
};

const AccessGroups = props => {
  return (
    <SlzArrayForm
      name="Access Groups"
      addText="Create an Access Group"
      configDotJsonField="access_groups"
      docs={AccessGroupDocs}
      slz={props.slz}
      form={AccessGroupForm}
    />
  );
};

const AccessGroupPolicies = props => {
  return (
    <SlzArrayForm
      name="Policies"
      addText="Create a Policy"
      configDotJsonField="access_groups"
      configDotJsonSubField="policies"
      enableSubmitField="policies"
      form={AccessGroupPolicyForm}
      childKey="access-group-policy-edit-"
      subHeading
      {...props}
    />
  );
};

const AccessGroupDynamicPolicies = props => {
  return (
    <SlzArrayForm
      name="Dynamic Policies"
      addText="Create a Dynamic Policy"
      configDotJsonField="access_groups"
      configDotJsonSubField="dynamic_policies"
      enableSubmitField="dynamic_policies"
      form={AccessGroupDynamicPolicyForm}
      childKey="access-group-dynamic-policy-edit-"
      subHeading
      {...props}
    />
  );
};

export {
  EncryptionKeys,
  NetworkAcls,
  ObjectStorage,
  ObjectStorageBuckets,
  ObjectStorageKeys,
  ResourceGroups,
  SecurityGroups,
  SshKeys,
  VpcAcl,
  Vpc,
  Vpe,
  Vsi,
  TeleportVsi,
  TeleportClaimToRoles,
  Clusters,
  ClusterWorkerPools,
  Vpn,
  AccessGroups,
  AccessGroupPolicies,
  AccessGroupDynamicPolicies
};
