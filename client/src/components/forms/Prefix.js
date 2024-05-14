import React, { Component } from "react";
import { buildFormDefaultInputMethods } from "../component-utils.js";
import { PrefixDocs } from "./SlzDocs.js";
import {
  SlzTextInput,
  StatelessToggleForm,
  SlzFormGroup,
  SaveAddButton,
  UnsavedChangesModal
} from "../icse/index.js";
import { isInvalidPrefix } from "../../lib/index.js";
import PropTypes from "prop-types";

/**
 * PrefixForm
 * @param {Object} props
 * @param {slz} props.slz slz state store
 */
class PrefixForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.slz.store.prefix,
      hide: true,
      UnsavedChangesModal: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.dismissChanges = this.dismissChanges.bind(this);
    this.closeUnsavedModal = this.closeUnsavedModal.bind(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * Toggle opening and closing of prefix form
   * @param {string} name name of the toggle to change
   * @param {string} name name of the object key to change
   */
  handleToggle() {
    this.state.name !== this.props.slz.store.prefix
      ? this.setState({ showUnsavedModal: true })
      : this.setState({ hide: !this.state.hide });
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * handle save
   */
  handleSave() {
    this.props.slz.updatePrefix(this.state.name);
  }

  /**
   * dismiss changes
   */
  dismissChanges() {
    this.setState({
      showUnsavedModal: false,
      name: this.props.slz.store.prefix,
      hide: true
    });
  }

  /**
   * close unsaved
   */
  closeUnsavedModal() {
    this.setState({
      showUnsavedModal: false
    });
  }

  render() {
    return (
      <div className="formInSubForm marginRightHome">
        <StatelessToggleForm
          name="Environment prefix"
          subHeading
          onIconClick={this.handleToggle}
          hide={this.state.hide}
          buttons={
            <SaveAddButton
              onClick={this.handleSave}
              disabled={
                this.props.slz.store.prefix === this.state.name || // save shouldn't be enabled when match
                isInvalidPrefix(this.state.name).invalid
              }
            />
          }
        >
          <SlzFormGroup>
            <SlzTextInput
              componentName="Prefix"
              field="name"
              labelText="prefix"
              value={this.state.name}
              onChange={this.handleInputChange}
              maxLength={16}
              helperText="Prefix value, 16 characters or less"
              className="leftTextAlign"
              {...isInvalidPrefix(this.state.name)}
            />
            <PrefixDocs />
          </SlzFormGroup>
        </StatelessToggleForm>
        <UnsavedChangesModal
          modalOpen={this.state.showUnsavedModal}
          name="prefix"
          onModalSubmit={this.dismissChanges}
          onModalClose={this.closeUnsavedModal}
        />
      </div>
    );
  }
}

export default PrefixForm;

PrefixForm.propTypes = {
  slz: PropTypes.shape({
    store: PropTypes.shape({ prefix: PropTypes.string.isRequired }).isRequired
  })
};
