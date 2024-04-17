import React, { Component } from "react";
import {
  SlzTextInput,
  SlzSelect,
  ResourceGroupSelect,
  VpcListMultiSelect,
  SubnetMultiSelect,
  SlzFormGroup,
  SlzSubForm
} from "../../icse/index.js";
import {
  getObjectFromArray,
  splat,
  contains,
  containsKeys,
  keys
} from "lazy-z";
import {
  buildComposedComponentNameHelperText,
  hasInvalidName
} from "../../../lib/index.js";
import { buildFormFunctions } from "../../component-utils.js";
import { SlzToolTipWrapper } from "../../wrappers/Tooltips.js";
import PropTypes from "prop-types";

class VPEForm extends Component {
  constructor(props) {
    super(props);
    let vpcData = {};
    if (this.props.data.vpcs)
      this.props.data.vpcs.forEach(vpc => {
        vpcData[vpc.name] = {
          subnets: vpc.subnets,
          security_group_name: vpc.security_group_name
        };
      });
    this.state = {
      vpe: { ...this.props.data },
      vpcData: vpcData
    };
    buildFormFunctions(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleVpcChange = this.handleVpcChange.bind(this);
    this.handleVpcSubnetChange = this.handleVpcSubnetChange.bind(this);
    this.handleVpcSecurityGroupChange = this.handleVpcSecurityGroupChange.bind(
      this
    );
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    let vpe = this.state.vpe;
    let { name, value } = event.target;
    vpe[name] = value;
    this.setState({ vpe: vpe });
  }

  /**
   * handle vpc change
   * @param {*} data data
   * @param {Array<string>} data.selectedItems selected items
   */
  handleVpcChange(data) {
    let selectedItems = data.selectedItems;
    let vpe = this.state.vpe;
    let vpeVpcNames = splat(vpe.vpcs, "name");
    let newVpcs = [];
    let vpcData = this.state.vpcData;
    let newVpcData = {};
    // for each selected item
    selectedItems.forEach(vpc => {
      if (contains(vpeVpcNames, vpc)) {
        // if exists in vpe add to new vpcs
        newVpcs.push(getObjectFromArray(vpe.vpcs, "name", vpc));
      } else {
        // otherwise add new vpe
        newVpcs.push({
          name: vpc,
          subnets: [],
          security_group_name: ""
        });
      }

      newVpcData[vpc] = {};

      // modify selected subnets
      if (containsKeys(vpcData, vpc)) {
        newVpcData[vpc].subnets = vpcData[vpc].subnets;
        newVpcData[vpc].security_group_name = vpcData[vpc].security_group_name;
      } else {
        newVpcData[vpc].subnets = [];
        newVpcData[vpc].security_group_name = null;
      }
    });

    vpe.vpcs = newVpcs;
    this.setState({ vpe: vpe, vpcData: newVpcData });
  }

  /**
   * handle changing vpc sg
   * @param {string} vpcName vpc name
   * @param {string} sgName security group name
   */
  handleVpcSecurityGroupChange(vpcName, sgName) {
    let vpcData = this.state.vpcData;
    vpcData[vpcName].security_group_name = sgName;
    this.setState({ vpcData: vpcData });
  }

  /**
   * update vpc subnets
   * @param {string} vpcName name of vpc to update
   * @param {Array<string>} subnetNames list of subnet names
   */
  handleVpcSubnetChange(vpcName, subnetNames) {
    let vpcData = { ...this.state.vpcData };
    vpcData[vpcName].subnets = subnetNames;
    this.setState({ vpcData: vpcData });
  }

  render() {
    let composedId = "vpe-form-" + this.props.service_name;
    let vpeHasInvalidName = hasInvalidName(
      "virtual_private_endpoints",
      this.state.vpe.service_name,
      this.props
    );
    return (
      <>
        <SlzFormGroup>
          <SlzToolTipWrapper
            tooltip={{
              content:
                "This prefix will be prepended to each subnet's VPE gateway.",
              alignModal: "bottom-left",
              align: "top-left"
            }}
            isModal={this.props.isModal}
            id={composedId}
            component="VPE"
            field="service_name"
            {...vpeHasInvalidName}
            value={this.state.vpe.service_name}
            onChange={this.handleInputChange}
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            helperText={buildComposedComponentNameHelperText(
              this.props.slz.store.prefix,
              this.state.vpe.service_name,
              {
                suffix: "<vpc name>-<subnet name>"
              }
            )}
            labelText="Prefix"
            innerForm={SlzTextInput}
          />
          <ResourceGroupSelect
            handleInputChange={this.handleInputChange}
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            slz={this.props.slz}
            component={this.props.data.service_name}
            value={this.state.vpe.resource_group}
          />
          <SlzSelect
            tooltip={{ content: "Currently only Object Storage is supported." }}
            component={this.props.data.service_name + "-service"}
            store={this.props.slz.store}
            labelText="Service Type"
            value={this.state.vpe.service_type}
            handleInputChange={this.handleInputChange}
            name="service_type"
            groups={[this.state.vpe.service_type]}
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            isModal={this.props.isModal}
            readOnly
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <VpcListMultiSelect
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            id={composedId + "-vpc-multiselect"}
            titleText="Gateway VPCs"
            slz={this.props.slz}
            onChange={this.handleVpcChange}
            initialSelectedItems={splat(this.props.data.vpcs, "name")}
            invalidText="Select at least one VPC."
            invalid={keys(this.state.vpcData).length === 0}
          />
        </SlzFormGroup>
        <SlzSubForm
          formInSubForm
          className="marginBottomSmall"
          id={composedId + "-subform"}
        >
          <h4 className="leftTextAlign marginBottomSmall">VPCs</h4>
          {keys(this.state.vpcData).map(key => {
            let vpc = this.state.vpcData[key];
            vpc.name = key;
            return (
              <SlzFormGroup key={vpc.name}>
                <SlzTextInput
                  id={composedId + "-" + vpc.name}
                  componentName="VPE"
                  field="vpc_name"
                  labelText={"VPC Name"}
                  invalid="matchName"
                  value={vpc.name}
                  onChange={() => {}}
                  className="fieldWidthSmaller"
                  readOnly
                />
                <SlzSelect
                  component={this.props.data.service_name}
                  value={
                    vpc.security_group_name === null
                      ? ""
                      : containsKeys(this.state.vpcData, vpc.name)
                      ? this.state.vpcData[vpc.name].security_group_name
                      : vpc.security_group_name
                  }
                  name="security_group_name"
                  handleInputChange={event => {
                    this.handleVpcSecurityGroupChange(
                      vpc.name,
                      event.target.value
                    );
                  }}
                  className="fieldWidthSmaller"
                  labelText="Security Group Name"
                  groups={this.props.slz.store.securityGroups[vpc.name]}
                  invalidText="Select a security group."
                />
                <SubnetMultiSelect
                  id={composedId + "-" + vpc.name}
                  slz={this.props.slz}
                  vpc_name={vpc.name}
                  initialSelectedItems={
                    containsKeys(this.state.vpcData, vpc.name)
                      ? this.state.vpcData[vpc.name].subnets
                      : vpc.subnets // default to subnets if not found
                  }
                  onChange={event => {
                    this.handleVpcSubnetChange(vpc.name, event.selectedItems);
                  }}
                  className="fieldWidthSmaller leftTextAlign"
                />
              </SlzFormGroup>
            );
          })}
        </SlzSubForm>
      </>
    );
  }
}

VPEForm.defaultProps = {
  data: {
    service_name: "",
    resource_group: "",
    vpcs: [],
    service_type: "cloud-object-storage"
  },
  isModal: false
};

VPEForm.propTypes = {
  data: PropTypes.shape({
    service_name: PropTypes.string.isRequired,
    resource_group: PropTypes.string, // can be null
    vpcs: PropTypes.array.isRequired,
    service_type: PropTypes.string.isRequired
  }).isRequired,
  isModal: PropTypes.bool.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      prefix: PropTypes.string.isRequired,
      securityGroups: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};

export default VPEForm;
