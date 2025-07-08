import React, { Component } from "react";
import {
  ResourceGroupSelect,
  SubnetNameDropdown,
  VpcSelect,
  SlzFormGroup,
  SlzNameInput,
} from "../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../component-utils.js";
import { stateInit } from "../../../lib/index.js";
import PropTypes from "prop-types";

/**
 * vpn gateway form
 */
class VpnGatewayForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...stateInit("vpn_gateway", this.props) };
    this.handleInputChange = this.handleInputChange.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handle input change
   * @param {event} event
   */
  handleInputChange(event) {
    if (event.target.name === "vpc_name") {
      this.setState({
        vpc_name: event.target.value,
        subnet_name: "",
      });
    } else {
      this.setState(this.eventTargetToNameAndValue(event));
    }
  }

  render() {
    let composedId = `vpn-gateway-form-${this.props.data.name}-`;
    return (
      <>
        <SlzFormGroup>
          <SlzNameInput
            id={composedId}
            component="vpn_gateways"
            value={this.state.name}
            onChange={this.handleInputChange}
            componentProps={this.props}
          />
          <ResourceGroupSelect
            handleInputChange={this.handleInputChange}
            slz={this.props.slz}
            component={this.props.data.name}
            value={this.state.resource_group}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <VpcSelect
            id={composedId}
            component="VPN Gateway"
            name="vpc_name"
            slz={this.props.slz}
            handleInputChange={this.handleInputChange}
            value={this.state.vpc_name}
          />
          <SubnetNameDropdown
            component={this.props.data.name}
            key={this.state.vpc_name}
            vpc_name={this.state.vpc_name}
            slz={this.props.slz}
            value={this.state.subnet_name}
            invalid={
              this.state.subnet_name === null || this.state.subnet_name === ""
            }
            invalidText={
              this.state.vpc_name === null || this.state.vpc_name === ""
                ? "No VPC Selected"
                : "Select a Subnet"
            }
            handleInputChange={this.handleInputChange}
          />
        </SlzFormGroup>
      </>
    );
  }
}

VpnGatewayForm.defaultProps = {
  data: {
    name: "",
    resource_group: "",
    vpc_name: "",
    subnet_name: null,
  },
  isModal: false,
};

VpnGatewayForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    resource_group: PropTypes.string, // can be null
    vpc_name: PropTypes.string, // can be null
    subnet_name: PropTypes.string, // can be null
  }).isRequired,
  slz: PropTypes.shape({}).isRequired,
  isModal: PropTypes.bool.isRequired,
};

export default VpnGatewayForm;
