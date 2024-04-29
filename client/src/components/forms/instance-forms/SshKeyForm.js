import React, { Component } from "react";
import { TextInput } from "@carbon/react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import { hasInvalidSshPublicKey } from "../../../lib/index.js";
import PropTypes from "prop-types";
import { SlzNameInput, SlzFormGroup, ResourceGroupSelect } from "../../icse/index.js";

/**
 * ssh key form
 */
class SSHKeyForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data };
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle other input events
   * @param {*} event
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }
  render() {
    let invalidPublicKey = hasInvalidSshPublicKey(this.state, this.props);
    return (
      <>
        <SlzFormGroup>
          {/* name */}
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name + "-ssh-key-name"}
            component="ssh_keys"
            componentProps={this.props}
            value={this.state.name}
            onChange={this.handleInputChange}
          />
          {/* resource group */}
          <ResourceGroupSelect
            component={this.props.data.name + "-ssh-rg"}
            slz={this.props.slz}
            value={this.state.resource_group}
            handleInputChange={this.handleInputChange}
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <div className="textInputWide leftTextAlign">
            <form><TextInput.PasswordInput
              labelText="Public Key"
              name="public_key"
              autoComplete="public_key"
              id={this.props.data.name + "-ssh-public-key"}
              {...invalidPublicKey}
              value={this.state.public_key}
              onChange={this.handleInputChange}
            /></form>
          </div>
        </SlzFormGroup>
      </>
    );
  }
}

SSHKeyForm.defaultProps = {
  data: {
    name: "",
    resource_group: "",
    public_key: ""
  },
  isModal: false
};

SSHKeyForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    resource_group: PropTypes.string,
    public_key: PropTypes.string.isRequired
  }).isRequired,
  slz: PropTypes.shape({}).isRequired,
  isModal: PropTypes.bool.isRequired
};

export default SSHKeyForm;
