import React from "react";
import { Button, TextArea, Modal } from "@carbon/react";
import { CheckmarkFilled, Misuse } from "@carbon/icons-react";
import { SlzHeading, SlzFormGroup } from "../icse/index.js";
import PropTypes from "prop-types";
import { validate } from "../../lib/index.js";

class CustomJson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textData: "",
      errorList: "",
      isValid: false,
      showModal: false,
      validJson: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  /**
   * handle text change
   * @param {event} event
   */
  handleChange(event) {
    let data = event.target.value; // new data
    let errorText = ""; // errors
    let isValid = false; // submission valid
    let validatedConfigJson = null; // configuration
    // function to mock slz.sendError
    let getErrors = function(message) {
      errorText = message;
    };

    // try to validate json
    try {
      // validation adds optional fields to needed components to ensure that
      // it is compatible with terraform. data will be stored here
      validatedConfigJson = validate(JSON.parse(data));
    } catch (err) {
      // on error, set error text to message
      errorText = err.message;
    }

    // if error text empty, set valid to true
    if (errorText === "") {
      errorText = "JSON Successfully Validated.";
      isValid = true;
    }

    // set state
    this.setState({
      textData: data,
      errorList: errorText,
      isValid: isValid,
      validJson: isValid ? validatedConfigJson : null
    });
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleSubmit() {
    this.props.slz.hardSetConfigDotJson(this.state.validJson);
    this.toggleModal();
    window.location.pathname = "/resourceGroups";
  }

  render() {
    return (
      <div>
        <SlzHeading name="Import existing override.json data for landing zone configuration tool terraform deployment." />
        <div className="marginTop displayFlex marginBottomSmall">
          <p>
            {"For more information, visit the "}
            <a
              href="https://github.com/open-toolchain/landing-zone#using-overridejson"
              target="_blank"
            >
              SLZ Override JSON Documentation
            </a>
            .
          </p>
        </div>
        <SlzFormGroup>
          <TextArea
            labelText="Custom landing zone configuration tool data"
            rows={20}
            cols={75}
            value={this.state.textData}
            placeholder="Paste your override JSON here"
            onChange={this.handleChange}
            invalid={!this.state.isValid}
            invalidText={this.state.errorList}
            className="codeFont"
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <Button
            kind="tertiary"
            disabled={this.state.isValid === false ? true : false}
            onClick={this.toggleModal}
          >
            {this.state.isValid ? (
              <CheckmarkFilled className="marginRightSmall" />
            ) : (
              <Misuse className="marginRightSmall" />
            )}
            Submit JSON
          </Button>
        </SlzFormGroup>
        {this.state.showModal && (
          <Modal
            className="leftTextAlign"
            modalHeading="Are you sure you want to add custom JSON data?"
            open={this.state.showModal}
            onRequestSubmit={this.handleSubmit}
            onRequestClose={this.toggleModal}
            primaryButtonText="Submit"
            secondaryButtonText="Cancel"
            danger
          >
            <p>
              Importing custom data will overwrite any changes, these actions
              cannot be undone.
            </p>
          </Modal>
        )}
      </div>
    );
  }
}

CustomJson.propTypes = {
  slz: PropTypes.shape({
    hardSetConfigDotJson: PropTypes.func.isRequired
  }).isRequired
};

export default CustomJson;
