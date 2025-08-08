import { Modal } from "@carbon/react";
import PropTypes from "prop-types";

/**
 * Slz modal wrapper
 * @param {*} props
 * @param {string} props.name resource name
 * @param {string} props.heading modal heading
 * @param {boolean} props.open show modal
 * @param {boolean=} props.danger danger, defaults to true
 * @param {boolean=} props.alert alert, defaults to true
 * @param {string=} props.primaryButtonText defaults to `Dismiss Changes`
 * @param {string=} props.secondaryButtonText defaults to `Cancel`
 * @param {Function} props.onRequestSubmit
 * @param {Function} props.onRequestClose
 * @param {string} props.type can be `delete` or `unsaved` defaults to `unsaved`
 * @param {boolean=} props.useAddButton use + button instead of edit
 */
export const SlzModal = (props) => {
  let name = <strong>{props.name}</strong>;
  return (
    <Modal
      id={props.id}
      className="leftTextAlign"
      modalHeading={
        props.type === "unsaved-invalid"
          ? "Missing Required Values"
          : props.heading
      }
      open={props.open}
      alert={props.alert}
      danger={props.danger}
      shouldSubmitOnEnter
      primaryButtonText={props.primaryButtonText}
      secondaryButtonText={props.secondaryButtonText}
      onRequestSubmit={props.onRequestSubmit}
      onRequestClose={props.onRequestClose}
    >
      {props.children ? (
        props.children
      ) : (
        <p>
          {props.type === "delete" && props.useAddButton ? (
            <span>
              You are about to disable {name}. All data will be reset. This
              cannot be undone.
            </span>
          ) : props.type === "delete" ? (
            <span>You are about to delete {name}. This cannot be undone.</span>
          ) : props.type === "unsaved-invalid" ? (
            <span>
              Resource {name} is missing required values.{" "}
              <strong>
                Without these values, your configuration is invalid.
              </strong>{" "}
              Are you sure you want to dismiss these changes?
            </span>
          ) : (
            <span>
              Resource {name} has unsaved changes. Are you sure you want to
              dismiss these changes?
            </span>
          )}
        </p>
      )}
    </Modal>
  );
};

SlzModal.defaultProps = {
  primaryButtonText: "Dismiss Changes",
  secondaryButtonText: "Cancel",
  primaryButtonDisabled: false,
  danger: true,
  alert: true,
  open: false,
  heading: "Unsaved Changes",
  useAddButton: false,
  type: "unsaved",
  id: "default-slz-modal",
};

SlzModal.propTypes = {
  primaryButtonText: PropTypes.string.isRequired,
  secondaryButtonText: PropTypes.string.isRequired,
  primaryButtonDisabled: PropTypes.bool,
  danger: PropTypes.bool,
  alert: PropTypes.bool,
  heading: PropTypes.string.isRequired,
  useAddButton: PropTypes.bool,
  type: PropTypes.string,
  onRequestSubmit: PropTypes.func.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};

/**
 * Delete modal
 * @param {*} props
 * @param {string} props.name name of modal
 * @param {boolean} props.modalOpen true if open
 * @param {Function} props.onModalClose function for on close
 * @param {Function} props.onModalSubmit function for on submit
 */
export const DeleteModal = (props) => {
  return (
    <SlzModal
      id={props.name + "-delete"}
      name={props.name}
      heading={props.name}
      open={props.modalOpen}
      onRequestClose={props.onModalClose}
      onRequestSubmit={props.onModalSubmit}
      primaryButtonText="Delete Resource"
      type="delete"
    />
  );
};

DeleteModal.defaultProps = {
  modalOpen: false,
};

DeleteModal.propTypes = {
  name: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onModalSubmit: PropTypes.func.isRequired,
};

/**
 * unsaved changes modal modal
 * @param {*} props
 * @param {string} props.name name of modal
 * @param {boolean} props.modalOpen true if open
 * @param {Function} props.onModalClose function for on close
 * @param {Function} props.onModalSubmit function for on submit
 */

export const UnsavedChangesModal = (props) => {
  return (
    <div className="unsaved-changes-modal-area">
      <SlzModal
        id={props.name + "-unsaved-changes"}
        open={props.modalOpen}
        name={props.name}
        onRequestClose={props.onModalClose}
        onRequestSubmit={props.onModalSubmit}
        type={props.useDefaultUnsavedMessage ? "unsaved" : "unsaved-invalid"}
      />
    </div>
  );
};

UnsavedChangesModal.defaultProps = {
  modalOpen: false,
  useDefaultUnsavedMessage: true,
};

UnsavedChangesModal.propTypes = {
  name: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onModalSubmit: PropTypes.func.isRequired,
  useDefaultUnsavedMessage: PropTypes.bool,
};
