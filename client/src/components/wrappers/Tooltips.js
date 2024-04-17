import { RenderForm } from "../icse/index.js";
import { addClassName, formatFieldName } from "../../lib/form-utils.js";
import SlzToolTip from "../tooltips/SlzToolTip.js";
import "./tooltips.css";
import React from "react";

const buildToolTip = props => {
  return (
    <SlzToolTip
      content={props.tooltip.content}
      link={props.tooltip.link || false}
      align={
        props.isModal
          ? props.tooltip.alignModal || "bottom"
          : props.tooltip.align || "top"
      }
    />
  );
};

/**
 *
 * @param {*} props
 * @param {*} props.innerForm react child form
 * @param {string} props.tooltip.content tooltip content
 * @param {string=} props.tooltip.link optional tooltip link
 * @returns
 */
export const SlzToolTipWrapper = props => {
  let allProps = { ...props };
  delete allProps.innerForm;
  delete allProps.tooltip;
  // remove label text from components where it is not valid param
  if (props.noLabelText) {
    delete allProps.labelText;
    delete allProps.noLabelText;
  } else allProps.labelText = " ";
  allProps.className = addClassName("tooltip", { ...props });

  let name =
    props.labelText || (props.field ? formatFieldName(props.field) : null);
  return (
    <div className="cds--form-item">
      {name ? (
        <>
          <div className="labelRow cds--label">
            <label htmlFor={props.id}>{name}</label>
            {buildToolTip(props)}
          </div>
          {props.children
            ? React.cloneElement(props.children, {
                // adjust props
                labelText: " ", // set labelText to empty
                className: props.children.props.className + " tooltip" // add tooltip class back
              })
            : RenderForm(props.innerForm, allProps)}
        </>
      ) : (
        // No label- this is usually a title
        <div className="labelRow">
          {RenderForm(props.innerForm, allProps)}
          {buildToolTip(props)}
        </div>
      )}
    </div>
  );
};

/**
 *
 * @param {*} props
 * @param {*} props.innerForm react child form
 * @param {string=} props.tooltipClassName optional tooltip classname
 * @param {string} props.tooltipContent tooltip content
 * @param {string=} props.tooltipLink optional tooltip link
 * @returns
 */
export const DynamicToolTipWrapper = props => {
  return props.tooltip ? (
    <SlzToolTipWrapper {...props} />
  ) : props.children ? (
    props.children
  ) : (
    RenderForm(props.innerForm, {})
  );
};
