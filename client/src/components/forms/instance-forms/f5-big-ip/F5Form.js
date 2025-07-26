import React from "react";
import { stateInit } from "../../../../lib/index.js";
import { ToggleForm, SlzHeading } from "../../../icse/index.js";
import F5VsiForm from "./F5VsiForm.js";
import F5VsiTemplateForm from "./F5VsiTemplateForm.js";
import PropTypes from "prop-types";

export const F5Form = (props) => {
  let vsiStateData = { ...stateInit("f5_vsi", { slz: props.slz }) };
  return (
    <>
      <SlzHeading
        type="subHeading"
        name="F5 Big IP Template Configuration"
        className="marginBottomSmall"
      />
      <ToggleForm
        name="F5 Big IP Template Configuration"
        submissionFieldName="f5_template_data"
        noDeleteButton
        onSave={props.slz.f5.template.save}
        disableSave={props.saveFromChildForm.disableSave}
        formInSubForm
        innerForm={F5VsiTemplateForm}
        slz={props.slz}
      />
      <SlzHeading
        type="subHeading"
        name="F5 VSI Deployment Configuration"
        className="marginBottomSmall"
      />
      <ToggleForm
        name="F5 VSI Deployment Configuration"
        submissionFieldName="f5_vsi_config"
        noDeleteButton
        onSave={props.slz.f5.vsi.save}
        disableSave={props.saveFromChildForm.disableSave}
        formInSubForm
        innerForm={F5VsiForm}
        slz={props.slz}
        data={vsiStateData}
      />
    </>
  );
};

F5Form.propTypes = {
  slz: PropTypes.shape({
    f5: PropTypes.shape({
      template: PropTypes.shape({
        save: PropTypes.func.isRequired,
      }).isRequired,
      vsi: PropTypes.shape({
        save: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  saveFromChildForm: PropTypes.shape({
    disableSave: PropTypes.bool.isRequired,
  }).isRequired,
};
