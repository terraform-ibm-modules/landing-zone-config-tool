import React, { Component } from "react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import { stateInit } from "../../../lib/index.js";
import {
  SlzNameInput,
  SlzFormGroup,
  KmsKeySelect,
  ResourceGroupSelect
} from "../../icse/index.js";
import PropTypes from "prop-types";

/**
 * SecretsManagerForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class SecretsManagerForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...stateInit("secrets_manager", this.props) };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    buildFormDefaultInputMethods(this);
    buildFormFunctions(this);
    this.state.use_secrets_manager = true;
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   * @param {bool} setDefaults set default values, default is false
   */
  handleToggle() {
    this.setState(this.toggleStateBoolean("use_secrets_manager", this.state));
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          {/* name text input */}
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName="Secrets Manager"
            component="secrets_manager"
            value={this.state.name}
            onChange={this.handleInputChange}
            componentProps={this.props}
          />
          {/* Select Resource Group */}
          <ResourceGroupSelect
            slz={this.props.slz}
            component="Secrets Manager"
            handleInputChange={this.handleInputChange}
            value={this.state.resource_group}
          />
        </SlzFormGroup>
        <div className="fieldWidth">
          {/* Select Key Management Service Key */}
          <KmsKeySelect
            value={this.state.kms_key_name}
            component="Secrets Manager"
            slz={this.props.slz}
            name="kms_key_name"
            handleInputChange={this.handleInputChange}
          />
        </div>
      </>
    );
  }
}

SecretsManagerForm.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        secrets_manger: PropTypes.shape({
          use_secrets_manager: PropTypes.bool.isRequired,
          name: PropTypes.string,
          resource_group: PropTypes.string,
          kms_key_name: PropTypes.string
        })
      }).isRequired
    }).isRequired
  }).isRequired
};

export default SecretsManagerForm;
