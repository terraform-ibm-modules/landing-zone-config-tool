import { F5Form } from "./instance-forms/f5-big-ip/index.js";
import {
  AppIdForm,
  AtrackerForm,
  IamAccountSettingsForm,
  KeyManagementForm,
  SecretsManagerForm,
  TransitGatewayForm
} from "./instance-forms/index.js";
import { EncryptionKeys } from "./SlzArrayForms.js";
import {
  KeyManagementDocs,
  IAMDocs,
  TransitGatewayDocs,
  AtrackerDocs,
  TeleportDocs,
  SecretsManagerDocs,
  AppIdDocs,
  F5Docs
} from "./SlzDocs.js";
import TeleportBastionHost from "./TeleportBastionHost.js";
import PropTypes from "prop-types";
import { SlzTabPanel, EmptyResourceTile, ToggleForm } from "../icse/index.js";

export const KeyManagement = props => {
  return (
    <ToggleForm
      name={props.slz.store.configDotJson.key_management.name}
      formName="Service"
      submissionFieldName="key_management"
      innerForm={KeyManagementForm}
      about={<KeyManagementDocs />}
      slz={props.slz}
      onSave={props.slz.key_management.save}
      noDeleteButton
      tabPanel={{
        name: "key management",
        hideFormTitleButton: true
      }}
    >
      <EncryptionKeys slz={props.slz} />
    </ToggleForm>
  );
};

KeyManagement.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        key_management: PropTypes.shape({
          name: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired,
    // function data
    key_management: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const TransitGateway = props => {
  return (
    <ToggleForm
      name={props.slz.store.prefix + "-transit-gateway"}
      slz={props.slz}
      submissionFieldName="transit_gateway"
      innerForm={TransitGatewayForm}
      about={<TransitGatewayDocs />}
      onSave={props.slz.transit_gateway.save}
      noDeleteButton
      tabPanel={{
        name: "transit gateway",
        hideFormTitleButton: true
      }}
    />
  );
};

TransitGateway.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      prefix: PropTypes.string.isRequired
    }).isRequired,
    // function data
    transit_gateway: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const Atracker = props => {
  return (
    <ToggleForm
      name={props.slz.store.prefix + "-atracker"}
      slz={props.slz}
      submissionFieldName="atracker"
      innerForm={AtrackerForm}
      about={<AtrackerDocs />}
      onSave={props.slz.atracker.save}
      noDeleteButton
      tabPanel={{
        name: "Activity Tracker",
        hideFormTitleButton: true
      }}
    />
  );
};

Atracker.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      prefix: PropTypes.string.isRequired
    }).isRequired,
    // function data
    atracker: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const AppId = props => {
  return (
    <ToggleForm
      name={
        props.slz.store.configDotJson.appid.name ||
        "(Optional) Add an App ID Service"
      }
      slz={props.slz}
      submissionFieldName="appid"
      innerForm={AppIdForm}
      about={<AppIdDocs />}
      onSave={(stateData, componentProps) =>
        props.slz.appid.save(
          {
            use_appid: true,
            name: stateData.name,
            resource_group: stateData.resource_group,
            use_data: stateData.use_data,
            keys: stateData.keys
          },
          componentProps
        )
      }
      onDelete={() => {
        props.slz.appid.save({ use_appid: false });
      }}
      tabPanel={{
        name: "App ID",
        hideFormTitleButton: true
      }}
      useAddButton={props.slz.store.configDotJson.appid.use_appid === false}
    />
  );
};

AppId.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        appid: PropTypes.shape({
          name: PropTypes.string, // can be null
          use_appid: PropTypes.bool.isRequired
        }).isRequired
      }).isRequired
    }).isRequired,
    // function data
    appid: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const F5BigIp = props => {
  return props.slz.store.edge_pattern ? (
    <ToggleForm
      slz={props.slz}
      innerForm={F5Form}
      about={<F5Docs />}
      noSaveButton
      name="Configure F5 Big IP"
      noDeleteButton
      onSave={props.slz.f5.template.save}
      submissionFieldName="f5_template_data"
      tabPanel={{
        name: "F5 Big IP",
        hideFormTitleButton: true
      }}
    />
  ) : (
    <SlzTabPanel
      name="F5 Big IP"
      hideFormTitleButton
      form={
        <EmptyResourceTile
          name="Edge Network"
          instructions="Go back to the Home page to create one."
          showIfEmpty={[]}
        />
      }
      about={<F5Docs />}
    />
  );
};

