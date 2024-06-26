import React, { Component } from "react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import { stateInit } from "../../../lib/index.js";
import {
  SlzNameInput,
  SlzNumberSelect,
  SlzFormGroup,
  SlzToggle
} from "../../icse/index.js";
import PropTypes from "prop-types";

/**
 * kms keys
 */
class EncryptionKeyForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...stateInit("encryption_key", this.props), show: false };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.toggleShow = this.toggleShow.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   */
  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  /**
   * Handle input change for a text field
   * @param {event} event
   */
  handleTextInput(event) {
    this.setState({ name: event.target.value });
  }

  // Handle toggle for showing/hiding details of keys
  toggleShow() {
    this.setState({ show: !this.state.show });
  }

  render() {
    let composedId = `encryption-key-${this.props.data.name}-`;
    return (
      <>
        {/* edit name */}
        <SlzFormGroup>
          <SlzNameInput
            id={this.state.name + "-name"}
            component="kms_key"
            componentName={this.props.data.name}
            value={this.state.name}
            onChange={this.handleTextInput}
            componentProps={this.props}
            placeholder="my-encryption-key-name"
          />
          <SlzNumberSelect
            tooltip={{
              content:
                "Setting a rotation policy shortens the lifetime of the key at regular intervals. When it's time to rotate the key based on the rotation interval that you specify, the root key will be automatically replaced with new key material."
            }}
            component={this.props.data.name}
            max={12}
            value={this.state.interval_month}
            name="interval_month"
            labelText="Rotation interval (months)"
            handleInputChange={this.handleInputChange}
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          {/* edit root key */}
          <SlzToggle
            tooltip={{
              content:
                "Root keys are symmetric key-wrapping keys used as roots of trust for encrypting and decrypting other keys. They can be imported or generated by IBM Key Protect.",
              link:
                "https://cloud.ibm.com/docs/key-protect?topic=key-protect-envelope-encryption",
              alignModal: "bottom-left"
            }}
            id={composedId + "kms-key-root"}
            labelText="Set as a root key"
            toggleFieldName="root_key"
            onToggle={this.handleToggle}
            defaultToggled={this.state.root_key}
            isModal={this.props.isModal}
          />
          {/* force delete */}
          <SlzToggle
            tooltip={{
              content:
                "Force deletion of a key refers to the deletion of any key that's actively protecting any registered cloud resources. KMS keys can be force-deleted by managers of the instance. However, the force-delete won't succeed if the key's associated resource is non-erasable due to a retention policy."
            }}
            id={composedId + "kms-key-force-delete"}
            labelText="Force deletion of KMS key"
            toggleFieldName="force_delete"
            defaultToggled={this.state.force_delete}
            onToggle={this.handleToggle}
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
      </>
    );
  }
}

EncryptionKeyForm.defaultProps = {
  data: {
    name: "",
    root_key: false,
    force_delete: false,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  },
  isModal: false
};

EncryptionKeyForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    root_key: PropTypes.bool.isRequired,
    force_delete: PropTypes.bool,
    policies: PropTypes.shape({
      rotation: PropTypes.shape({
        interval_month: PropTypes.number.isRequired
      })
    })
  }).isRequired,
  isModal: PropTypes.bool.isRequired
};

export default EncryptionKeyForm;
