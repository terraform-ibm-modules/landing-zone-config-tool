import { DeleteModal, UnsavedChangesModal } from "./Modals.js";
import React from "react";
import {
  addClassName,
  forceShowForm,
  disableDeleteMessage,
  toggleFormDeleteDisabled,
} from "../../../lib/form-utils.js";
import { propsMatchState } from "../../../lib/props-match-state.js";
import { disableSave } from "../../../lib/disable-save.js";
import { DeleteButton, SaveAddButton } from "./Buttons.js";
import {
  DynamicRender,
  RenderForm,
  SlzHeading,
  StatelessToggleForm,
} from "./Utils.js";
import PropTypes from "prop-types";
import SlzTabPanel from "../SlzTabPanel.js";

/**
 * @param {*} props
 * @param {boolean=} props.hide optionally set hidden value, defaults to false
 * @param {boolean=} props.subForm is subform
 * @param {boolean=} props.useAddButton use + instead of edit
 * @param {boolean=} props.subHeading form subheading cannot be used with pHeading
 * @param {boolean=} props.pHeading use p heading, cannot be used with subHeading
 * @param {boolean=} props.noSaveButton no save button when true
 * @param {boolean=} props.noDeleteButton no delete button when true
 */
class ToggleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: this.props.slz.store.cheatsEnabled
        ? false
        : this.props.show
          ? !this.props.show
          : this.props.hide,
      showDeleteModal: false,
      showUnsavedChangeModal: false,
      disableSave: true,
      disableDelete: false,
      showChildren: true,
      showSubModal: false,
      propsMatchState: true,
      useDefaultUnsavedMessage: true,
      ruleOrderChange: false,
    };

    this.toggleChildren = this.toggleChildren.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.toggleUnsavedChangeModal = this.toggleUnsavedChangeModal.bind(this);
    this.dismissChangesAndClose = this.dismissChangesAndClose.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.shouldDisableSave = this.shouldDisableSave.bind(this);
    this.shouldShow = this.shouldShow.bind(this);
    this.networkRuleOrderDidChange = this.networkRuleOrderDidChange.bind(this);
    this.toggleShowChildren = this.toggleShowChildren.bind(this);
    this.onToggleSubModal = this.onToggleSubModal.bind(this);
    this.childRef = React.createRef();
  }

  /**
   * toggle sub modal
   */
  onToggleSubModal() {
    this.setState({ showSubModal: !this.state.showSubModal });
  }

  componentDidMount() {
    if (this.state.hide === true && this.shouldShow() === true) {
      this.setState({ hide: false });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.hide !== this.state.hide && this.props.onShowToggle) {
      this.props.onShowToggle(this.props.index);
    }
  }

  /**
   * toggle children rendered by form
   */
  toggleChildren() {
    if (this.childRef.current?.state) {
      let stateData = this.childRef.current.state;
      let componentProps = this.childRef.current.props;
      let propsDoNotMatch =
        propsMatchState(
          this.props.submissionFieldName,
          stateData,
          componentProps,
        ) === false;
      if (propsDoNotMatch || this.state.useDefaultUnsavedMessage === false) {
        this.toggleUnsavedChangeModal();
      } else {
        this.setState({ hide: !this.state.hide });
      }
    } else {
      this.setState({ hide: !this.state.hide });
    }
  }

  /**
   * toggle delete modal
   */
  toggleDeleteModal() {
    this.setState({ showDeleteModal: !this.state.showDeleteModal });
  }

  /**
   * toggle unsaved changes modal
   */
  toggleUnsavedChangeModal() {
    this.setState({
      showUnsavedChangeModal: !this.state.showUnsavedChangeModal,
    });
  }

  /**
   * Dismiss changes and close
   */
  dismissChangesAndClose() {
    this.setState({
      showUnsavedChangeModal: false,
      hide: true,
    });
  }

  /**
   * on save
   */
  onSave() {
    this.props.onSave(this.childRef.current.state, this.childRef.current.props);
    this.setState({ useDefaultUnsavedMessage: true });
  }

  /**
   * on delete
   */
  onDelete() {
    if (this.props.onShowToggle) this.props.onShowToggle(this.props.index);
    this.props.onDelete(
      this.childRef.current?.state,
      this.childRef.current?.props,
    );
    this.setState({ hide: true, showDeleteModal: false });
  }

  /**
   * should disable save
   * @param {*} stateData state data
   * @param {*} componentProps component props
   */
  shouldDisableSave(stateData, componentProps) {
    let enableSave =
      disableSave(this.props.submissionFieldName, stateData, componentProps) ===
      false;
    let propsDoNotMatch =
      propsMatchState(
        this.props.submissionFieldName,
        stateData,
        componentProps,
      ) === false;
    if (
      enableSave === false &&
      this.state.useDefaultUnsavedMessage &&
      propsDoNotMatch === false
    ) {
      this.setState({ useDefaultUnsavedMessage: false });
    } else if (enableSave && propsDoNotMatch && this.state.disableSave) {
      this.setState({ disableSave: false, propsMatchState: false });
    } else if (!this.state.disableSave && (!enableSave || !propsDoNotMatch)) {
      this.setState({ disableSave: true, propsMatchState: !propsDoNotMatch });
    }
  }

  shouldShow() {
    return forceShowForm(this.state, this.props);
  }

  networkRuleOrderDidChange(didNotChange) {
    let didChange = !didNotChange;
    if (this.state.ruleOrderChange !== didChange) {
      this.setState({ ruleOrderChange: didChange });
    }
  }

  toggleShowChildren() {
    this.setState({ showChildren: !this.state.showChildren });
  }

  render() {
    if (this.props.noDeleteButton !== true && !this.props.onDelete) {
      throw new Error(
        `ToggleForm expects onDelete Function to be passed when a delete button is rendered`,
      );
    }

    if (this.props.noSaveButton !== true && !this.props.onSave) {
      throw new Error(
        `ToggleForm expects onSave Function to be passed when a save button is rendered`,
      );
    }
    let formTitle =
      this.props.name ||
      this.props.data.prefix ||
      this.props.data.service_name ||
      this.props.data.email;
    return (
      <>
        <SlzTabPanel
          {...(this.props.tabPanel ? this.props.tabPanel : {})}
          toggleShowChildren={this.toggleShowChildren}
          form={
            <>
              {this.props.formName && (
                <SlzHeading name={this.props.formName} hideButton />
              )}
              <div
                className={addClassName(
                  this.props.formInSubForm ||
                    this.props.arrayParentName ||
                    this.props.submissionFieldName === "teleport_vsi"
                    ? "formInSubForm positionRelative marginBottomSmall"
                    : "subForm marginBottomSmall",
                  this.props.name === "Bastion Host Template Configuration" ||
                    this.props.name ===
                      "(Optional) Transit VPC and Edge Networking" ||
                    this.props.arrayParentName ||
                    this.props.submissionFieldName === "teleport_vsi" ||
                    this.props.innerForm.name === "TeleportClaimToRoleForm"
                    ? "marginTop paddingRight"
                    : "",
                )}
              >
                <StatelessToggleForm
                  hide={this.state.hide}
                  iconType={this.props.useAddButton ? "add" : "edit"}
                  onIconClick={this.toggleChildren}
                  toggleFormTitle
                  name={formTitle}
                  buttons={
                    <>
                      <DynamicRender
                        hide={this.props.addButtonAtFormTitle !== true}
                        show={
                          <SaveAddButton
                            type="add"
                            onClick={this.onToggleSubModal}
                            noDeleteButton
                          />
                        }
                      />
                      {/* save / add button */}
                      <DynamicRender
                        hide={
                          this.props.noSaveButton ||
                          this.props.addButtonAtFormTitle
                        }
                        show={
                          <SaveAddButton
                            onClick={this.onSave}
                            disabled={this.state.disableSave}
                            noDeleteButton={this.props.noDeleteButton}
                          />
                        }
                      />
                      {/* delete button */}
                      <DynamicRender
                        hide={this.props.noDeleteButton}
                        show={
                          <DeleteButton
                            onClick={this.toggleDeleteModal}
                            name={formTitle}
                            disabled={toggleFormDeleteDisabled(this.props)}
                            disableDeleteMessage={disableDeleteMessage(
                              this.props,
                            )}
                          />
                        }
                      />
                    </>
                  }
                >
                  {/* unsaved changes */}
                  <UnsavedChangesModal
                    name={
                      // use tab panel name if passed
                      this.props.tabPanel ? this.props.tabPanel.name : formTitle
                    }
                    modalOpen={this.state.showUnsavedChangeModal}
                    onModalClose={this.toggleUnsavedChangeModal}
                    onModalSubmit={this.dismissChangesAndClose}
                    useDefaultUnsavedMessage={
                      this.state.useDefaultUnsavedMessage
                    }
                  />
                  {/* delete resource */}
                  <DeleteModal
                    name={
                      // use tab panel name if passed
                      this.props.tabPanel ? this.props.tabPanel.name : formTitle
                    }
                    modalOpen={this.state.showDeleteModal}
                    onModalClose={this.toggleDeleteModal}
                    onModalSubmit={this.onDelete}
                  />
                  {RenderForm(this.props.innerForm, {
                    ref:
                      this.props.innerForm.name === "TeleportBastionHost" ||
                      this.props.innerForm.name === "F5Form"
                        ? null
                        : this.childRef,
                    slz: this.props.slz,
                    shouldDisableSave: this.shouldDisableSave,
                    data: this.props.data,
                    isModal: false,
                    arrayParentName: this.props.arrayParentName,
                    showSubModal: this.state.showSubModal,
                    addText: this.props.addText, // is this used?
                    isTeleport: this.props.isTeleport,
                    readOnly: this.props.readOnly,
                    networkRuleOrderDidChange: this.networkRuleOrderDidChange,
                    onChildShowToggle: this.props.onChildShowToggle,
                    index: this.props.index,
                    shownChildren: this.props.shownChildren,
                    // this is used for vpc network acl render form
                    handleModalToggle: this.onToggleSubModal,
                    showSubModal: this.state.showSubModal,
                    // this is an override to be used with Teleport Config to allow the
                    // parent form to be saved from a button inside the child form
                    saveFromChildForm: {
                      onSave: this.onSave,
                      disableSave: this.state.disableSave,
                    },
                  })}
                </StatelessToggleForm>
              </div>
            </>
          }
          about={this.props.about || false}
        />
        {this.state.showChildren && this.props.children
          ? this.props.children
          : ""}
      </>
    );
  }
}

ToggleForm.defaultProps = {
  hide: true,
  unsavedChanges: false,
  index: 0,
  nonArrayForm: false,
};

ToggleForm.propTypes = {
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
  onShowToggle: PropTypes.func,
  index: PropTypes.number.isRequired,
  hide: PropTypes.bool.isRequired,
  submissionFieldName: PropTypes.string.isRequired,
  nonArrayForm: PropTypes.bool.isRequired,
};

export default ToggleForm;
