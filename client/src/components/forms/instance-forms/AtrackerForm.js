import React, { Component } from "react";
import {
  SlzTextInput,
  SlzSelect,
  ResourceGroupSelect,
  SlzFormGroup,
  SlzToggle,
  SlzModal,
} from "../../icse/index.js";
import { stateInit } from "../../../lib/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../component-utils.js";
import PropTypes from "prop-types";

/**
 * Atracker
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class AtrackerForm extends Component {
  constructor(props) {
    super(props);
    this.state = stateInit("atracker", this.props);
    this.state.showFsModal = false;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
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
   */
  handleToggle(name) {
    if (this.state.add_route && !this.state.showFsModal) {
      this.setState({
        showFsModal: true,
      });
    } else if (this.state.showFsModal && name !== "showFsModal") {
      this.setState({
        showFsModal: false,
        add_route: false,
      });
    } else {
      this.setState(this.toggleStateBoolean(name, this.state));
    }
  }

  render() {
    return (
      <div id="atracker-form">
        <SlzModal
          id="atracker-fs-cloud"
          heading="Environment will no longer be FS Cloud compliant"
          onRequestClose={() => this.handleToggle("showFsModal")}
          onRequestSubmit={() => this.handleToggle("add_route")}
          open={this.state.showFsModal}
          alert
          danger
          primaryButtonText="Continue"
          secondaryButtonText="Cancel"
        >
          Disabling the Activity Tracker route means your environment will{" "}
          <strong>no longer be FS Cloud Compliant.</strong> Are you sure you
          want to continue with this change?
        </SlzModal>
        <SlzFormGroup>
          <SlzTextInput
            componentName="Activity Tracker"
            field="Name"
            labelText="Name"
            className="fieldWidth"
            value={this.props.slz.store.prefix + "-atracker"}
            onChange={this.handleInputChange}
            readOnly
          />
          <ResourceGroupSelect
            slz={this.props.slz}
            component="Activity Tracker"
            value={this.state.resource_group}
            handleInputChange={this.handleInputChange}
            className="fieldWidth"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzSelect
            tooltip={{
              content:
                "The bucket name under the Cloud Object Storage instance where Activity Tracker logs will be stored",
            }}
            groups={this.props.slz.store.cosBuckets}
            component="Activity Tracker"
            field="collector_bucket_name"
            name="collector_bucket_name"
            value={this.state.collector_bucket_name || ""}
            handleInputChange={this.handleInputChange}
            className="fieldWidth"
            labelText="Object Storage log bucket"
            invalidText="Select an Object Storage bucket."
          />
          <SlzToggle
            tooltip={{
              content:
                "Must be enabled in order to forward all logs to the Cloud Object Storage bucket",
            }}
            labelText="Create Activity Tracker route"
            defaultToggled={this.state.add_route}
            toggleFieldName="add_route"
            onToggle={this.handleToggle}
            id="app-id-add-route"
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <SlzSelect
            tooltip={{
              content:
                "The IAM API key that has writer access to the Cloud Object Storage instance",
            }}
            component="atracker"
            name="atracker_key"
            groups={this.props.slz.store.cosKeys}
            value={this.state.atracker_key || ""}
            labelText="Privileged IAM Object Storage key"
            handleInputChange={this.handleInputChange}
            className="fieldWidth"
            invalidText="Select an Object Storage key."
          />
        </SlzFormGroup>
      </div>
    );
  }
}

export default AtrackerForm;

AtrackerForm.defaultProps = {
  isModal: false,
};

AtrackerForm.propTypes = {
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        atracker: PropTypes.shape({}).isRequired,
      }).isRequired,
      prefix: PropTypes.string.isRequired,
      cosKeys: PropTypes.array.isRequired,
      cosBuckets: PropTypes.array.isRequired,
    }).isRequired,
  }),
  isModal: PropTypes.bool.isRequired,
};
