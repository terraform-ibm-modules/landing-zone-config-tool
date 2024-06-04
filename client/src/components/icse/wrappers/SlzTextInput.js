import { TextInput } from "@carbon/react";
import { containsKeys, isBoolean, kebabCase, titleCase } from "lazy-z";
import React from "react";
import {
  nameValidationExp,
  urlValidationExp
} from "../../../lib/constants.js";
import { hasInvalidName } from "../../../lib/error-text-utils.js";
import { minStringSize} from "../../../lib/lib-utils.js";
import {
  addClassName,
  formatFieldName,
  buildComposedComponentNameHelperText
} from "../../../lib/form-utils.js";
import PropTypes from "prop-types";
import { DynamicToolTipWrapper } from "../../wrappers/Tooltips.js";

/**
 * handle invalid text
 * @param {*} props arbitrary props
 */
function handleInvalidText(props) {
  if (!containsKeys(props, "invalid")) {
    return props.value === "";
  } else if (isBoolean(props.invalid)) {
    return props.invalid;
  } else if (props.invalid === "matchUrl") {
    return props.value.match(urlValidationExp) === null;
  } else if (props.invalid === "sixOrMore") {
    return !minStringSize(props.value);
  } else if (typeof props.invalid != "string") {
    return props;
  } else {
    return props.value.match(nameValidationExp) === null;
  }
}

function formatInputPlaceholder(componentName, fieldName) {
  return `my-${kebabCase(componentName)}-${kebabCase(fieldName)}`;
}

/**
 * Slz Text Input
 * @param {*} props props
 * @param {string} props.componentName name of the component being edited
 * @param {string} props.placeholder placeholder text for field
 * @param {string} props.field field (ex. name)
 * @param {string=} props.value actual value
 * @param {Function} props.onChange onchange function
 * @param {string} props.helperText helper text
 * @param {string} props.className classnames to add
 * @param {boolean=} props.readOnly read only
 * @param {string=} props.labelText override label text
 * @returns <SlzTextInput/> component
 */
export const SlzTextInput = props => {
  let fieldName = formatFieldName(props.field);
  return (
    <DynamicToolTipWrapper {...props}>
      <TextInput
        id={`${props.id || ""}${props.field}`}
        className={addClassName("fieldWidth leftTextAlign", props)}
        labelText={props.labelText ? props.labelText : titleCase(props.field)}
        placeholder={
          props.value ||
          props.placeholder ||
          formatInputPlaceholder(props.componentName, fieldName)
        }
        name={props.field}
        value={props.value || ""}
        invalid={
          isBoolean(props.invalid) ? props.invalid : handleInvalidText(props)
        }
        onChange={props.onChange}
        helperText={props.helperText}
        invalidText={
          props.invalidText
            ? props.invalidText
            : `Invalid ${props.field} value.`
        }
        maxLength={props.maxLength}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
    </DynamicToolTipWrapper>
  );
};

SlzTextInput.defaultProps = {
  maxLength: null,
  disabled: false,
  readOnly: false,
  hideHelperText: false
};

SlzTextInput.propTypes = {
  disabled: PropTypes.bool.isRequired,
  componentName: PropTypes.string,
  placeholder: PropTypes.string,
  field: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    alignModal: PropTypes.string
  }),
  className: PropTypes.string,
  readOnly: PropTypes.bool.isRequired,
  labelText: PropTypes.string.isRequired,
  maxLength: PropTypes.number
};

/**
 * Slz Name Field
 * @param {*} props
 * @param {string} props.id
 * @param {string=} props.className
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} props.component
 * @param {string} props.invalid
 * @param {boolean=} props.noMarginRight
 * @param {boolean=} props.hideHelperText
 * @param {slzStateStore} slz
 * @returns <SlzNameInput />
 */
export const SlzNameInput = props => {
  // get invalid and invalid text
  let invalid = hasInvalidName(
    props.component,
    props.value,
    props.componentProps,
    props.useData
  );
  let helperText = "";
  // if helper text is not hidden
  if (!props.hideHelperText && !props.useData) {
    helperText = buildComposedComponentNameHelperText(
      props.componentProps.slz.store.prefix,
      props.value,
      {
        useData: props.useData,
        suffix: props.random_suffix ? "<random suffix>" : false,
        parentName: props.parentName || false
      }
    );
  }
  return (
    <DynamicToolTipWrapper {...props}>
      <SlzTextInput
        {...props}
        {...invalid}
        className={addClassName("fieldWidth leftTextAlign ", props)}
        field="name"
        labelText="Name"
        helperText={helperText}
      />
    </DynamicToolTipWrapper>
  );
};

SlzNameInput.defaultProps = {
  useData: false,
  hideHelperText: false
};

SlzNameInput.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  component: PropTypes.string.isRequired,
  invalid: PropTypes.string,
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    alignModal: PropTypes.string
  }),
  noMarginRight: PropTypes.bool,
  hideHelperText: PropTypes.bool.isRequired,
  useData: PropTypes.bool.isRequired
};
