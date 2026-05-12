import React, { Component } from "react";
import {
  SlzSelect,
  ResourceGroupSelect,
  KmsKeySelect,
  SlzHeading,
  SlzFormGroup,
  DynamicRender,
  SshKeyMultiSelect,
  SaveAddButton,
  FlavorSelect,
  SlzNameInput,
} from "../../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../../component-utils.js";
import { stateInit, propsMatchState } from "../../../../lib/index.js";
import { buildNumberDropdownList } from "lazy-z";
import PropTypes from "prop-types";
import { Tile } from "@carbon/react";
import { newF5Vsi } from "../../../../lib/builders.js";
class F5VsiForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...stateInit("f5_vsi", this.props) };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleVsiSave = this.handleVsiSave.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handle input change - this is only called for setting ruleProtocol and must update the rule object based on the input
   * @param {string} name key to change in state
   * @param {event} event occurred event
   */
  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({ [name]: name === "zones" ? Number(value) : value });
  }

  /**
   * handle vsi instance save
   * @param {*} stateData
   */
  handleVsiSave(stateData) {
    this.props.slz.f5.instance.save(stateData);
  }

  render() {
    let vsi = [...this.props.slz.store.configDotJson.f5_vsi];
    // if vsi is less than total zones
    while (vsi.length < this.state.zones) {
      // add a new vsi to display
      vsi.push(
        newF5Vsi(
          this.props.slz.store.edge_pattern,
          `zone-${vsi.length + 1}`,
          this.props.slz.store.f5_on_management,
          {
            f5_image_name: vsi[0]?.f5_image_name || "",
            resource_group: vsi[0]?.resource_group || "",
            ssh_keys: vsi[0]?.ssh_keys || [],
            machine_type: vsi[0]?.machine_type || "",
          },
        ),
      );
    }
    return (
      <>
        <SlzFormGroup>
          <SlzSelect
            component="num-f5-zones-select"
            groups={buildNumberDropdownList(4)} // 0-3 Zones
            value={this.state.zones.toString()}
            labelText="F5 Instance Zones"
            name="zones"
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          <ResourceGroupSelect
            component="f5-instances"
            slz={this.props.slz}
            value={this.state.resource_group}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          <SshKeyMultiSelect
            slz={this.props.slz}
            id="f5"
            initialSelectedItems={this.state.ssh_keys}
            onChange={(selectedItems) => {
              this.handleInputChange({
                target: { name: "ssh_keys", value: selectedItems },
              });
            }}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzSelect
            component="f5-image-select"
            value={this.state.f5_image_name}
            groups={[
              "f5-bigip-15-1-5-1-0-0-14-all-1slot",
              "f5-bigip-15-1-5-1-0-0-14-ltm-1slot",
              "f5-bigip-16-1-2-2-0-0-28-ltm-1slot",
              "f5-bigip-16-1-2-2-0-0-28-all-1slot",
              "f5-bigip-16-1-3-2-0-0-4-ltm-1slot",
              "f5-bigip-16-1-3-2-0-0-4-all-1slot",
              "f5-bigip-17-0-0-1-0-0-4-ltm-1slot",
              "f5-bigip-17-0-0-1-0-0-4-all-1slot",
            ]}
            labelText="F5 Image"
            name="f5_image_name"
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
          <FlavorSelect
            kind="vsi"
            value={this.state.machine_type}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>

        {this.props.slz.store.configDotJson.f5_vsi.length > 0 && (
          <div>
            <SlzHeading
              name="F5 Big IP Virtual Servers"
              type="subHeading"
              className="marginBottomSmall"
            />
            <div className="displayFlex">
              {vsi.map((instance, index) => {
                if (index < this.state.zones)
                  return (
                    <F5VsiTile
                      key={"f5-vsi-tile" + JSON.stringify(instance) + index}
                      data={instance}
                      onSave={this.handleVsiSave}
                      slz={this.props.slz}
                      totalZones={this.state.zones}
                      index={index}
                    />
                  );
              })}
            </div>
          </div>
        )}
      </>
    );
  }
}

class F5VsiTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...stateInit("vsi", this.props),
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle input change
   * @param {event} event event
   */
  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }
  render() {
    return (
      <Tile className="marginRight fieldWidth">
        <SlzHeading
          name={this.state.name}
          type="subHeading"
          className="marginBottomSmall"
          buttons={
            <DynamicRender
              hide={
                // hide state button when vsi not in state
                this.props.index + 1 >
                this.props.slz.store.configDotJson.f5_vsi.length
              }
              show={
                <SaveAddButton
                  onClick={() => this.props.onSave(this.state)}
                  noDeleteButton
                  disabled={propsMatchState("f5_vsi", this.state, this.props)}
                />
              }
            />
          }
        />
        {/* name */}
        <SlzFormGroup className="marginBottomSmall">
          <SlzNameInput
            id={this.state.name}
            componentName={this.state.name}
            component="vsi"
            value={this.state.name}
            className="fieldWidthSmaller"
            onChange={this.handleInputChange}
            readOnly
            componentProps={this.props}
            useData
          />
        </SlzFormGroup>
        <SlzFormGroup className="marginBottomSmall">
          {/* Select Resource Group */}
          <ResourceGroupSelect
            handleInputChange={this.handleInputChange}
            slz={this.props.slz}
            component={this.props.data.name}
            value={this.state.resource_group}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>
        <SlzFormGroup className="marginBottomSmall">
          {/* Machine type */}
          <KmsKeySelect
            component={this.props.data.name}
            slz={this.props.slz}
            name="boot_volume_encryption_key_name"
            value={this.state.boot_volume_encryption_key_name}
            handleInputChange={this.handleInputChange}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>
      </Tile>
    );
  }
}

F5VsiForm.propTypes = {
  slz: PropTypes.shape({
    f5: PropTypes.shape({
      instance: PropTypes.shape({
        save: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        f5_vsi: PropTypes.array.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default F5VsiForm;
