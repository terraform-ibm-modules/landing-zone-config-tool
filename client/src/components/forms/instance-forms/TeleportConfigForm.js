import React from "react";
import { ObjectStorageKeyForm } from "./object-storage/index.js";
import TextArea from "@carbon/react/lib/components/TextArea/TextArea.js";
import { TeleportClaimToRoles } from "../SlzArrayForms.js";
import AppIdKeyCreateForm from "./AppIdKeyCreateForm.js";
import { validName } from "../../../lib/lib-utils.js";
import {
  SlzTextInput,
  SlzSelect,
  SlzFormGroup,
  InstanceFormModal,
  SaveAddButton
} from "../../icse/index.js";
import { buildFormFunctions } from "../../component-utils.js";
import {
  getBucketInstance,
  getCosKeysFromBucket,
  hasInvalidName,
  stateInit,
  checkNullorEmptyString
} from "../../../lib/index.js";
import { contains, isNullOrEmptyString } from "lazy-z";
import PropTypes from "prop-types";

/**
 * Teleport keys form
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class TeleportConfigForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCosKeyModal: false,
      showAppIdKeyModal: false,
      teleport_config: {
        ...stateInit("teleport_config", this.props)
      }
    };
    this.teleportConfigChange = this.teleportConfigChange.bind(this);
    this.toggleCosKeyModal = this.toggleCosKeyModal.bind(this);
    this.toggleAppIdKeyModal = this.toggleAppIdKeyModal.bind(this);
    this.cosKeySubmit = this.cosKeySubmit.bind(this);
    this.handleKeyAdd = this.handleKeyAdd.bind(this);
    buildFormFunctions(this);
  }

  /**
   * change teleport config
   * @param {*} event
   */
  teleportConfigChange(event) {
    let teleportConfig = { ...this.state.teleport_config };
    let { name, value } = event.target;
    teleportConfig[name] = value;
    // if changing cos bucket name
    if (
      name === "cos_bucket_name" &&
      // and if a list of keys from the bucket does not contain the current cos key
      !contains(
        getCosKeysFromBucket(
          { teleport_config: { cos_bucket_name: value } },
          this.props
        ),
        teleportConfig.cos_key_name
      )
    ) {
      // set cos key to ""
      teleportConfig.cos_key_name = "";
    }
    this.setState({ teleport_config: teleportConfig });
  }

  /**
   * toggle cos key modal
   */
  toggleCosKeyModal() {
    this.setState({ showCosKeyModal: !this.state.showCosKeyModal });
  }
  /**
   * toggle cos key modal
   */
  toggleAppIdKeyModal() {
    this.setState({ showAppIdKeyModal: !this.state.showAppIdKeyModal });
  }

  /**
   * submit cos key from modal
   * @param {*} data
   */
  cosKeySubmit(data) {
    // create key in store
    this.props.slz.cos.keys.create(data, {
      arrayParentName: getBucketInstance(
        this.state.teleport_config.cos_bucket_name,
        this.props
      )
    });
    // deep copy of config
    let teleportConfig = { ...this.state.teleport_config };
    teleportConfig.cos_key_name = data.name; // set cos key name to new name
    // hide modal and set config
    this.setState({
      teleport_config: teleportConfig,
      showCosKeyModal: false
    });
  }

  /**
   * Handle adding a key
   */
  handleKeyAdd(data) {
    return new Promise((resolve, reject) => {
      // update appid using save
      let appidState = { ...this.props.slz.store.configDotJson.appid };
      appidState.keys.push(data.key_name);
      this.props.slz.appid.save(appidState);
      resolve();
    }).then(() => {
      //set state after save is run using promise
      let newTeleportState = { ...this.state.teleport_config };
      newTeleportState.app_id_key_name = data.key_name;
      this.setState({
        showAppIdKeyModal: false,
        teleport_config: newTeleportState
      });
    });
  }

  render() {
    return (
      <div className="marginTop">
        <SlzFormGroup>
          <SlzTextInput
            id="teleport_version"
            componentName="teleport_version"
            field="teleport_version"
            labelText={"Teleport Version"}
            value={this.state.teleport_config.teleport_version}
            onChange={this.teleportConfigChange}
            className="fieldWidthMedium"
          />
          <SlzTextInput
            id="license"
            componentName="Teleport License"
            field="teleport_license"
            labelText={"Teleport License"}
            value={this.state.teleport_config.teleport_license}
            onChange={this.teleportConfigChange}
            className="textInputMedium"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="hostname"
            componentName="Hostname"
            field="hostname"
            labelText={"Hostname"}
            value={this.state.teleport_config.hostname || ""}
            onChange={this.teleportConfigChange}
            className="fieldWidthMedium"
            invalid={(this.state.teleport_config.hostname || "").length < 6}
            invalidText="Please enter a valid hostname."
          />
          <SlzTextInput
            id="domain"
            componentName="Domain"
            field="domain"
            labelText={"Domain"}
            value={this.state.teleport_config.domain}
            onChange={this.teleportConfigChange}
            className="textInputMedium"
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="teleport-https-key"
            componentName="HTTPS Key"
            field="https_key"
            labelText={"HTTPS Key"}
            value={this.state.teleport_config.https_key}
            onChange={this.teleportConfigChange}
            className="fieldWidthMedium"
          />
          <SlzTextInput
            id="https_cert"
            componentName="HTTP Certification"
            field="https_cert"
            labelText={"HTTPS Cert"}
            value={this.state.teleport_config.https_cert}
            onChange={this.teleportConfigChange}
            className="textInputMedium"
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <SlzSelect
            labelText="Object Storage Bucket"
            component="Teleport"
            name="cos_bucket_name"
            groups={this.props.slz.store.cosBuckets}
            value={this.state.teleport_config.cos_bucket_name || ""}
            handleInputChange={this.teleportConfigChange}
            className="fieldWidthMedium"
            invalid={this.state.teleport_config.cos_bucket_name === ""}
            invalidText="Select an Object Storage bucket."
          />
          <SlzSelect
            key={this.state.keys}
            store={this.props.slz.store}
            component="teleport-cos-key"
            labelText="Object Storage HMAC Key"
            groups={getCosKeysFromBucket(this.state, this.props)}
            name="cos_key_name"
            invalid={checkNullorEmptyString(this.state.cos_key_name)}
            invalidText="Object Storage HMAC Credentials are required."
            value={this.state.teleport_config.cos_key_name || ""}
            handleInputChange={this.teleportConfigChange}
            className="fieldWidth marginBottomSmall leftTextAlign"
          />
          <SaveAddButton
            type="add"
            hoverText="Create a new key"
            disabled={isNullOrEmptyString(
              this.state.teleport_config.cos_bucket_name
            )}
            onClick={this.toggleCosKeyModal}
            inline
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzSelect
            component="Teleport"
            name="app_id_key_name"
            groups={this.props.slz.store.configDotJson.appid.keys}
            value={this.state.teleport_config.app_id_key_name}
            handleInputChange={this.teleportConfigChange}
            labelText="Teleport App ID Key"
            className="fieldWidthMedium"
            invalidText="Select an App ID Resource Key"
          />
          <SaveAddButton
            type="add"
            hoverText="Create a new key"
            onClick={this.toggleAppIdKeyModal}
            inline
          />
        </SlzFormGroup>
        {/* modal for handling cos key creation */}
        <InstanceFormModal
          name="Create an Object Storage HMAC Credential"
          show={this.state.showCosKeyModal}
          onRequestSubmit={this.cosKeySubmit}
          onRequestClose={this.toggleCosKeyModal}
        >
          <ObjectStorageKeyForm
            arrayParentName={getBucketInstance(
              this.state.teleport_config.cos_bucket_name,
              this.props
            )}
            name="new-cos-key"
            key="new-key"
            role={[""]}
            slz={this.props.slz}
            isTeleport
            shouldDisableSubmit={function() {
              if (
                // check for invalid name
                hasInvalidName("cos_keys", this.state.name, this.props).invalid
              ) {
                this.props.disableModal();
              } else {
                this.props.enableModal();
              }
            }}
          />
        </InstanceFormModal>
        {/* modal for handling cos key creation */}
        <InstanceFormModal
          name="Add an App ID Key"
          show={this.state.showAppIdKeyModal}
          onRequestSubmit={this.handleKeyAdd}
          onRequestClose={this.toggleAppIdKeyModal}
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
        <SlzFormGroup>
          <TextArea
            name="message_of_the_day"
            labelText="Message Of The Day"
            value={this.state.teleport_config.message_of_the_day}
            onChange={this.teleportConfigChange}
            className="textInputWide"
          />
        </SlzFormGroup>
        <TeleportClaimToRoles slz={this.props.slz} />
      </div>
    );
  }
}

TeleportConfigForm.propTypes = {
  slz: PropTypes.shape({
    cos: PropTypes.shape({
      keys: PropTypes.shape({
        create: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    store: PropTypes.shape({
      cosBuckets: PropTypes.array.isRequired
    }).isRequired
  }).isRequired
};

export default TeleportConfigForm;
