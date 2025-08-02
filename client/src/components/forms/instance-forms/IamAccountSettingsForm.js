import { TextArea, NumberInput } from "@carbon/react";
import React, { Component } from "react";
import { SlzSelect, SlzFormGroup, SlzToggle } from "../../icse/index.js";
import {
  iamItems,
  restrictMenuItems,
  defaultToEmptyStringIfValueNull,
  iamAccountSettingsInvalidIpString,
  iamAccountSettingsInvalidNumber,
  iamAccountSettingsInvalidRange,
} from "../../../lib/index.js";
import { buildFormFunctions } from "../../component-utils.js";
import { SlzToolTipWrapper } from "../../wrappers/Tooltips.js";
import PropTypes from "prop-types";
import { contains } from "lazy-z";

/**
 * IAM Account Settings
 * @param {Object} props
 * @param {slzStateStore} props.slz slz state store
 */

class IamAccountSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.slz.store.configDotJson.iam_account_settings };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.state.enable = true;
    buildFormFunctions(this);
    if (this.state.include_history === null) {
      this.state.include_history = false;
    }
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    let target = event.target; // shortcut for target
    let name = target.name; // name of component
    var value = target.value;
    if (
      contains(
        ["session_expiration_in_seconds", "session_invalidation_in_seconds"],
        name,
      ) &&
      value.length > 0
    ) {
      value = parseInt(value);
    }
    if (value === "") value = null;
    this.setState({ [name]: value });
  }

  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   * @param {bool} setDefaults set default values, default is false
   */
  handleToggle(name) {
    this.setState({ [name]: !this.state[name] });
  }

  /**
   * Handle input change for a text field
   * @param {event} event
   */
  handleTextInput(event) {
    // removing white space and checking for empty value
    let value = event.target.value.replace(/\s*/g, "");
    if (value === "") value = null;
    // set state even if invalid (checked for correct format in ipInvalid function)
    // submit is blocked until state matches desired value
    this.setState({ allowed_ip_addresses: value });
  }

  /**
   * Handle input change for a select
   * @param {event} event
   */
  handleSelectChange(event) {
    let name = event.target.name;
    let item = event.target.value;
    this.setState({ [name]: iamItems[item].value });
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          {/* if match number input*/}
          <SlzToolTipWrapper
            className="fieldWidthSmaller leftTextAlign"
            tooltip={{
              content:
                'Version of the account settings to update, if no value is supplied then the default value "*" is used to indicate to update any version available. This might result in stale updates.',
              align: "top-left",
            }}
            innerForm={NumberInput}
            id="iam-if-match"
            placeholder="1"
            labelText="Version"
            allowEmpty={true}
            value={defaultToEmptyStringIfValueNull(this.state.if_match)}
            min={1}
            step={1}
            onChange={this.handleInputChange}
            name="if_match"
            hideSteppers={true}
            {...iamAccountSettingsInvalidNumber(this.state.if_match)}
            noLabelText
          />
          {/* mfa dropdown*/}
          <SlzSelect
            component="IAM Account Settings"
            name="mfa"
            groups={[
              "NONE",
              "TOTP",
              "TOTP4ALL",
              "Email-Based MFA",
              "TOTP MFA",
              "U2F MFA",
            ]}
            value={iamItems[this.state.mfa].display || "NONE"}
            labelText="Multi-Factor Authentication"
            handleInputChange={this.handleSelectChange}
            className="textInputMedium leftTextAlign"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* include history toggle */}
          <SlzToggle
            tooltip={{
              content:
                "Defines if the entity history is included in the response.",
              align: "top-left",
            }}
            labelText="Include History"
            defaultToggled={this.state.include_history}
            onToggle={() => this.handleToggle("include_history")}
            className="fieldWidthSmaller"
            id="iam-include-history"
          />
          {/* service id dropdown */}
          <SlzSelect
            component="IAM Account Settings"
            name="restrict_create_service_id"
            groups={restrictMenuItems}
            value={
              iamItems[this.state.restrict_create_service_id].display ||
              restrictMenuItems[0]
            }
            labelText="Restrict Creation of Service IDs"
            handleInputChange={this.handleSelectChange}
            className="leftTextAlign"
          />
          {/* platform api key dropdown*/}
          <SlzSelect
            component="IAM Account Settings"
            name="restrict_create_platform_apikey"
            groups={restrictMenuItems}
            value={
              iamItems[this.state.restrict_create_platform_apikey].display ||
              restrictMenuItems[0]
            }
            labelText="Restrict Creation of API Keys"
            handleInputChange={this.handleSelectChange}
            className="leftTextAlign"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* max sessions */}
          <NumberInput
            placeholder="1"
            label="Max Sessions Per Identity"
            id="iam-max-sessions-per-id"
            allowEmpty={true}
            value={defaultToEmptyStringIfValueNull(
              this.state.max_sessions_per_identity,
            )}
            min={1}
            step={1}
            onChange={this.handleInputChange}
            name="max_sessions_per_identity"
            hideSteppers={true}
            {...iamAccountSettingsInvalidNumber(
              this.state.max_sessions_per_identity,
            )}
            className="fieldWidthSmaller leftTextAlign"
          />
          {/* session expiration */}
          <NumberInput
            placeholder="900"
            label="Session Expiration (sec)"
            id="iam-session-expiration-seconds"
            allowEmpty={true}
            value={this.state.session_expiration_in_seconds || ""}
            step={1}
            onChange={this.handleInputChange}
            name="session_expiration_in_seconds"
            hideSteppers={true}
            min={900}
            max={86400}
            {...iamAccountSettingsInvalidRange(
              this.state.session_expiration_in_seconds,
              900,
              86400,
            )}
            className="fieldWidth leftTextAlign"
          />
          {/* session invalidation */}
          <NumberInput
            placeholder="900"
            label="Session Invalidation (sec)"
            id="iam-session-invalidation-seconds"
            allowEmpty={true}
            value={defaultToEmptyStringIfValueNull(
              this.state.session_invalidation_in_seconds,
            )}
            step={1}
            onChange={this.handleInputChange}
            name="session_invalidation_in_seconds"
            hideSteppers={true}
            {...iamAccountSettingsInvalidRange(
              this.state.session_invalidation_in_seconds,
              900,
              7200,
            )}
            className="fieldWidth leftTextAlign"
            min={900}
            max={7200}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* text area for allowed ips */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "IP addresses and subnets from which IAM tokens can be created for the account",
              align: "top-left",
            }}
            className="fitContent"
            innerForm={TextArea}
            id="iam-allowed-ip"
            labelText="Allowed IPs"
            onChange={this.handleTextInput}
            placeholder={
              this.state.allowed_ip_addresses || "X.X.X.X, X.X.X.X/X, ..."
            }
            {...iamAccountSettingsInvalidIpString(
              this.state.allowed_ip_addresses,
            )}
          />
        </SlzFormGroup>
      </>
    );
  }
}

IamAccountSettingsForm.propTypes = {
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        iam_account_settings: PropTypes.shape({}).isRequired,
      }).isRequired,
    }),
  }),
};

export default IamAccountSettingsForm;
