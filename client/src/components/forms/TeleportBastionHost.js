import React from "react";
import { SlzHeading, ToggleForm } from "../icse/index.js";
import { TeleportConfigForm } from "./instance-forms/index.js";
import { TeleportVsi } from "./SlzArrayForms.js";

const TeleportBastionHost = props => {
  return (
    <>
      <SlzHeading
        type="subHeading"
        name="Teleport Configuration"
        className="marginBottomSmall"
      />
      <ToggleForm
        name={
          props.slz.store.configDotJson.teleport_config.hostname
            ? props.slz.store.configDotJson.teleport_config.hostname
            : "Bastion Host Template Configuration"
        }
        submissionFieldName="teleport_config"
        noDeleteButton
        onSave={props.slz.teleport_config.save}
        disableSave={props.saveFromChildForm.disableSave}
        formInSubForm
        innerForm={TeleportConfigForm}
        slz={props.slz}
      />
      <TeleportVsi slz={props.slz} isTeleport />
    </>
  );
};

export default TeleportBastionHost;
