import React, { Component } from "react";
import { contains } from "lazy-z";
import { Form } from "@carbon/react";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions
} from "../../component-utils.js";
import AppIdKeyCreateForm from "./AppIdKeyCreateForm.js";
import PropTypes from "prop-types";
import { validName, disableSave, stateInit } from "../../../lib/index.js";
import {
  SlzNameInput,
  InstanceFormModal,
  SlzHeading,
  SlzFormGroup,
  ResourceGroupSelect,
  SlzToggle,
  EmptyResourceTile,
  DeleteModal,
  DeleteButton,
  SaveAddButton
} from "../../icse/index.js";

/**
 * AppIdForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class AppIdForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // temp values that get deleted and not saved to state
      ...stateInit("appid", { ...this.props }),
      open: false,
      showDeleteModal: false,
      keyNameToDelete: "",
      key_name: ""
    };
    this.state.use_appid = true;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.handleKeyAdd = this.handleKeyAdd.bind(this);
    this.handleKeyDelete = this.handleKeyDelete.bind(this);
    buildFormDefaultInputMethods(this);
    buildFormFunctions(this);
  }

  /**
   * If the appid form has been updated, must update state accordingly
   * @param {Object} prevProps
   */
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ ...stateInit("appid", this.props) });
    }
  }

  /**
   * toggleModal modal for creating AppId Key
   */
  toggleModal() {
    this.setState({ open: !this.state.open });
  }

  /**
   * toggle delete appid key modal on and off
   * @param name name of key to delete
   */
  toggleDeleteModal(name) {
    let tempValueState = {
      showDeleteModal: !this.state.showDeleteModal,
      keyNameToDelete: name
    };
    this.setState(tempValueState);
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
    this.setState(this.toggleStateBoolean(name, this.state));
  }

  /**
   * adds key to the appid keys list and closes the modal
   * @param {object} data
   * @param {object} data.key_name
   */
  handleKeyAdd(data) {
    let newAppIdState = { ...this.state };
    newAppIdState.keys.push(data.key_name);
    return new Promise((resolve, reject) => {
      this.props.slz.appid.save(newAppIdState);
      resolve();
    }).then(() => {
      //set state after save is run using promise
      this.setState({
        open: false
      });
    });
  }

  /**
   * removes key from the appid keys list and closes the modal
   * @param name key which needs to be deleted
   */
  handleKeyDelete(name) {
    let newKeys = this.state.keys.filter(item => item !== name);
    let newAppIdState = { ...this.state };
    newAppIdState.keys = newKeys;
    return new Promise((resolve, reject) => {
      this.props.slz.appid.save(newAppIdState);
      resolve();
    }).then(() => {
      //set state after save is run using promise
      this.setState({
        showDeleteModal: false,
        keys: newKeys
      });
    });
  }

  render() {
    return (
      <Form id="appid-form">
        <SlzFormGroup>
          {/* use data toggle */}
          <SlzToggle
            labelText="Use existing instance"
            defaultToggled={this.state.use_data || false}
            toggleFieldName="use_data"
            onToggle={this.handleToggle}
            className="fieldWidthSmallest"
            id="app-id-existing-instance"
          />
          {/* name text input */}
          <SlzNameInput
            component="appid"
            value={this.state.name}
            id={this.state.name + "-name"}
            componentName="appid"
            onChange={this.handleInputChange}
            useData={this.state.use_data || false}
            componentProps={this.props}
          />
          {/* Select Resource Group */}
          <ResourceGroupSelect
            slz={this.props.slz}
            component="appid"
            handleInputChange={this.handleInputChange}
            value={this.state.resource_group}
          />
        </SlzFormGroup>
        <SlzHeading
          name="App ID Keys"
          type="subHeading"
          className="marginBottomSmall"
          tooltip={{
            content:
              "Keys can be added to connect an application to an IBM Cloud service."
          }}
          buttons={
            <SaveAddButton
              id="appid-key-create"
              type="add"
              onClick={this.toggleModal}
              className="forceTertiaryButtonStyles"
              disabled={
                disableSave("appid", this.state, this.props) ||
                this.props.slz.store.configDotJson.appid.use_appid === false
              }
              noDeleteButton
            />
          }
        />
        <div>
          <InstanceFormModal
            name="Add an App ID Key"
            show={this.state.open}
            onRequestSubmit={this.handleKeyAdd}
            onRequestClose={this.toggleModal}
            size="sm"
          >
            <AppIdKeyCreateForm
              slz={this.props.slz}
              shouldDisableSubmit={function() {
                if (
                  !validName(this.state.key_name) ||
                  contains(
                    this.props.slz.store.configDotJson.appid.keys,
                    this.state.key_name
                  )
                ) {
                  this.props.disableModal();
                } else {
                  this.props.enableModal();
                }
              }}
            />
          </InstanceFormModal>
        </div>
        {this.state.keys.length > 0 ? (
          <div>
            {/* render each appid key */}
            {this.state.keys.map((data, index) => (
              <div
                className={
                  "positionRelative displayFlex formInSubForm marginBottomSmall alignItemsCenter spaceBetween"
                }
                key={`${data}-${this.state.keys[index]}`}
              >
                {data}
                <div>
                  <DeleteButton
                    name={data}
                    onClick={() => this.toggleDeleteModal(data)}
                  />
                </div>
              </div>
            ))}
            {/* confirm deletion modal */}
            <DeleteModal
              name={this.state.keyNameToDelete || ""}
              modalOpen={this.state.showDeleteModal}
              //need to call toggleDeleteModal with "" name argument or else canceling deletion passes in the entire event to the name argument and causes the page to error
              onModalClose={() => this.toggleDeleteModal("")}
              onModalSubmit={() =>
                this.handleKeyDelete(this.state.keyNameToDelete)
              }
            />
          </div>
        ) : (
          <EmptyResourceTile
            name="App ID Keys"
            instructions={
              this.props.slz.store.configDotJson.appid.use_appid === false
                ? "Enable App ID Service to create keys."
                : ""
            }
            showIfEmpty={this.state.keys}
          />
        )}
      </Form>
    );
  }
}

AppIdForm.defaultProps = {
  use_appid: false,
  name: null,
  resource_group: null,
  use_data: false,
  keys: [],
  key_name: ""
};

AppIdForm.propTypes = {
  use_appid: PropTypes.bool.isRequired,
  name: PropTypes.string,
  resource_group: PropTypes.string,
  use_data: PropTypes.bool,
  keys: PropTypes.array.isRequired,
  key_name: PropTypes.string.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        appid: PropTypes.shape({
          keys: PropTypes.array.isRequired
        }).isRequired
      }).isRequired
    })
  })
};

export default AppIdForm;
