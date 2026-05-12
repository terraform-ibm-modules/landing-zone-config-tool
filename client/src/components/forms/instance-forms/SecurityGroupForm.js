import React, { Component } from "react";
import { NetworkingRulesOrderCard } from "./network-rules/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../component-utils.js";
import { splat, deepEqual } from "lazy-z";
import PropTypes from "prop-types";
import {
  SlzNameInput,
  SlzFormGroup,
  ResourceGroupSelect,
  VpcSelect,
} from "../../icse/index.js";

/**
 * security group form
 */
class SecurityGroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data, show: false };
    this.handleInputChange = this.handleInputChange.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.handleShowToggle = this.handleShowToggle.bind(this);
    this.networkRuleOrderDidChange = this.networkRuleOrderDidChange.bind(this);
  }

  /**
   * handle input change
   * @param {event} event
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  handleShowToggle() {
    this.setState(this.toggleStateBoolean("show", this.state));
  }

  /**
   * Check if the order of network rules updated - then update state to allow save
   * @param {Array} rules list of rule objects
   */
  networkRuleOrderDidChange(rules) {
    this.props.networkRuleOrderDidChange(
      deepEqual(
        splat(rules, "name"),
        splat([...this.props.data.rules], "name"),
      ),
    );

    this.setState({ rules: rules }); // if the order of the rules changed, update rules state
  }

  render() {
    let composedId = `security-group-form-${this.props.data.name}`;
    return (
      <>
        {!this.props.vsiName && (
          <>
            <SlzFormGroup>
              {/* name */}
              <SlzNameInput
                id={composedId}
                component="security_groups"
                value={this.state.name}
                onChange={this.handleInputChange}
                componentProps={this.props}
                hideHelperText
                className={
                  this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"
                }
              />

              {/* resource group */}
              <ResourceGroupSelect
                component={this.props.data.name}
                slz={this.props.slz}
                value={this.state.resource_group || ""}
                handleInputChange={this.handleInputChange}
                className={
                  this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"
                }
              />
              {/* vpc name */}
              <VpcSelect
                component={this.props.data.name}
                slz={this.props.slz}
                value={this.state.vpc_name || ""}
                handleInputChange={this.handleInputChange}
                name="vpc_name"
                className={
                  this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"
                }
              />
            </SlzFormGroup>
          </>
        )}
        {(!this.props.isModal || this.props.isTeleport) && (
          <NetworkingRulesOrderCard
            rules={this.state.rules}
            vpc_name={this.props.vpc_name}
            parent_name={this.props.data.name}
            slz={this.props.slz}
            isSecurityGroup={true}
            isTeleport={this.props.isTeleport}
            vsiName={this.props.vsiName}
            networkRuleOrderDidChange={
              this.props.vsiName
                ? this.props.networkRuleOrderDidChange // if vsi form, update rule state within vsi
                : this.networkRuleOrderDidChange
            }
          />
        )}
      </>
    );
  }
}

SecurityGroupForm.defaultProps = {
  data: {
    name: "",
    resource_group: "",
    vpc_name: "",
    rules: [],
  },
  isModal: false,
  isTeleport: false,
};

SecurityGroupForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    vpc_name: PropTypes.string,
    resource_group: PropTypes.string,
    rules: PropTypes.array,
  }).isRequired,
  vsiName: PropTypes.string,
  isModal: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  networkRuleOrderDidChange: PropTypes.func,
  slz: PropTypes.shape({}).isRequired,
};

export default SecurityGroupForm;
