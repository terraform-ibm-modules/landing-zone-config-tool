import React, { Component } from "react";
import {
  SlzSelect,
  SlzFormGroup,
  SlzToggle,
  SlzNameInput
} from "../../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../../component-utils.js";
import { parentHasRandomSuffix } from "../../../../lib/form-utils.js";
import PropTypes from "prop-types";

class ObjectStorageKeyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.data.name,
      role: this.props.data.role || "Writer",
      enable_HMAC: this.props.data.enable_HMAC
    };
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * Handler for toggle
   * @param {String} name specifies the name of the state value you wish to change
   */
  handleToggle() {
    this.setState(this.toggleStateBoolean("enable_HMAC", this.state));
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  render() {
    // composed id
    let composedId = `${this.props.arrayParentName}-key-form-${
      this.props.data.name ? this.props.data.name : "new-key"
    }`;
    let fieldWidth = this.props.isModal ? "fieldWidthSmaller" : "fieldWidth";
    return (
      <>
        <SlzFormGroup noMarginBottom>
          {/* edit name */}
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name}
            component="cos_keys"
            value={this.state.name}
            onChange={this.handleInputChange}
            componentProps={this.props}
            placeholder="my-cos-key-name"
            random_suffix={parentHasRandomSuffix(this.props)}
            className={fieldWidth}
          />
          {/* role */}
          <SlzSelect
            component={this.props.data.name}
            name="role"
            groups={[
              "Object Writer",
              "Object Reader",
              "Content Reader",
              "Reader",
              "Writer",
              "Manager"
            ]}
            value={this.state.role}
            labelText="Role"
            handleInputChange={this.handleInputChange}
            className={fieldWidth}
          />
          {/* use hmac */}
          <SlzToggle
            tooltip={{
              link:
                "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-uhc-hmac-credentials-main",
              content:
                "HMAC (hash-based message authentication code) is required for Teleport VSI instances."
            }}
            id={composedId + "cos-instance-key-hmac"}
            labelText="Enable HMAC"
            defaultToggled={
              this.props.isTeleport ? true : this.state.enable_HMAC
            }
            onToggle={this.handleToggle}
            isModal={this.props.isModal}
            disabled={this.props.isTeleport}
          />
        </SlzFormGroup>
      </>
    );
  }
}

ObjectStorageKeyForm.defaultProps = {
  data: {
    name: "",
    enable_HMAC: false
  }
};

ObjectStorageKeyForm.propTypes = {
  arrayParentName: PropTypes.string.isRequired,
  isModal: PropTypes.bool,
  data: PropTypes.shape({
    enable_HMAC: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string
  }),
  shouldDisableSave: PropTypes.func,
  shouldDisableSubmit: PropTypes.func,
  isTeleport: PropTypes.bool,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        cos: PropTypes.array.isRequired
      })
    })
  })
};

export default ObjectStorageKeyForm;
