import React, { Component } from "react";
import { buildFormFunctions } from "../../component-utils.js";
import {
  SlzNameInput,
  EntitlementDropdown,
  WorkersPerSubnetDropdown,
  SubnetMultiSelect,
  SlzFormGroup,
  FlavorSelect,
} from "../../icse/index.js";
import PropTypes from "prop-types";

class WorkerPoolForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pool: this.props.isModal
        ? {
            name: "",
            flavor: this.props.cluster.machine_type,
            subnet_names: this.props.cluster.subnet_names,
            vpc_name: this.props.cluster.vpc_name,
            workers_per_subnet: this.props.cluster.workers_per_subnet,
            entitlement: this.props.cluster.entitlement,
          }
        : this.props.data,
      showPool: true,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubnetChange = this.handleSubnetChange.bind(this);
    buildFormFunctions(this);
  }

  // Handle pool input change
  handleInputChange(event) {
    let { name, value } = event.target;
    let pool = { ...this.state.pool };
    if (name === "workers_per_subnet") {
      pool[name] = Number(value);
    } else {
      pool[name] = value === "null" ? null : value;
    }
    this.setState({ pool });
  }

  // Handle subnet multiselect change
  handleSubnetChange(event) {
    let pool = { ...this.state.pool };
    pool.subnet_names = event.selectedItems;
    this.setState({ pool });
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          {/* name */}
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name}
            component="worker_pools"
            onChange={this.handleInputChange}
            componentProps={this.props}
            value={this.state.pool.name}
            parentName={this.props.arrayParentName}
            className="fieldWidthSmaller"
            placeholder="my-worker-pool-name"
          />
          {/* entitlement */}
          <EntitlementDropdown
            value={this.state.pool.entitlement}
            handleInputChange={this.handleInputChange}
            component={this.props.data.name}
          />
          {/* flavor */}
          <FlavorSelect
            name="flavor"
            value={this.state.pool.flavor}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* subnets */}
          <SubnetMultiSelect
            id={this.props.data.name}
            slz={this.props.slz}
            disabled={this.state.pool.vpc_name === null}
            vpc_name={this.state.pool.vpc_name}
            initialSelectedItems={this.state.pool.subnet_names}
            onChange={this.handleSubnetChange}
            component={this.props.data.name}
            className="fieldWidthSmaller cds--form-item"
          />
          {/* Workers per Subnet */}
          <WorkersPerSubnetDropdown
            value={this.state.pool.workers_per_subnet}
            handleInputChange={this.handleInputChange}
            component={this.props.data.name}
          />
        </SlzFormGroup>
      </>
    );
  }
}

export default WorkerPoolForm;

WorkerPoolForm.defaultProps = {
  data: {
    entitlement: "",
    flavor: "bx2.16x64",
    name: "",
    subnet_names: [],
    vpc_name: "",
    workers_per_subnet: 2,
  },
  isModal: false,
};

WorkerPoolForm.propTypes = {
  isModal: PropTypes.bool.isRequired,
  cluster: PropTypes.shape({
    cos_name: PropTypes.string.isRequired,
    entitlement: PropTypes.string, // can be null
    kube_type: PropTypes.string.isRequired,
    kube_version: PropTypes.string.isRequired,
    operating_system: PropTypes.string.isRequired,
    machine_type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    resource_group: PropTypes.string,
    kms_config: PropTypes.shape({ crk_name: PropTypes.string.isRequired })
      .isRequired,
    subnet_names: PropTypes.array.isRequired,
    vpc_name: PropTypes.string.isRequired,
    worker_pools: PropTypes.array.isRequired,
    workers_per_subnet: PropTypes.number.isRequired,
  }), // can be null
  data: PropTypes.shape({
    entitlement: PropTypes.string.isRequired,
    flavor: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    subnet_names: PropTypes.array.isRequired,
    vpc_name: PropTypes.string.isRequired,
    workers_per_subnet: PropTypes.number.isRequired,
  }).isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        clusters: PropTypes.array.isRequired,
      }),
    }),
  }),
  arrayParentName: PropTypes.string.isRequired,
};
