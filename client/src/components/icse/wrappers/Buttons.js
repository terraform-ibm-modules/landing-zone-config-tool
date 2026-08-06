import { Button } from "@carbon/react";
import { saveChangeButtonClass } from "../../../lib/index.js";
import PopoverWrapper from "./Popover.js";
import PropTypes from "prop-types";
import {
  Save,
  Edit,
  Add,
  CloseFilled,
  TrashCan,
  ArrowDown,
  ArrowUp
} from "@carbon/icons-react";
import React from "react";
import "./icon.css";
import f5 from "../../../images/f5.png";

/**
 * f5 image icon
 */
export default function F5Icon() {
  return <img src={f5} />;
}

/**
 * generate save icon
 * @param {object} props
 * @param {boolean} props.saveIsDisabled true if disabled
 * @returns Save Icon
 */
export const SaveIcon = props => {
  return (
    <Save className={props.saveIsDisabled ? "" : "tertiaryButtonColors"} />
  );
};

/**
 * save add button
 * @param {*} props
 * @param {string} props.hoverText
 * @param {string} props.type can be `add` defaults to `save`
 * @param {Function} props.onClick onclick function
 * @param {string=} props.className
 * @param {boolean} props.disabled
 * @returns Save add button
 */
export const SaveAddButton = ({
  type = "save",
  hoverText = "Save Changes",
  inline = false,
  disabled = false,
  onClick,
  className,
  noDeleteButton
}) => {
  return (
    <PopoverWrapper
      hoverText={
        type === "add" && hoverText === "Save Changes"
          ? "Add Resource"
          : hoverText
      }
      className={
        (disabled ? "inlineBlock cursorNotAllowed" : "") +
        (inline
          ? " alignItemsCenter marginTopLarge inLineFormButton"
          : "")
      }
    >
      <Button
        kind={type === "add" ? "tertiary" : "primary"}
        onClick={onClick}
        className={
          saveChangeButtonClass({ type, hoverText, inline, disabled, onClick, className, noDeleteButton }) +
          (disabled === true
            ? " pointerEventsNone "
            : " " + className)
        }
        disabled={disabled || false}
        size="sm"
      >
        {type === "add" ? (
          <Add />
        ) : (
          <SaveIcon saveIsDisabled={disabled} />
        )}
      </Button>
    </PopoverWrapper>
  );
};

SaveAddButton.propTypes = {
  hoverText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  inline: PropTypes.bool.isRequired
};

/**
 * Edit close icon with popover
 * @param {*} props
 * @param {string=} props.hoverText text for popover hover
 * @param {string} props.type can be `edit` or `add`, defaults to add
 * @param {boolean} props.disabled
 * @param {boolean} props.open toggle is open, defaults to false
 * @returns edit close icon
 */
export const EditCloseIcon = ({ hoverText, type = "edit", open = false, onClick, disabled }) => {
  let resolvedHoverText = hoverText
    ? hoverText
    : open
    ? "Close"
    : type === "add"
    ? "Configure Resource"
    : "Edit Resource";
  let icon = open ? (
    <CloseFilled />
  ) : type === "add" ? (
    <Add />
  ) : (
    <Edit />
  );
  return (
    <PopoverWrapper hoverText={resolvedHoverText}>
      <i onClick={onClick} className="chevron">
        {icon}
      </i>
    </PopoverWrapper>
  );
};

EditCloseIcon.propTypes = {
  hoverText: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  open: PropTypes.bool
};

/**
 * Delete button
 * @param {*} props
 *
 */
export const DeleteButton = ({ disabled = false, modalOpen = false, onClick, disableDeleteMessage, name }) => {
  return (
    <div className="delete-area">
      <PopoverWrapper
        hoverText={
          disabled ? disableDeleteMessage : "Delete Resource"
        }
        className={disabled ? "inlineBlock cursorNotAllowed" : ""}
      >
        <Button
          className={
            "cds--btn--danger--tertiary forceTertiaryButtonStyles" +
            (disabled ? " pointerEventsNone" : "")
          }
          kind="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled === true}
        >
          <TrashCan className={disabled ? "" : "redFill"} />
        </Button>
      </PopoverWrapper>
    </div>
  );
};

DeleteButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export const UpDownButtons = ({ name, disableUp = false, disableDown = false, handleCardUp, handleCardDown }) => {
  return (
    <>
      <Button
        key={"rule-up-" + name}
        disabled={disableUp}
        kind="ghost"
        size="sm"
        id={name + "-up"}
        onClick={handleCardUp}
        className="focus forceTertiaryButtonStyles marginRightSmall"
      >
        <ArrowUp key={"up-" + name} />
      </Button>
      <Button
        kind="ghost"
        disabled={disableDown}
        key={"rule-down-" + name}
        size="sm"
        id={name + "-down"}
        onClick={handleCardDown}
        className="focus forceTertiaryButtonStyles"
      >
        <ArrowDown key={"down-" + name} />
      </Button>
    </>
  );
};

UpDownButtons.propTypes = {
  disableUp: PropTypes.bool.isRequired,
  disableDown: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  handleCardUp: PropTypes.func.isRequired,
  handleCardDown: PropTypes.func.isRequired
};
