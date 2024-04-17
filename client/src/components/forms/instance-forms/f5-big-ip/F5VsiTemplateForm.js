import React, { Component } from "react";
import { Button, PasswordInput } from "@carbon/react";
import {
  isNotNullOrEmptyString,
  isEmptyOrValidUrl,
  validTmosAdminPassword,
  stateInit
} from "../../../../lib/index.js";
import {
  SlzSelect,
  SlzFormGroup,
  PopoverWrapper,
  SlzTextInput
} from "../../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../../component-utils.js";
import { SlzToolTipWrapper } from "../../../wrappers/Tooltips.js";
import { Password } from "@carbon/icons-react";
import { getValidAdminPassword } from "../../../../lib/lib-utils.js";
import "./f5.css";

/**
 * F5VsiTemplateForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */

class F5VsiTemplateForm extends Component {
  constructor(props) {
    super(props);
    this.state = stateInit("f5_template_data", this.props);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleLicenseChange = this.handleLicenseChange.bind(this);
    this.generateAdminPassword = this.generateAdminPassword.bind(this);
  }

  /**
   * set state to event value
   * @param {event} event
   */
  handleTextInput(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * set conditional fields to null on license type change
   * @param {event} event
   */
  handleLicenseChange(event) {
    let { name, value } = event.target;
    let reset = {};
    let pool = [
      "license_username",
      "license_password",
      "license_host",
      "license_pool"
    ];
    let conditionalFields = {
      none: [],
      byol: ["byol_license_basekey"],
      regkeypool: pool,
      utilitypool: [
        "license_unit_of_measure",
        "license_sku_keyword_1",
        "license_sku_keyword_2",
        ...pool
      ]
    };

    this.setState(prevState => {
      conditionalFields[prevState.license_type].forEach(field => {
        if (!conditionalFields[value].includes(field)) {
          reset[field] = "";
        }
      });
      return {
        [name]: value,
        ...reset
      };
    });
  }

  /**
   * get a valid admin password between 15-20 characters
   */
  generateAdminPassword() {
    let length = Math.floor(Math.random() * 6 + 15); // between 15-20 chars, inclusive (20 - 15 + 1)
    let password = getValidAdminPassword(length); // get a valid password
    this.setState({ tmos_admin_password: password }); // set password
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          {/* license_type */}
          <SlzSelect
            tooltip={{
              content: "The type of license.",
              align: "top-left"
            }}
            labelText="License Type"
            component="f5-license-type"
            name="license_type"
            groups={["none", "byol", "regkeypool", "utilitypool"]}
            value={this.state.license_type}
            className="fieldWidthSmaller"
            handleInputChange={this.handleLicenseChange}
          />
          {/* tmos_admin_password */}
          <div className="textInputWide leftTextAlign tooltip">
            <SlzToolTipWrapper
              tooltip={{
                content:
                  "The admin account password for the F5 BIG-IP instance."
              }}
              innerForm={PasswordInput}
              id="tmos_admin_password"
              labelText="TMOS Admin Password"
              name="tmos_admin_password"
              value={this.state.tmos_admin_password || ""}
              invalid={!validTmosAdminPassword(this.state.tmos_admin_password)}
              invalidText="Password must be at least 15 characters, contain one numeric, one uppercase, and one lowercase character."
              onChange={this.handleTextInput}
              className="textInputWide"
            />
          </div>
          <PopoverWrapper
            hoverText="Generate Password"
            className={
              "passwordGenerateButton" +
              (validTmosAdminPassword(this.state.tmos_admin_password)
                ? ""
                : " invalid")
            }
          >
            <Button
              kind="ghost"
              onClick={this.generateAdminPassword}
              className="forceTertiaryButtonStyles"
            >
              <Password />
            </Button>
          </PopoverWrapper>
        </SlzFormGroup>
        {/* If license_type = "none", omit everything up until template version */}
        {this.state.license_type != "none" && (
          <>
            {/* If license_type = "regkeypool", omit everything up until License Username */}
            {/* Only display if license_type = byol */}
            {this.state.license_type != "regkeypool" &&
              this.state.license_type == "byol" && (
                <SlzFormGroup>
                  {/* byol_license_basekey */}
                  <SlzToolTipWrapper
                    tooltip={{
                      content:
                        "Bring your own license registration key for the F5 BIG-IP instance."
                    }}
                    innerForm={SlzTextInput}
                    value={this.state.byol_license_basekey || ""}
                    onChange={this.handleTextInput}
                    field="byol_license_basekey"
                    component="F5 VSI"
                    className="textInputWide"
                    invalid={
                      !isNotNullOrEmptyString(this.state.byol_license_basekey)
                    }
                  />
                </SlzFormGroup>
              )}
            {/* If license_type = "byol", omit everything up until template version */}
            {this.state.license_type != "byol" && (
              <>
                <SlzFormGroup>
                  {/* license_username */}
                  <SlzToolTipWrapper
                    tooltip={{
                      content:
                        "BIGIQ username to use for the pool based licensing of the F5 BIG-IP instance.",
                      align: "top-left"
                    }}
                    innerForm={SlzTextInput}
                    value={this.state.license_username || ""}
                    onChange={this.handleTextInput}
                    field="license_username"
                    component="License Username"
                    className="fieldWidthSmaller"
                    invalid={
                      !isNotNullOrEmptyString(this.state.license_username)
                    }
                  />

                  {/* license_password */}
                  <div className="textInputWide leftTextAlign tooltip">
                    <SlzToolTipWrapper
                      tooltip={{
                        content:
                          "BIGIQ password to use for the pool based licensing of the F5 BIG-IP instance."
                      }}
                      innerForm={PasswordInput}
                      labelText="License Password"
                      name="license_password"
                      id="license_password"
                      className="textInputWide"
                      value={this.state.license_password || ""}
                      onChange={this.handleTextInput}
                    />
                  </div>
                </SlzFormGroup>
                <SlzFormGroup>
                  {/* license_host */}
                  <SlzToolTipWrapper
                    tooltip={{
                      content:
                        "BIGIQ IP or hostname to use for pool based licensing of the F5 BIG-IP instance.",
                      align: "top-left"
                    }}
                    innerForm={SlzTextInput}
                    value={this.state.license_host || ""}
                    onChange={this.handleTextInput}
                    field="license_host"
                    component="F5 VSI"
                    className="fieldWidthSmaller"
                    invalid={!isNotNullOrEmptyString(this.state.license_host)}
                  />

                  {/* license_pool */}
                  <SlzToolTipWrapper
                    tooltip={{
                      content:
                        "BIGIQ license pool name of the pool based licensing of the F5 BIG-IP instance."
                    }}
                    innerForm={SlzTextInput}
                    value={this.state.license_pool || ""}
                    onChange={this.handleTextInput}
                    field="license_pool"
                    component="F5 VSI"
                    className="fieldWidthSmaller"
                    invalid={!isNotNullOrEmptyString(this.state.license_pool)}
                  />

                  {/* license_unit_of_measure */}
                  {/* Only display if license_type = utilitypool */}
                  {this.state.license_type == "utilitypool" && (
                    <SlzToolTipWrapper
                      tooltip={{
                        content: "BIGIQ utility pool unit of measurement."
                      }}
                      innerForm={SlzTextInput}
                      value={this.state.license_unit_of_measure || ""}
                      onChange={this.handleTextInput}
                      field="license_unit_of_measure"
                      component="F5 VSI"
                      className="fieldWidthSmaller"
                      invalid={
                        !isNotNullOrEmptyString(
                          this.state.license_unit_of_measure
                        )
                      }
                    />
                  )}
                </SlzFormGroup>
                {/* Only display if license_type = utilitypool */}
                {this.state.license_type == "utilitypool" && (
                  <SlzFormGroup>
                    {/* license_sku_keyword_1 */}
                    <SlzToolTipWrapper
                      tooltip={{
                        content:
                          "BIGIQ primary SKU for ELA utility licensing of the F5 BIG-IP instance."
                      }}
                      innerForm={SlzTextInput}
                      value={this.state.license_sku_keyword_1 || ""}
                      onChange={this.handleTextInput}
                      field="license_sku_keyword_1"
                      component="F5 VSI"
                      className="fieldWidthSmaller"
                      invalid={
                        !isNotNullOrEmptyString(
                          this.state.license_sku_keyword_1
                        )
                      }
                    />

                    {/* license_sku_keyword_2 */}
                    {/* Only display if license_type = utilitypool */}
                    <SlzToolTipWrapper
                      tooltip={{
                        content:
                          "BIGIQ secondary SKU for ELA utility licensing of the F5 BIG-IP instance"
                      }}
                      innerForm={SlzTextInput}
                      value={this.state.license_sku_keyword_2 || ""}
                      onChange={this.handleTextInput}
                      field="license_sku_keyword_2"
                      component="F5 VSI"
                      className="fieldWidthSmaller"
                      invalid={
                        !isNotNullOrEmptyString(
                          this.state.license_sku_keyword_2
                        )
                      }
                    />
                  </SlzFormGroup>
                )}
              </>
            )}
          </>
        )}
        <SlzFormGroup>
          {/* template_version */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The terraform template version for phone_home_url_metadata.",
              align: "top-left"
            }}
            innerForm={SlzTextInput}
            value={this.state.template_version}
            onChange={this.handleTextInput}
            field="template_version"
            component="F5 VSI"
            className="fieldWidthSmaller"
            invalid={!isNotNullOrEmptyString(this.state.template_version)}
          />
          {/* template_source */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The terraform template source for phone_home_url_metadata."
            }}
            innerForm={SlzTextInput}
            value={this.state.template_source}
            onChange={this.handleTextInput}
            field="template_source"
            component="F5 VSI"
            className="textInputWide"
            invalid={!isNotNullOrEmptyString(this.state.template_source)}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* phone_home_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to POST status when BIG-IP is finished onboarding.",
              align: "top-left"
            }}
            innerForm={SlzTextInput}
            value={this.state.phone_home_url}
            onChange={this.handleTextInput}
            field="phone_home_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.phone_home_url)}
          />
          {/* app_id */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The terraform application id for phone_home_url_metadata."
            }}
            innerForm={SlzTextInput}
            labelText="App ID"
            value={this.state.app_id}
            onChange={this.handleTextInput}
            field="app_id"
            component="F5 VSI"
            className="textInputMedium"
            invalid={false}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* do_declaration_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to retrieve the f5-declarative-onboarding JSON declaration.",
              align: "top-left"
            }}
            innerForm={SlzTextInput}
            value={this.state.do_declaration_url}
            onChange={this.handleTextInput}
            field="do_declaration_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.do_declaration_url)}
          />
          {/* as3_declaration_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to retrieve the f5-appsvcs-extension JSON declaration."
            }}
            innerForm={SlzTextInput}
            value={this.state.as3_declaration_url}
            onChange={this.handleTextInput}
            field="as3_declaration_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.as3_declaration_url)}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* ts_declaration_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to retrieve the f5-telemetry-streaming JSON declaration.",
              align: "top-left"
            }}
            innerForm={SlzTextInput}
            value={this.state.ts_declaration_url}
            onChange={this.handleTextInput}
            field="ts_declaration_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.ts_declaration_url)}
          />
          {/* tgstandby_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to POST L3 addresses when tgstandby is triggered."
            }}
            innerForm={SlzTextInput}
            value={this.state.tgstandby_url}
            onChange={this.handleTextInput}
            field="tgstandby_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.tgstandby_url)}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {/* tgrefresh_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to POST L3 addresses when tgrefresh is triggered.",
              align: "top-left"
            }}
            innerForm={SlzTextInput}
            value={this.state.tgrefresh_url}
            onChange={this.handleTextInput}
            field="tgrefresh_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.tgrefresh_url)}
          />
          {/* tgactive_url */}
          <SlzToolTipWrapper
            tooltip={{
              content:
                "The URL to POST L3 addresses when tgactive is triggered."
            }}
            innerForm={SlzTextInput}
            value={this.state.tgactive_url}
            onChange={this.handleTextInput}
            field="tgactive_url"
            component="F5 VSI"
            className="textInputMedium"
            invalid={!isEmptyOrValidUrl(this.state.tgactive_url)}
          />
        </SlzFormGroup>
      </>
    );
  }
}

// only refernece to props in state init
// propTypes not added here intentionally

export default F5VsiTemplateForm;
