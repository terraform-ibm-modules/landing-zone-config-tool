import React, { Component } from "react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../../component-utils.js";
import {
  ObjectStorageBuckets,
  ObjectStorageKeys,
} from "../../SlzArrayForms.js";
import PropTypes from "prop-types";
import {
  ResourceGroupSelect,
  SlzFormGroup,
  SlzToggle,
  SlzNameInput,
} from "../../../icse/index.js";

/**
 * Object storage
 */
class ObjectStorageInstancesForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data };
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in the instance
   * @param {*} value value
   */
  handleInputChange(name, value) {
    let inst = { ...this.state };
    inst[name] = value;
    this.setState({ ...inst });
  }

  render() {
    let composedId = `object-storage-form-${this.props.data.name}-`;
    return (
      <>
        <SlzFormGroup>
          <SlzToggle
            tooltip={{
              content:
                "Service credentials and buckets will be created for your environment even when using an existing Object Storage instance.",
            }}
            id={composedId + "use-data"}
            toggleFieldName="use_data"
            labelText="Use Existing Instance"
            defaultToggled={this.state.use_data}
            onToggle={this.handleInputChange}
            className="fieldWidth"
            isModal={this.props.isModal}
          />
          <SlzToggle
            tooltip={{
              content:
                "Object Storage bucket names must be unique across an account. Append a random suffix to maintain unique names across deployments.",
            }}
            id={composedId + "random-suffix"}
            labelText="Append random suffix to names"
            toggleFieldName="random_suffix"
            defaultToggled={this.state.random_suffix}
            onToggle={this.handleInputChange}
            className="fieldWidth"
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
        {/* edit name */}
        <SlzFormGroup>
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name}
            component="cos"
            value={this.state.name}
            onChange={(event) =>
              this.handleInputChange("name", event.target.value)
            }
            componentProps={this.props}
            useData={this.state.use_data}
            random_suffix={this.state.random_suffix}
            placeholder="my-cos-name"
          />
          <ResourceGroupSelect
            slz={this.props.slz}
            component={this.props.data.name}
            value={this.state.resource_group}
            handleInputChange={(event) =>
              this.handleInputChange("resource_group", event.target.value)
            }
            className="fieldWidth"
          />
        </SlzFormGroup>
        {/* show keys and buckets if not modal */}
        {this.props.isModal !== true && (
          <>
            <ObjectStorageKeys
              slz={this.props.slz}
              arrayParentName={this.props.data.name}
            />
            <ObjectStorageBuckets
              slz={this.props.slz}
              arrayParentName={this.props.data.name}
            />
          </>
        )}
      </>
    );
  }
}

ObjectStorageInstancesForm.defaultProps = {
  data: {
    name: "",
    use_data: false,
    resource_group: "",
    random_suffix: true,
    keys: [],
    buckets: [],
  },
};

ObjectStorageInstancesForm.propTypes = {
  isModal: PropTypes.bool,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    use_data: PropTypes.bool.isRequired,
    resource_group: PropTypes.string,
    random_suffix: PropTypes.bool.isRequired,
    keys: PropTypes.array,
    buckets: PropTypes.array,
  }),
  shouldDisableSave: PropTypes.func,
  shouldDisableSubmit: PropTypes.func,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        cos: PropTypes.array.isRequired,
      }),
    }),
  }),
};

export default ObjectStorageInstancesForm;
