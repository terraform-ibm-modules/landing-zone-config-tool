import React, { Component } from "react";
import { NetworkingRulesOrderCard } from "./network-rules/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import { splat, deepEqual } from "lazy-z";
import PropTypes from "prop-types";
import { SlzNameInput, SlzToggle, SlzFormGroup } from "../../icse/index.js";

/** NetworkAclForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class NetworkAclForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.data;

    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.networkRuleOrderDidChange = this.networkRuleOrderDidChange.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * Handle input change for a text field
   * @param {event} event
   */
  handleTextInput(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the toggle to change
   */
  handleToggle(name) {
    this.setState(this.toggleStateBoolean(name, this.state));
  }
  /**
   * Check if the order of network rules updated - then update state to allow save
   * @param {Array} rules list of rule objects
   */
  networkRuleOrderDidChange(rules) {
    this.props.networkRuleOrderDidChange(
      deepEqual(splat(rules, "name"), splat([...this.props.data.rules], "name"))
    );
    this.setState({ rules: rules }); // update rules state when an update occurs
  }

  render() {
    return (
      <div>
        <SlzFormGroup>
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name}
            value={this.state.name}
            onChange={this.handleTextInput}
            componentProps={this.props}
            placeholder="my-network-acl-name"
            component="network_acls"
          />
          <SlzToggle
            tooltip={{
              content:
                "Automatically add to ACL rules needed to allow cluster provisioning from private service endpoints.",
              link:
                "https://cloud.ibm.com/docs/openshift?topic=openshift-vpc-acls"
            }}
            labelText="Use cluster rules"
            toggleFieldName="add_cluster_rules"
            defaultToggled={this.state.add_cluster_rules}
            id={this.state.name + "acl-add-rules-toggle"}
            onToggle={this.handleToggle}
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
        {/* Networking Rules & update/delete should not be shown within the ACL create modal */}
        {!this.props.isModal && (
          <>
            {/* Ability to move rules up and Down */}
            <NetworkingRulesOrderCard
              rules={this.state.rules}
              vpc_name={this.props.arrayParentName}
              parent_name={this.props.data.name}
              slz={this.props.slz}
              networkRuleOrderDidChange={this.networkRuleOrderDidChange}
              isAclForm
            />
          </>
        )}
      </div>
    );
  }
}

NetworkAclForm.defaultProps = {
  data: {
    name: "",
    add_cluster_rules: false
  },
  isModal: false
};

NetworkAclForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    add_cluster_rules: PropTypes.bool.isRequired,
    rules: PropTypes.array
  }),
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        vpcs: PropTypes.array.isRequired
      }).isRequired,
      networkAcls: PropTypes.shape({}).isRequired
    }).isRequired
  }),
  isModal: PropTypes.bool.isRequired,
  networkRuleOrderDidChange: PropTypes.func // can be undefined
};

export default NetworkAclForm;
