import { capitalize } from "lazy-z";
import React, { Component } from "react";
import {
  SlzSelect,
  KmsKeySelect,
  SlzFormGroup,
  SlzToggle,
  SlzNameInput
} from "../../../icse/index.js";
import { buildFormFunctions } from "../../../component-utils.js";
import PropTypes from "prop-types";
import { parentHasRandomSuffix } from "../../../../lib/index.js";

/**
 * Object storage
 */
class ObjectStorageBucketForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endpoint_type: "public",
      force_delete: this.props.data.force_delete,
      kms_key: this.props.isModal ? "" : this.props.data.kms_key,
      name: this.props.data.name,
      storage_class: this.props.data.storage_class
    };
    buildFormFunctions(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle input change
   * @param {string} name field to set in state
   * @param {*} value value to set
   */
  handleInputChange(name, value) {
    this.setState({ [name]: value });
  }

  render() {
    // composed id for bucket
    let composedId = `${this.props.arrayParentName}-bucket-form-${
      this.props.data.name ? this.props.data.name : "new-bucket"
    }`;
    return (
      <>
        {/* edit name */}
        <SlzFormGroup>
          {/* bucket name */}
          <SlzNameInput
            id={this.state.name + "-name"}
            componentName={this.props.data.name}
            component="buckets"
            onChange={event =>
              this.handleInputChange("name", event.target.value)
            }
            componentProps={this.props}
            value={this.state.name}
            placeholder="my-bucket-name"
            random_suffix={parentHasRandomSuffix(this.props)}
          />
          {/* bucket class */}
          <SlzSelect
            component={this.props.data.name}
            name="storage_class"
            groups={["Standard", "Vault", "Cold Vault", "Smart Tier"]}
            value={capitalize(this.state.storage_class)}
            labelText="Bucket class"
            handleInputChange={event =>
              this.handleInputChange(
                "storage_class",
                event.target.value.toLowerCase()
              )
            }
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          {/* bucket encryption key */}
          <KmsKeySelect
            component={this.props.data.name}
            slz={this.props.slz}
            value={this.state.kms_key}
            handleInputChange={event =>
              this.handleInputChange("kms_key", event.target.value)
            }
          />
          {/* force delete */}
          <SlzToggle
            tooltip={{
              content:
                "Toggling this on will force delete contents of the bucket after the bucket is deleted"
            }}
            id={composedId + "force-delete"}
            labelText="Force Delete Contents"
            defaultToggled={this.state.force_delete}
            toggleFieldName="force_delete"
            onToggle={this.handleInputChange}
            isModal={this.props.isModal}
          />
        </SlzFormGroup>
      </>
    );
  }
}

ObjectStorageBucketForm.defaultProps = {
  data: {
    force_delete: false,
    name: "",
    storage_class: "Standard"
  }
};

ObjectStorageBucketForm.propTypes = {
  arrayParentName: PropTypes.string.isRequired,
  isModal: PropTypes.bool,
  data: PropTypes.shape({
    force_delete: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    storage_class: PropTypes.string.isRequired,
    kms_key: PropTypes.string
  }),
  shouldDisableSave: PropTypes.func,
  shouldDisableSubmit: PropTypes.func,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        cos: PropTypes.array.isRequired
      })
    })
  })
};

export default ObjectStorageBucketForm;
