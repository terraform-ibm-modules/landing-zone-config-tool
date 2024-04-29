import React from "react";
import {
  buildFormFunctions,
  buildFormDefaultInputMethods
} from "../../../component-utils.js";
import { stateInit } from "../../../../lib/index.js";
import { AccessGroupPolicies } from "../../SlzArrayForms.js";
import { AccessGroupDynamicPolicies } from "../../SlzArrayForms.js";
import { SlzTextInput, SlzNameInput, SlzFormGroup } from "../../../icse/index.js";
import PropTypes from "prop-types";

class AccessGroupForm extends React.Component {
  constructor(props) {
    super(props);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);

    this.state = {
      ...stateInit("access_groups", this.props)
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          {/* vpc name */}
          <SlzNameInput
            id="name"
            component="access_groups"
            componentName="access_groups"
            value={this.state.name}
            onChange={this.handleInputChange}
            componentProps={this.props}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="description"
            componentName="description"
            tooltip={{
              content: "Description of the access group"
            }}
            field="description"
            labelText="Description"
            value={this.state.description}
            componentProps={this.props}
            onChange={this.handleInputChange}
            isModal={this.props.isModal}
            invalid={false}
            className="textInputWide"
          />
        </SlzFormGroup>
        {!this.props.isModal && (
          <>
            <AccessGroupPolicies
              slz={this.props.slz}
              arrayParentName={this.props.data.name}
            />
            <AccessGroupDynamicPolicies
              slz={this.props.slz}
              arrayParentName={this.props.data.name}
            />
          </>
        )}
      </>
    );
  }
}

AccessGroupForm.defaultProps = {
  data: {
    name: "",
    description: ""
  },
  isModal: false
};

AccessGroupForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  slz: PropTypes.shape({}).isRequired,
  isModal: PropTypes.bool.isRequired
};

export default AccessGroupForm;
