import React, { Component } from "react";
import { stateInit } from "../../../lib/index.js";
import {
  VpcListMultiSelect,
  ResourceGroupSelect,
  SlzFormGroup,
  SlzToggle,
  SlzTextInput
} from "../../icse/index.js";
import { buildFormFunctions } from "../../component-utils.js";
import PropTypes from "prop-types";

/**
 * Transit Gateway
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class TransitGatewayForm extends Component {
  constructor(props) {
    super(props);
    this.state = stateInit("transit_gateway", { ...this.props });
    this.handleEnableToggle = this.handleEnableToggle.bind(this);
    this.handleVpcSelect = this.handleVpcSelect.bind(this);
    this.handleResourceGroupSelect = this.handleResourceGroupSelect.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    buildFormFunctions(this);
  }

  /**
   * handle toggle
   */
  handleEnableToggle() {
    this.setState({
      enable_transit_gateway: !this.state.enable_transit_gateway
    });
  }

  /**
   * handle vpc selection
   * @param {event} event
   */
  handleVpcSelect(event) {
    this.setState({ transit_gateway_connections: event.selectedItems });
  }

  /**
   * handle resource group selection
   * @param {event} event
   */
  handleResourceGroupSelect(event) {
    this.setState({ transit_gateway_resource_group: event.target.value });
  }

  /**
   * Handle input change for a text field
   * @param {event} event
   */
  handleTextInput(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  render() {
    return (
      <div id="transit-gateway-form">
        <SlzFormGroup>
          <SlzToggle
            labelText="Use transit gateway"
            id="tg-enable"
            onToggle={this.handleEnableToggle}
            defaultToggled={this.state.enable_transit_gateway}
          />
          <SlzTextInput
            onChange={this.handleTextInput}
            componentName="transit gateway"
            field="Name"
            labelText="Name"
            value={this.props.slz.store.prefix + "-transit-gateway"}
            readOnly={true}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <ResourceGroupSelect
            component="transit gateway"
            slz={this.props.slz}
            value={this.state.transit_gateway_resource_group}
            handleInputChange={this.handleResourceGroupSelect}
          />
          <VpcListMultiSelect
            id="tg-vpc-multiselect"
            titleText="Connected VPCs"
            slz={this.props.slz}
            initialSelectedItems={this.state.transit_gateway_connections}
            onChange={this.handleVpcSelect}
            invalid={
              this.state.transit_gateway_connections.length === 0 &&
              this.state.enable_transit_gateway
            }
            invalidText="At least one VPC must be connected"
          />
        </SlzFormGroup>
      </div>
    );
  }
}
TransitGatewayForm.propTypes = {
  data: PropTypes.shape({
    enable_transit_gateway: PropTypes.bool.isRequired,
    transit_gateway_connections: PropTypes.array.isRequired,
    transit_gateway_resource_group: PropTypes.string.isRequired
  })
};

export default TransitGatewayForm;
