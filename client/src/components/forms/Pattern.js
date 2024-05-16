import React, { Component } from "react";
import { Form, RadioButtonGroup, RadioButton, Modal } from "@carbon/react";
import { PatternDocs } from "./SlzDocs.js";
import {
  patterns,
  newDefaultManagementServer,
  newDefaultWorkloadServer,
  newDefaultManagementCluster,
  subnetTierInitState
} from "../../lib/index.js";
import { carve, getObjectFromArray, contains, eachKey } from "lazy-z";
import PrefixForm from "./Prefix.js";
import { PatternTile, SlzFormGroup, SlzNumberSelect } from "../icse/index.js";
import {
  accessGroupInit,
  appidInit,
  atrackerInit,
  cosInit,
  f5Init,
  iamInit,
  keyManagementInit,
  resourceGroupInit,
  securityGroupInit,
  sshKeyInit,
  teleportInit,
  transitGatewayInit,
  vpcInit,
  updateSubnetTier,
  vpeInit,
  vpnInit,
  clusterInit
} from "../../lib/store/index.js";// import from store here to prevent dependency errors

/**
 * PatternForm
 * @param {Object} props
 * @param {slz} props.slz slz state store
 */
class PatternForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pattern: "",
      showModal: false,
      selectedPattern: null,
      patternSetOnPage: !this.props.slz.store.pattern,
      zones: this.props.slz.store.zones || 3
    };
    this.updatePattern = this.updatePattern.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleZoneChange = this.handleZoneChange.bind(this);
    if (this.props.slz.store.pattern) {
      this.state.pattern = this.props.slz.store.pattern;
    }
  }

  toggleModal() {
    this.setState({
      showModal: !this.state.showModal,
      pattern: this.props.slz.store.pattern
    });
  }

  /**
   * update defaults based on pattern
   * @param {string} pattern name of pattern
   */
  updatePattern(pattern) {
    let slz = {
      store: { ...this.props.slz.store }
    };
    slz.store.pattern = pattern;
    resourceGroupInit(slz);
    keyManagementInit(slz);
    cosInit(slz);
    vpcInit(slz);
    transitGatewayInit(slz);
    securityGroupInit(slz);
    vpeInit(slz);
    vpnInit(slz);
    accessGroupInit(slz);
    atrackerInit(slz);
    appidInit(slz);
    f5Init(slz);
    iamInit(slz);
    if (slz.store.configDotJson.security_compliance_center) {
      delete slz.store.configDotJson.security_compliance_center;
    }
    teleportInit(slz);
    clusterInit(slz);

    switch(pattern) {
      case "roks":
        slz.store.configDotJson.key_management.keys.pop();
        slz.store.configDotJson.ssh_keys = [];
        slz.store.configDotJson.vsi = [];
        slz.store.configDotJson.clusters.push(newDefaultManagementCluster());
        break;
      case "vsi":
        slz.store.configDotJson.vsi = [newDefaultManagementServer()];
        slz.store.configDotJson.vsi.push(newDefaultWorkloadServer());
        slz.store.configDotJson.clusters = [];
        carve(
          slz.store.configDotJson.key_management.keys,
          "name",
          "slz-roks-key"
        );
        sshKeyInit(slz);
        break;
      case "vpc":
        slz.store.configDotJson.clusters = [];
        slz.store.configDotJson.key_management.keys.pop();
        slz.store.configDotJson.ssh_keys = [];
        slz.store.configDotJson.vsi = [];
        break;
    }

    this.props.slz.store = slz.store;
    this.setState({ pattern: pattern }, () => {
      this.props.slz.update();
    });
  }

  /**
   * handleRadioChange for radio buttons
   * @param {String} id pattern id
   */
  handleRadioChange(id) {
    // check if the pattern has been set on this page if it has then select is fine
    if (this.state.patternSetOnPage) {
      this.updatePattern(id);
    } else if (this.state.showModal) {
      this.setState({ showModal: false }, () => {
        this.updatePattern(id);
      });
    } else {
      this.setState({
        selectedPattern: id,
        showModal: true
      });
    }
  }

  /**
   * change zones
   * @param {Object} event
   */
  handleZoneChange(event) {
    let zones = event.target.value;
    eachKey(this.props.slz.store.subnetTiers, vpc => {
      this.props.slz.store.subnetTiers[vpc].forEach(tier => {
        if (tier.name !== "vpn") {
          let newState = subnetTierInitState({
            tier: tier,
            slz: this.props.slz,
            vpc_name: vpc
          });
          newState.zones = zones;
          updateSubnetTier(this.props.slz, newState, {
            tier: tier,
            slz: this.props.slz,
            vpc_name: vpc
          });
        }
      });
    });
    this.props.slz.store.zones = zones;
    this.props.slz.update();
    this.setState({ zones: zones });
  }

  render() {
    return (
      <Form id="pattern-form">
        <div className="subForm">
          <h5 className="leftTextAlign marginBottomSmall">Select a deployable architecture</h5>
          <div className="displayFlex spaceBetween">
            <div>
              <Modal
                modalHeading="Change deployable architecture"
                className="leftTextAlign"
                alert={true}
                danger={true}
                open={this.state.showModal}
                onRequestClose={this.toggleModal}
                onRequestSubmit={() =>
                  this.handleRadioChange(this.state.selectedPattern)
                }
                primaryButtonText="Continue"
                secondaryButtonText="Cancel"
              >
                Selecting a new deployable architecture will overwrite existing components. This
                cannot be undone.
              </Modal>
              <PatternDocs />
              <SlzFormGroup>
                <RadioButtonGroup
                  legendText="Pattern"
                  name="pattern-select"
                  defaultSelected={this.state.pattern}
                  className="leftTextAlign marginBottomSmall"
                  onChange={this.handleRadioChange}
                  orientation="vertical"
                  key={JSON.stringify(this.state)} // force update on modal cancel
                >
                  {patterns
                    .concat(
                      this.props.slz.store.pattern === "custom"
                        ? [
                            {
                              title: "Custom Imported JSON",
                              description: "Custom imported pattern",
                              id: "custom"
                            }
                          ]
                        : []
                    )
                    .map(pattern => (
                      <RadioButton
                        labelText={pattern.title}
                        value={pattern.id}
                        id={pattern.id}
                        key={pattern.id}
                      />
                    ))}
                </RadioButtonGroup>
                <SlzNumberSelect
                  component="pattern"
                  max={3}
                  value={this.state.zones}
                  labelText="Availability zones"
                  handleInputChange={this.handleZoneChange}
                  disabled={
                    this.props.slz.store.pattern === "custom" ||
                    this.state.pattern === ""
                  }
                  name="zones"
                  tooltip={{
                    content:
                      "Availability zones reduce single points of failure by each being an additional copy of the resource."
                  }}
                  helperText={
                    this.state.pattern === ""
                      ? "Select a deployable architecture to edit availability zones"
                      : this.state.pattern === "custom"
                      ? "Availability zones must be changed manually for custom deployments"
                      : ""
                  }
                />
              </SlzFormGroup>
            </div>
            {!contains(["custom", ""], this.state.pattern) && (
              <div
                key={getObjectFromArray(patterns, "id", this.state.pattern).id}
                id={getObjectFromArray(patterns, "id", this.state.pattern).id}
              >
                <PatternTile
                  state={getObjectFromArray(patterns, "id", this.state.pattern)}
                />
              </div>
            )}
          </div>
          <br />
          <PrefixForm slz={this.props.slz} />
          <br />
          {/* <EdgeNetworkingForm // optional f5 components
            slz={this.props.slz}
            useManagement={false} // defaults
            pattern="vpn-and-waf"
            zones={this.props.slz.store.configDotJson.f5_vsi.length}
          /> */}
        </div>
      </Form>
    );
  }
}

export default PatternForm;
