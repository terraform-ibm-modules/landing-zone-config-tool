import React, { Component } from "react";
import {
  SlzSelect,
  EntitlementDropdown,
  WorkersPerSubnetDropdown,
  KmsKeySelect,
  ResourceGroupSelect,
  VpcSelect,
  SubnetMultiSelect,
  SlzFormGroup,
  ClusterVersionSelect,
  ClusterOperatingSystemSelect,
  FlavorSelect,
  SlzNameInput
} from "../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import {
  newFormClusterInstance,
  hasInvalidWorkers,
  stateInit
} from "../../../lib/index.js";
import { ClusterWorkerPools } from "../SlzArrayForms.js";
import { isNullOrEmptyString, splat } from "lazy-z";
import PropTypes from "prop-types";

const kubeTypes = { OpenShift: "openshift" };

class ClusterInstance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cosNames: [],
      show: true,
      cluster: this.props.data
        ? { ...stateInit("clusters", this.props) }
        : newFormClusterInstance()
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggleChange = this.handleToggleChange.bind(this);
    this.handleSubnetChange = this.handleSubnetChange.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  // Handle cluster input change
  handleInputChange = event => {
    let { name, value } = event.target;
    let cluster = { ...this.state.cluster };
    if (name === "kms_config") {
      cluster[name].crk_name = value;
    } else if (name === "kube_type") {
      cluster[name] = kubeTypes[value];
      cluster.cos_name = "";
      cluster.kube_version = ""; // reset kube version on change
      cluster.operating_system = ""; // reset kube operating system on change
    } else if (name === "workers_per_subnet") {
      cluster[name] = Number(value);
    } else if (name === "vpc_name") {
      cluster[name] = value;
      cluster.subnet_names = [];
    } else {
      cluster[name] =
        value === "null" ? null : value.replace(/\s\(Default\)/g, ""); // replace default with empty string
    }
    this.setState({ cluster: cluster });
  };

  /**
   * handle toggle change
   * @param {*} event event
   */
  handleToggleChange = () => {
    let cluster = { ...this.state.cluster };
    this.setState({ cluster: cluster });
  };

  /**
   * handle subnet
   * @param {*} event event
   */
  handleSubnetChange = event => {
    let cluster = { ...this.state.cluster };
    cluster.subnet_names = event.selectedItems;
    this.setState({ cluster });
  };

  render() {
    let clusterComponent = this.props.isModal
      ? "new-cluster"
      : this.props.data.name;
    let invalidWorkers = hasInvalidWorkers(this.state);
    return (
      <>
        <SlzFormGroup>
          {/* name */}
          <SlzNameInput
            componentName={clusterComponent}
            id={this.state.name + "-name"}
            component="clusters"
            componentProps={this.props}
            value={this.state.cluster.name}
            onChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />

          {/* resource group */}
          <ResourceGroupSelect
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
            slz={this.props.slz}
            component={clusterComponent}
            value={this.state.cluster.resource_group}
          />

          {/* kube type */}
          <SlzSelect
            name="kube_type"
            labelText="Kube type"
            className="fieldWidthSmaller"
            groups={["OpenShift"]}
            handleInputChange={this.handleInputChange}
            invalidText="Select a cluster type."
            value={
              this.state.cluster.kube_type === ""
                ? "" : "OpenShift"
            }
            component={clusterComponent}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* entitlement */}
          <EntitlementDropdown
            value={this.state.cluster.entitlement}
            handleInputChange={this.handleInputChange}
            component={clusterComponent}
          />

          {/* encryption key */}
          <KmsKeySelect
            name="kms_config"
            slz={this.props.slz}
            value={this.state.cluster.kms_config.crk_name}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
            component={clusterComponent}
          />

          {/* cos */}
          {this.state.cluster.kube_type === "openshift" && (
            <SlzSelect
              name="cos_name"
              component={clusterComponent}
              groups={splat(this.props.slz.store.configDotJson.cos, "name")}
              value={this.state.cluster.cos_name}
              labelText="Cloud Object Storage instance"
              handleInputChange={this.handleInputChange}
              className="fieldWidthSmaller"
              invalidText="Select an Object Storage instance"
            />
          )}
        </SlzFormGroup>
        <SlzFormGroup>
          {/* vpc */}
          <VpcSelect
            id={clusterComponent + "-vpc-name"}
            name="vpc_name"
            component={clusterComponent}
            slz={this.props.slz}
            value={this.state.cluster.vpc_name}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          {/* subnets */}
          <SubnetMultiSelect
            id={clusterComponent}
            slz={this.props.slz}
            key={this.state.cluster.vpc_name}
            vpc_name={this.state.cluster.vpc_name}
            initialSelectedItems={this.state.cluster.subnet_names}
            value={this.state.cluster.subnet_names}
            onChange={this.handleSubnetChange}
            className="fieldWidthSmaller cds--form-item"
          />
          {/* Workers per Subnet */}
          <WorkersPerSubnetDropdown
            component={clusterComponent}
            value={this.state.cluster.workers_per_subnet}
            handleInputChange={this.handleInputChange}
            {...invalidWorkers}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* Machine Type */}
          <FlavorSelect
            id={clusterComponent}
            value={this.state.cluster.machine_type}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          {/* Kube Version */}
          <ClusterVersionSelect
            id={clusterComponent}
            value={this.state.cluster.kube_version}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
            kube_type={this.state.cluster.kube_type}
            invalid={isNullOrEmptyString(this.state.cluster.kube_version)}
          />
          <ClusterOperatingSystemSelect
            id={clusterComponent}
            value={this.state.cluster.operating_system}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
            kube_type={this.state.cluster.kube_type}
            invalid={isNullOrEmptyString(this.state.cluster.operating_system)}
          />
        </SlzFormGroup>
        {!this.props.isModal && (
          <>
            <ClusterWorkerPools
              slz={this.props.slz}
              arrayParentName={this.props.data.name}
              cluster={this.state.cluster}
            />
          </>
        )}
      </>
    );
  }
}

export default ClusterInstance;

ClusterInstance.defaultProps = {
  data: {
    cos_name: "",
    kube_type: "openshift",
    kube_version: "default",
    operating_system: "REDHAT_8_64",
    machine_type: "bx2.16x64",
    name: "",
    kms_config: { crk_name: "" },
    subnet_names: [],
    vpc_name: "",
    worker_pools: [],
    workers_per_subnet: 2
  },
  isModal: false
};

ClusterInstance.propTypes = {
  isModal: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    cos_name: PropTypes.string.isRequired,
    entitlement: PropTypes.string, // can be null
    kube_type: PropTypes.string.isRequired,
    kube_version: PropTypes.string.isRequired,
    operating_system: PropTypes.string.isRequired,
    machine_type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    resource_group: PropTypes.string,
    // crk name can now be null to allow for imported clusters to not have key
    kms_config: PropTypes.shape({ crk_name: PropTypes.string }).isRequired,
    subnet_names: PropTypes.array.isRequired,
    vpc_name: PropTypes.string.isRequired,
    worker_pools: PropTypes.array.isRequired,
    workers_per_subnet: PropTypes.number.isRequired
  }),
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        clusters: PropTypes.array.isRequired
      })
    })
  })
};
