import React from "react";
import PropTypes from "prop-types";
import { addClassName, toggleMarginBottom } from "../../../lib/form-utils.js";
import { DynamicToolTipWrapper } from "../../wrappers/Tooltips.js";
import { EditCloseIcon } from "./Buttons.js";
import { ToastNotification } from "@carbon/react";
import "./notification.css";
import { capitalize } from "lazy-z";

/**
 * render a form
 * @param {*} form form element
 * @param {*} formProps props
 * @returns Form element
 */
export function RenderForm(form, formProps) {
  return React.createElement(form, {
    ...formProps
  });
}

/**
 * Dynamically render inner contents
 * @param {*} props
 * @param {boolean=} props.hide hide element
 * @param {boolean=} props.show component to show when hide is false
 * @returns empty string when hidden, component when visible
 */
export const DynamicRender = props => {
  return props.hide === true ? "" : props.show;
};

/**
 * slz heading
 * @param {*} props
 * @param {string} props.name name to add to title
 * @param {string=} props.type can be `subHeading` or `p`, defaults to `heading`
 * @returns Slz Heading
 */
export const SlzHeading = props => {
  let titleFormDivClass = props.toggleFormTitle
    ? ""
    : props.name === ""
    ? ""
    : " slzFormTitleMinHeight";
  return (
    <div
      className={
        addClassName(
          "displayFlex spaceBetween widthOneHundredPercent alignItemsCenter",
          props
        ) + titleFormDivClass
      }
    >
      <DynamicToolTipWrapper
        tooltip={props.tooltip}
        innerForm={() => {
          return props.type === "subHeading" ? (
            <h5>{capitalize(props.name)}</h5>
          ) : props.type === "p" ? (
            <p>{props.name}</p>
          ) : (
            <h4>{capitalize(props.name)}</h4>
          );
        }}
      />
      <div className="displayFlex">{props.buttons}</div>
    </div>
  );
};

SlzHeading.defaultProps = {
  type: "heading"
};

SlzHeading.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string
};

/**
 * wrapper for title groups
 */
export const TitleGroup = props => {
  return (
    <div
      className={addClassName(
        `displayFlex fitContent forceLeft alignItemsCenter widthOneHundredPercent ${toggleMarginBottom(
          props.hide
        )}`,
        props
      )}
    >
      {props.children}
    </div>
  );
};

TitleGroup.defaultProps = {
  hide: true
};

TitleGroup.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * All of the toggle form functionality without injecting anything on render
 */
export const StatelessToggleForm = props => {
  return props.hideTitle ? (
    props.children
  ) : (
    <>
      <TitleGroup hide={props.hide} props={props} className={props.className}>
        {props.hideIcon !== true && (
          <EditCloseIcon
            onClick={props.onIconClick}
            type={props.iconType}
            open={props.hide === false}
          />
        )}
        <SlzHeading
          type={
            props.toggleFormTitle
              ? "p"
              : props.subHeading
              ? "subHeading"
              : "heading"
          }
          name={props.name}
          buttons={
            <DynamicRender
              hide={props.hide === true && props.alwaysShowButtons !== true}
              show={props.buttons || ""}
            />
          }
        />
      </TitleGroup>
      <DynamicRender hide={props.hide} show={props.children} />
    </>
  );
};

StatelessToggleForm.defaultProps = {
  hide: true,
  iconType: "edit",
  name: "Stateless Toggle Form"
};

StatelessToggleForm.propTypes = {
  children: PropTypes.node.isRequired,
  hide: PropTypes.bool.isRequired,
  iconType: PropTypes.string.isRequired,
  onIconClick: PropTypes.func,
  subHeading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  buttons: PropTypes.node,
  toggleFormTitle: PropTypes.bool,
  alwaysShowButtons: PropTypes.bool
};

export const SlzFormGroup = props => {
  let formGroupClassName = "displayFlex marginBottom fitContent evenSpacing";
  // remove margin bottom from formGroup for VPC
  if (props.noMarginBottom) {
    formGroupClassName = formGroupClassName.replace(/\smarginBottom/g, "");
  }
  return (
    <div className={addClassName(formGroupClassName, props)}>
      {props.children}
    </div>
  );
};

SlzFormGroup.defaultProps = {
  noMarginBottom: false
};

SlzFormGroup.propTypes = {
  noMarginBottom: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export const SlzSubForm = props => {
  return (
    <div
      className={addClassName(
        props.formInSubForm
          ? "formInSubForm positionRelative"
          : "subForm marginBottomSmall",
        props
      )}
      id={props.id}
    >
      {props.children}
    </div>
  );
};

SlzSubForm.defaultProps = {
  formInSubForm: false
};

SlzSubForm.propTypes = {
  id: PropTypes.string.isRequired,
  formInSubForm: PropTypes.bool.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export const Notification = props => {
  return (
    <ToastNotification
      lowContrast
      className="notification-item"
      kind={props.kind}
      title={props.title}
      subtitle={props.text}
      timeout={props.timeout}
    />
  );
};

Notification.defaultProps = {
  kind: "success",
  title: "An error occured",
  timeout: 0
};

Notification.propTypes = {
  kind: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  timeout: PropTypes.number.isRequired
};
