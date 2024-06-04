import React, { Component } from "react";
import { TextArea, TextInput, NumberInput } from "@carbon/react";
import SecurityGroupForm from "./SecurityGroupForm.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import { stateInit, disableSave, hasInvalidName } from "../../../lib/index.js";
import { transpose, splat, deepEqual } from "lazy-z";
import {
  SlzNameInput,
  SlzTextInput,
  SubnetNameDropdown,
  KmsKeySelect,
  ResourceGroupSelect,
  VpcSelect,
  SlzHeading,
  StatelessToggleForm,
  SlzFormGroup,
  SlzSubForm,
  DynamicRender,
  SaveAddButton,
  SubnetMultiSelect,
  SecurityGroupMultiSelect,
  SshKeyMultiSelect,
  SlzToggle,
  FlavorSelect,
  ImageSelect
} from "../../icse/index.js";
import PropTypes from "prop-types";

/** VSI
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class VsiForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...stateInit("vsi", { ...this.props }),
      hideSecurityGroup: true
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiSelectChange = this.handleMultiSelectChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.onSecurityGroupSave = this.onSecurityGroupSave.bind(this);
    this.networkRuleOrderDidChange = this.networkRuleOrderDidChange.bind(this);
    this.handleSecurityGroupChange = this.handleSecurityGroupChange.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    let { name, value } = event.target;
    let stateChangeParams = {
      [name]: name === "vsi_per_subnet" ? Number(value) : value
    };
    if (name === "vpc_name")
      transpose({ subnet_names: [], subnet_name: "" }, stateChangeParams);
    // set value
    this.setState(stateChangeParams);
  }

  /**
   * handle sg input change
   * @param {event} event event
   */
  handleSecurityGroupChange(event) {
    let securityGroup = { ...this.state.security_group };
    securityGroup.name = event.target.value;
    this.setState({ security_group: securityGroup });
  }

  /**
   * Check if the order of network rules updated - then update state to allow save
   * @param {Array} rules list of rule objects
   */
  networkRuleOrderDidChange(rules) {
    let sg = { ...this.state.security_group }; // deep copy of sg state
    this.props.networkRuleOrderDidChange(
      deepEqual(
        splat(rules, "name"),
        splat([...this.props.data.security_group.rules], "name")
      )
    );
    sg.rules = rules;
    this.setState({ security_group: sg }); // update rules state when an update occurs
  }

  /**
   * handle multiselect change
   * @param {string} name field name
   * @param {string} value
   */
  handleMultiSelectChange(name, value) {
    this.setState(this.setNameToValue(name, value));
  }

  /**
   * toggle handler
   * @param {string} name param name
   */
  handleToggle(name) {
    this.setState(this.toggleStateBoolean(name, this.state));
  }

  onSecurityGroupSave() {
    this.props.slz[
      this.props.isTeleport ? "teleport_vsi" : "vsi"
    ].security_group.save(this.state, this.props);
  }

  render() {
    let composedId = `vsi-deployment-form-${this.props.data.name}`;
    return (
      <>
        <SlzFormGroup>
          {/* name */}
          <SlzNameInput
            id={composedId}
            componentName={composedId}
            component="vsi"
            value={this.state.name}
            className="fieldWidthSmaller"
            onChange={this.handleInputChange}
            componentProps={this.props}
          />
          {/* Select Resource Group */}
          <ResourceGroupSelect
            handleInputChange={this.handleInputChange}
            slz={this.props.slz}
            component={this.props.data.name}
            value={this.state.resource_group}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>

        <SlzFormGroup>
          {/* Select VPC*/}
          <VpcSelect
            id={composedId + "-vpc-name"}
            slz={this.props.slz}
            component="Deployment"
            name="vpc_name"
            value={this.state.vpc_name}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
            isModal={this.props.isModal}
          />
          {/* Subnets */}
          {this.props.isTeleport ? (
            // render dropdown for teleport instance
            <SubnetNameDropdown
              component={composedId + "teleport-subnet-select"}
              slz={this.props.slz}
              vpc_name={this.state.vpc_name}
              value={this.state.subnet_name}
              handleInputChange={this.handleInputChange}
              className="fieldWidthSmaller cds--form-item"
              invalidText={
                this.state.vpc_name === "" ? "Select a VPC" : "Select a Subnet"
              }
            />
          ) : (
            // render multiselect for vsi
            <SubnetMultiSelect
              id={this.props.data.name}
              key={this.state.vpc_name} //workaround to force a re-render; until Carbon releases controlled multiselect
              slz={this.props.slz}
              vpc_name={this.state.vpc_name}
              initialSelectedItems={this.state.subnet_names}
              onChange={value =>
                this.handleMultiSelectChange(
                  "subnet_names",
                  value.selectedItems
                )
              }
              className="fieldWidthSmaller cds--form-item"
            />
          )}

          {/* VSI per subnet*/}
          <NumberInput
            label="Instances per subnet"
            id={composedId + "-vsi-per-subnet"}
            allowEmpty={false}
            value={this.state.vsi_per_subnet}
            max={10}
            min={1}
            onChange={this.handleInputChange}
            name="vsi_per_subnet"
            hideSteppers={true}
            invalidText="Please input a number 1-10"
            className="fieldWidthSmaller leftTextAlign"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* SSH Key Select */}
          <SshKeyMultiSelect
            id={composedId}
            slz={this.props.slz}
            initialSelectedItems={this.state.ssh_keys}
            onChange={value => this.handleMultiSelectChange("ssh_keys", value)}
          />
          {/* image name */}
          <ImageSelect
            value={this.state.image_name}
            handleInputChange={this.handleInputChange}
          />
          {/* machine type */}
          <FlavorSelect
            handleInputChange={this.handleInputChange}
            kind="vsi"
            className="fieldWidthSmaller"
            value={this.state.machine_type}
          />
        </SlzFormGroup>

        <SlzFormGroup>
          {/* Encryption Key */}
          <KmsKeySelect
            component={this.props.data.name}
            slz={this.props.slz}
            name="boot_volume_encryption_key_name"
            value={this.state.boot_volume_encryption_key_name}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          {/* security groups */}
          <SecurityGroupMultiSelect
            id={composedId}
            slz={this.props.slz}
            vpcName={this.state.vpc_name}
            initialSelectedItems={this.state.security_groups}
            className="fieldWidthSmaller cds--form-item"
            onChange={value =>
              this.handleMultiSelectChange("security_groups", value)
            }
          />
          {/* fip */}

          <SlzToggle
            id={composedId + "-fips-toggle"}
            labelText="Enable floating IP"
            defaultToggled={this.state.enable_floating_ip}
            onToggle={this.handleToggle}
          />
        </SlzFormGroup>

        {/* cloud init data, show if not f5 or teleport */}
        <DynamicRender
          hide={this.props.isTeleport}
          show={
            <SlzFormGroup>
              {/* text input */}
              <TextArea
                id={composedId + "-vsi-user-data"}
                invalidText="Invalid error message."
                placeholder="Cloud init data"
                labelText="User Data"
                name="user_data"
                value={this.state.user_data || ""}
                onChange={this.handleInputChange}
                className="fitContent"
              />
            </SlzFormGroup>
          }
        />

        {/* can't use dynamic render here since need props intentionally not defined for modal */}
        {this.props.isModal !== true && (
          <>
            <SlzHeading
              name="VSI Security Group"
              type="subHeading"
              tooltip={{
                content:
                  "This security group is created and associated specifically to the primary network interface for the virtual server instance. This security group cannot be deleted."
              }}
            />
            <StatelessToggleForm
              onIconClick={() => {
                this.handleToggle("hideSecurityGroup");
              }}
              hide={this.state.hideSecurityGroup}
              className="formInSubForm noMargin"
              toggleFormTitle
              name={this.props.data.security_group.name}
              buttons={
                <SaveAddButton
                  onClick={this.props.saveFromChildForm.onSave}
                  noDeleteButton
                  disabled={
                    this.props.saveFromChildForm.disableSave ||
                    disableSave("security_groups", this.state, this.props)
                  }
                />
              }
            >
              <SlzSubForm formInSubForm id={composedId + "-subform"}>
                <div className="marginBottomSmall">
                  <SlzTextInput
                    field="security_group_name"
                    labelText={"Security group name"}
                    componentName="Security Group"
                    className="fieldWidthSmaller forceLeft"
                    value={this.state.security_group.name}
                    onChange={this.handleSecurityGroupChange}
                    {...hasInvalidName(
                      "security_groups",
                      this.state.security_group.name,
                      this.props
                    )}
                  />
                </div>
                <SecurityGroupForm
                  key={JSON.stringify(this.props)}
                  data={this.state.security_group}
                  name={this.props.data.security_group.name}
                  slz={this.props.slz}
                  vsiName={this.props.data.name}
                  hideButtons={true}
                  isTeleport={this.props.isTeleport}
                  networkRuleOrderDidChange={this.networkRuleOrderDidChange}
                />
              </SlzSubForm>
            </StatelessToggleForm>
          </>
        )}
      </>
    );
  }
}

VsiForm.defaultProps = {
  data: {
    security_groups: [],
    ssh_keys: [],
    subnet_name: "",
    subnet_names: [],
    enable_floating_ip: false,
    name: "",
    vpc_name: ""
  },
  isModal: false,
  isTeleport: false
};

VsiForm.propTypes = {
  isModal: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  slz: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  // only used when not modal
  saveFromChildForm: PropTypes.shape({
    onSave: PropTypes.func.isRequired,
    disableSave: PropTypes.bool
  })
};

export default VsiForm;
