import React, { Component } from "react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../component-utils.js";
import { SlzFormGroup, SlzToggle, SlzNameInput } from "../../icse/index.js";
import PropTypes from "prop-types";

/** Resource groups
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class ResourceGroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data };
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }
  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   */
  handleToggle(name) {
    // Turn off the use_prefix toggle when create is turned off.
    if (name === "create" && this.state.create === true) {
      this.setState({ [name]: !this.state[name], use_prefix: false });
    } else {
      this.setState({ [name]: !this.state[name] });
    }
  }

  /**
   * Handle input change for a text field
   * @param {event} event
   */
  handleTextInput(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  render() {
    let composedId = `resource-group-${this.props.data.name}-`;
    return (
      <>
        {/*  Inputs */}
        <SlzFormGroup>
          {/* create */}
          <SlzToggle
            tooltip={{
              content: "If true, get data from an existing resource group",
            }}
            labelText="Use existing instance"
            toggleFieldName="create"
            defaultToggled={!this.state.create}
            id={composedId + "-create-toggle"}
            onToggle={() => this.handleToggle("create")}
            className="leftTextAlign"
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <SlzNameInput
            id={composedId}
            component="resource_groups"
            componentProps={this.props}
            value={this.state.name}
            onChange={this.handleTextInput}
            useData={
              this.state.create === false || this.state.use_prefix === false
            }
          />
          {/* use prefix only if create enabled */}
          {this.state.create && (
            <SlzToggle
              tooltip={{
                content:
                  "Add your environment prefix to the beginning of the resource group name.",
              }}
              labelText="Use prefix"
              defaultToggled={this.state.use_prefix}
              id={composedId + "-use-prefix-toggle"}
              onToggle={this.handleToggle}
              isModal={this.props.isModal}
            />
          )}
        </SlzFormGroup>
      </>
    );
  }
}

ResourceGroupForm.defaultProps = {
  data: {
    create: false,
    name: "",
    use_prefix: true,
  },
};

ResourceGroupForm.propTypes = {
  data: PropTypes.shape({
    create: PropTypes.bool,
    name: PropTypes.string.isRequired,
    use_prefix: PropTypes.bool,
  }),
  isModal: PropTypes.bool.isRequired,
};

export default ResourceGroupForm;
