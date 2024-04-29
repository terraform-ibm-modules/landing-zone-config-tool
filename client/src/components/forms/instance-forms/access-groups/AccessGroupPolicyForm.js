import React from "react";
import {
  buildFormFunctions,
  buildFormDefaultInputMethods
} from "../../../component-utils.js";
import { stateInit } from "../../../../lib/index.js";
import {
  SlzNameInput,
  SlzHeading,
  SlzFormGroup,
  ResourceGroupSelect,
  SlzTextInput
} from "../../../icse/index.js";
import PropTypes from "prop-types";

class AccessGroupPolicyForm extends React.Component {
  constructor(props) {
    super(props);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.state = {
      ...stateInit("policies", this.props)
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputResource = this.handleInputResource.bind(this);
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
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputResource(event) {
    let { name, value } = event.target;
    let resources = { ...this.state.resources };
    resources[name] = value;
    this.setState({ resources });
  }

  render() {
    return (
      <>
        <SlzFormGroup>
          <SlzNameInput
            id="name"
            component="policies"
            field="name"
            value={this.state.name}
            componentProps={this.props}
            onChange={this.handleInputChange}
            className="marginRight"
            labelText="Name"
          />
        </SlzFormGroup>
        <SlzFormGroup className="marginBottomSmall">
          <SlzHeading name="Resource Configuration" type="subHeading" />
        </SlzFormGroup>

        <SlzFormGroup>
          <SlzTextInput
            id="resource"
            componentName="resource"
            tooltip={{
              content: "The resource of the policy definition",
              alignModal: "bottom-left"
            }}
            isModal={this.props.isModal}
            field="resource"
            value={this.state.resources.resource}
            componentProps={this.props}
            invalid={false}
            onChange={this.handleInputResource}
            labelText="Resource"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <ResourceGroupSelect
            isModal={this.props.isModal}
            labelText="Resource Group"
            tooltip={{
              content: "Name of the resource group the policy will apply to",
              alignModal: "bottom-left"
            }}
            component="resource_group"
            slz={this.props.slz}
            value={this.state.resources.resource_group || ""}
            disableInvalid
            invalid={false}
            handleInputChange={this.handleInputResource}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="resource_instance_id"
            componentName="resource_instance_id"
            isModal={this.props.isModal}
            field="resource_instance_id"
            value={this.state.resources.resource_instance_id}
            tooltip={{
              content: "ID of a service instance to give permissions"
            }}
            componentProps={this.props}
            invalid={false}
            labelText="Resource Instance ID"
            onChange={this.handleInputResource}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="service"
            componentName="service"
            tooltip={{
              content:
                'Name of the service type for the policy ex. "cloud-object-storage"',
              alignModal: "bottom-left",
              align: "top-left"
            }}
            labelText="Service Type"
            field="service"
            value={this.state.resources.service}
            componentProps={this.props}
            isModal={this.props.isModal}
            onChange={this.handleInputResource}
            invalid={false}
          />
        </SlzFormGroup>

        <SlzFormGroup>
          <SlzTextInput
            id="resource_type"
            componentName="resource_type"
            field="resource_type"
            tooltip={{
              content:
                'Name of the resource type for the policy ex. "resource-group"',
              alignModal: "bottom-left"
            }}
            invalid={false}
            value={this.state.resources.resource_type}
            componentProps={this.props}
            isModal={this.props.isModal}
            onChange={this.handleInputResource}
            labelText="Resource Type"
          />
        </SlzFormGroup>
      </>
    );
  }
}

AccessGroupPolicyForm.defaultProps = {
  data: {
    name: "",
    resources: {
      resource_group: "",
      resource_type: "",
      resource: "",
      service: "",
      resource_instance_id: ""
    }
  },
  isModal: false
};

AccessGroupPolicyForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      resource_group: PropTypes.string, // can be null
      resource_type: PropTypes.string.isRequired,
      resource: PropTypes.string.isRequired,
      service: PropTypes.string.isRequired,
      resource_instance_id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  isModal: PropTypes.bool.isRequired
};

export default AccessGroupPolicyForm;