F5BigIp.propTypes = {
  slz: PropTypes.shape({
    store: PropTypes.shape({
      edge_pattern: PropTypes.string
    }).isRequired
  }).isRequired
};

export const Teleport = props => {
  return props.slz.store.configDotJson.appid.use_appid ? (
    <ToggleForm
      name={
        props.slz.store.enableTeleport
          ? "Teleport Bastion Host"
          : "(Optional) Configure Teleport Bastion Host"
      }
      slz={props.slz}
      submissionFieldName="teleport_config"
      innerForm={TeleportBastionHost}
      about={<TeleportDocs />}
      onSave={props.slz.teleport_config.save}
      onDelete={() =>
        props.slz.teleport_config.save({
          enableTeleport: false
        })
      }
      noSaveButton
      tabPanel={{
        name: "Teleport Bastion Host",
        hideFormTitleButton: true
      }}
      useAddButton={props.slz.store.enableTeleport === false}
    />
  ) : (
    <SlzTabPanel
      name="Teleport Bastion Host"
      hideFormTitleButton
      form={
        <EmptyResourceTile
          name="App ID"
          instructions="App ID must be enabled to configure Teleport Bastion Hosts. Return to the App ID page to enable it."
          showIfEmpty={[]}
        />
      }
      about={<TeleportDocs />}
    />
  );
};

Teleport.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      enableTeleport: PropTypes.bool.isRequired
    }).isRequired,
    // function data
    teleport_config: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const IamAccountSettings = props => {
  let notEnabled =
    props.slz.store.configDotJson.iam_account_settings.enable === false;
  return (
    <ToggleForm
      name={
        (notEnabled ? "(Optional) Configure " : "") + "IAM Account Settings"
      }
      slz={props.slz}
      innerForm={IamAccountSettingsForm}
      about={<IAMDocs />}
      onSave={props.slz.iam_account_settings.save}
      submissionFieldName="iam_account_settings"
      onDelete={() => {
        props.slz.iam_account_settings.save({ enable: false });
      }}
      useAddButton={notEnabled}
      tabPanel={{
        name: "IAM Account Settings",
        hideFormTitleButton: true
      }}
    />
  );
};

IamAccountSettings.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        iam_account_settings: PropTypes.shape({
          enable: PropTypes.bool.isRequired
        }).isRequired
      }).isRequired
    }).isRequired,
    // function data
    iam_account_settings: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export const SecretsManager = props => {
  let notEnabled =
    props.slz.store.configDotJson.secrets_manager.use_secrets_manager === false;
  return (
    <ToggleForm
      name={
        notEnabled
          ? "(Optional) Add a Secrets Manager Instance"
          : props.slz.store.configDotJson.secrets_manager.name
      }
      slz={props.slz}
      innerForm={SecretsManagerForm}
      about={<SecretsManagerDocs />}
      onSave={props.slz.secrets_manager.save}
      submissionFieldName="secrets_manager"
      tabPanel={{
        name: "Secrets Manager",
        hideFormTitleButton: true
      }}
      onDelete={() =>
        props.slz.secrets_manager.save({
          use_secrets_manager: false
        })
      }
      useAddButton={notEnabled}
    />
  );
};

SecretsManager.propTypes = {
  slz: PropTypes.shape({
    // store data
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        secrets_manager: PropTypes.shape({
          use_secrets_manager: PropTypes.bool.isRequired,
          name: PropTypes.string // can be null
        }).isRequired
      }).isRequired
    }).isRequired,
    // function data
    secrets_manager: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};
