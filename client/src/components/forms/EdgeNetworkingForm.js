import React, { Component } from "react";
import { Modal, RadioButtonGroup, RadioButton, Tile } from "@carbon/react";
import { buildFormDefaultInputMethods } from "../component-utils.js";
import { edgeNetworkingPatterns } from "../../lib/index.js";
import { EdgeNetworkingDocs } from "./SlzDocs.js";
import { buildNumberDropdownList } from "lazy-z";
import edgeNetwork from "../../images/edge-network.png";
import { StatelessToggleForm, SaveAddButton, SlzSelect } from "../icse/index.js";
import PropTypes from "prop-types";

/** EdgeNetworkingForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class EdgeNetworkingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pattern: "vpn-and-waf",
      useManagement: this.props.useManagement,
      zones: this.props.zones,
      showModal: false,
      hide: true
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.hide = this.hide.bind(this);
    this.handleModal = this.handleModal.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleVpcSelect = this.handleVpcSelect.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handleRadioChange for radio buttons
   * @param {String} name selection
   */
  handleRadioChange(name) {
    this.setState({ pattern: name });
  }
  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   */
  handleToggle(name) {
    this.setState(this.toggleStateBoolean(name, this.state));
  }

  /**
   * handleInputChange
   * @param {event} event
   */
  handleInputChange(event) {
    if (event.target.name === "zones") {
      this.setState({ zones: parseInt(event.target.value) });
    } else this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * handleVpcSelect for selecting which type of vpc to use
   * @param {event} event occurred event
   */
  handleVpcSelect(event) {
    let selection = event.target.value; // selected value in dropdown
    this.setState({
      useManagement: selection === "Use the existing Management VPC"
    });
  }

  /**
   * Called when the modal is closed
   */
  hide() {
    this.setState(this.toggleStateBoolean("showModal", this.state));
  }

  /**
   * handle modal
   */
  handleModal() {
    this.setState({ showModal: true });
  }

  /**
   * handle updating vsi deployments
   */
  handleUpdate() {
    this.props.slz.f5.vsi.save(this.state);
  }

  /**
   * handle save
   */
  handleSave() {
    // if we haven't created the network yet
    if (this.props.slz.store.edge_pattern === undefined) {
      this.props.slz.store.edge_pattern = this.state.pattern;
      // otherwise just create the edge network
      this.props.slz.createEdgeVpc(
        this.state.pattern,
        this.state.useManagement
      );
      if (this.state.zones !== 0) {
        // in this case, create both the edge vpc and the f5vsi instance
        this.props.slz.f5.vsi.create(this.state);
      }
    }
    this.hide(); // hide modal
  }

  render() {
    return (
      <div>
        <div className="formInSubForm marginRightHome">
          <StatelessToggleForm
            hide={this.state.hide}
            iconType="add"
            onIconClick={() => this.handleToggle("hide")}
            name="(Optional) Transit VPC and Edge Networking"
            subHeading
            buttons={
              <SaveAddButton
                noDeleteButton
                onClick={
                  this.props.slz.store.edge_pattern === undefined
                    ? this.handleModal
                    : this.handleUpdate
                }
              />
            }
          >
            <div id="edge-networking-form" className="marginTopSmall">
              <EdgeNetworkingDocs />
              <div className="displayFlex spaceBetween">
                <div>
                  <RadioButtonGroup
                    legendText="Edge Networking Pattern"
                    name="en-pattern-select"
                    defaultSelected={
                      this.state.pattern || this.props.slz.store.edge_pattern
                    }
                    className="leftTextAlign marginBottom"
                    onChange={this.handleRadioChange}
                    disabled={this.props.slz.store.edge_pattern !== undefined}
                    orientation="vertical"
                  >
                    {edgeNetworkingPatterns.map(pattern => (
                      <RadioButton
                        labelText={pattern.name}
                        value={pattern.id}
                        id={pattern.id}
                        key={pattern.id}
                      />
                    ))}
                  </RadioButtonGroup>
                  <SlzSelect
                    name="VPC"
                    component="en-vpc-select"
                    value={
                      this.state.useManagement
                        ? "Use the existing Management VPC"
                        : "Create a new Edge VPC"
                    }
                    groups={[
                      "Create a new Edge VPC",
                      "Use the existing Management VPC"
                    ]}
                    labelText="VPC"
                    handleInputChange={this.handleVpcSelect}
                    className="marginBottomSmall"
                    disabled={this.props.slz.store.edge_pattern !== undefined}
                  />
                  <SlzSelect
                    component="num-f5-zones-select"
                    groups={buildNumberDropdownList(4)} // 0-3 zones
                    value={this.state.zones.toString()}
                    labelText="F5 Instance Zones"
                    name="zones"
                    handleInputChange={this.handleInputChange}
                    className="marginBottomSmall"
                  />
                  <div className="leftTextAlign">
                    <div className="smallerText">Related Links</div>
                    <a
                      href="https://clouddocs.f5.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="smallerText"
                    >
                      Docs
                    </a>
                  </div>
                </div>
                <div className="edgeTileMargin">
                  <a
                    href={edgeNetwork}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tile"
                  >
                    <Tile className={"edgeTile borderGray"}>
                      <h4>Edge Network</h4>
                      <img
                        alt="Edge Networking Image"
                        src={edgeNetwork}
                        className="imageMargin edgeTileImage magnifier"
                      />
                    </Tile>
                  </a>
                </div>
              </div>
            </div>
          </StatelessToggleForm>
        </div>
        {this.state.showModal && (
          <Modal
            className="leftTextAlign"
            modalHeading={"Are you sure you want to create an edge network?"}
            open={this.state.showModal}
            onRequestSubmit={this.handleSave}
            onRequestClose={this.hide}
            primaryButtonText="Submit"
            secondaryButtonText="Cancel"
            danger
          >
            {this.state.useManagement ? (
              <p>
                Adding onto the management VPC cannot be undone without
                resetting your configuration.
              </p>
            ) : (
              <p>
                This action can not be undone and may require you to reset your
                configuration.
              </p>
            )}
          </Modal>
        )}
      </div>
    );
  }
}

EdgeNetworkingForm.defaultProps = {
  useManagement: false
};

EdgeNetworkingForm.propTypes = {
  useManagement: PropTypes.bool.isRequired,
  zones: PropTypes.number.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      edge_pattern: PropTypes.string // can be null
    }).isRequired,
    f5: PropTypes.shape({
      vsi: PropTypes.shape({
        save: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    createEdgeVpc: PropTypes.func.isRequired
  }).isRequired
};

export default EdgeNetworkingForm;
