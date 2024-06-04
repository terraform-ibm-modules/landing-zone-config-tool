import {
  contains,
  deepEqual,
  getObjectFromArray,
  isString,
  splat
} from "lazy-z";
import React from "react";
import { SubnetTierForm } from "./instance-forms/index.js";
import {
  SlzHeading,
  StatelessToggleForm,
  SaveAddButton,
  SlzTabPanel,
  InstanceFormModal,
  EmptyResourceTile
} from "../icse/index.js";
import { SubnetDocs } from "./SlzDocs.js";
import PropTypes from "prop-types";

class SubnetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      vpcName: "default", // name set to default to prevent error where toUpperCase cannot read empty string
      shownGateways: [],
      vpcs: {},
      shownVpcs: [],
      vpcList: [...this.props.slz.store.configDotJson.vpcs],
      lastSaved: {
        vpcIndex: null,
        tierIndex: null
      }
    };
    this.props.slz.store.configDotJson.vpcs.forEach(network => {
      this.state.vpcs[network.prefix] = { ...network.use_public_gateways };
    });
    this.toggleModal = this.toggleModal.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.mapToggle = this.mapToggle.bind(this);
    this.onGatewaySave = this.onGatewaySave.bind(this);
    this.onGatewayZoneToggle = this.onGatewayZoneToggle.bind(this);
    this.disablePgwSave = this.disablePgwSave.bind(this);
    this.onSaveCallback = this.onSaveCallback.bind(this);
  }

  /**
   * set last saved to keep open
   * @param {*} vpcIndex index of vpc
   * @param {*} tierIndex index of tier in vpc
   */
  onSaveCallback(vpcIndex, tierIndex) {
    this.setState({
      lastSaved: {
        vpcIndex: vpcIndex,
        tierIndex: tierIndex
      }
    });
  }

  /**
   * show/hide public gateway form
   * @param {string} network vpc network prefix
   */
  mapToggle(network, isVpc) {
    let stateFieldName = isVpc ? "shownVpcs" : "shownGateways";
    let shownResources = this.state[stateFieldName];
    if (contains(shownResources, network)) {
      shownResources = shownResources.filter(value => {
        if (value !== network) return value;
      });
    } else {
      shownResources.push(network);
    }
    this.setState({ [stateFieldName]: shownResources });
  }

  /**
   * toggle zone in vpc
   * @param {string} network vpc network prefix
   * @param {string} zone zone to toggle
   */
  onGatewayZoneToggle(network, zone) {
    let vpcs = { ...this.state.vpcs };
    vpcs[network][zone] = !vpcs[network][zone];
    this.setState({ vpcs: vpcs });
  }

  /**
   * toggle modal and render vpc name
   * @param {string=} vpcName name of vpc
   */
  toggleModal(vpcName) {
    if (isString(vpcName)) {
      this.setState({ showModal: !this.state.showModal, vpcName: vpcName });
    } else {
      this.setState({ showModal: !this.state.showModal });
    }
  }

  onModalSubmit(data) {
    this.props.slz.vpcs.subnetTiers.create(data, {
      vpc_name: this.state.vpcName
    });
    this.toggleModal();
  }

  onGatewaySave(network) {
    this.props.slz.vpcs.save(
      { prefix: network, use_public_gateways: this.state.vpcs[network] },
      {
        slz: this.props.slz,
        data: getObjectFromArray(
          this.props.slz.store.configDotJson.vpcs,
          "prefix",
          network
        )
      }
    );
  }

  disablePgwSave(network) {
    let gwProps = getObjectFromArray(
      this.props.slz.store.configDotJson.vpcs,
      "prefix",
      network
    ).use_public_gateways;
    let currentGw = this.state.vpcs[network];
    return deepEqual(gwProps, currentGw);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ vpcList: [...this.props.slz.store.configDotJson.vpcs] });
    }
  }

  render() {
    return (
      <div id="subnets-form">
        <SlzTabPanel
          name="VPC subnets"
          hideFormTitleButton
          form={
            <>
              {/* subnet tier creation modal */}
              <InstanceFormModal
                name={`Add a Subnet Tier in ${
                  this.state.vpcName || "default"
                } VPC`}
                show={this.state.showModal}
                onRequestClose={this.toggleModal}
                onRequestSubmit={this.onModalSubmit}
              >
                {/* modal form */}
                <SubnetTierForm
                  slz={this.props.slz}
                  vpc_name={this.state.vpcName}
                />
              </InstanceFormModal>

              {/* render subnet forms for each VPC */}
              {this.state.vpcList.map(network => (
                <div
                  className="subForm marginBottomNone"
                  key={"subnets-" + network.prefix}
                >
                  <StatelessToggleForm
                    name={network.prefix + " VPC"}
                    onIconClick={() => this.mapToggle(network.prefix, true)}
                    hide={
                      contains(this.state.shownVpcs, network.prefix) === false
                    }
                  >
                    {/* if subnet tiers is empty */}
                    <SlzHeading
                      name="Subnet Tiers"
                      className="marginRight marginBottomSmall"
                      type="subHeading"
                      buttons={
                        <SaveAddButton
                          onClick={() => this.toggleModal(network.prefix)}
                          type="add"
                          noDeleteButton
                        />
                      }
                    />
                    <EmptyResourceTile
                      name="Subnet Tiers"
                      showIfEmpty={[
                        ...this.props.slz.store.subnetTiers[network.prefix]
                      ]}
                    />
                    {/* render each subnet tier form */}
                    {[...this.props.slz.store.subnetTiers[network.prefix]].map(
                      tier => (
                        <SubnetTierForm
                          tier={tier}
                          vpc_name={network.prefix}
                          key={
                            network.prefix +
                            "-" +
                            tier.name +
                            "-" +
                            tier.acl_name
                          }
                          onSaveCallback={this.onSaveCallback}
                          slz={this.props.slz}
                          index={splat(
                            this.props.slz.store.subnetTiers[network.prefix],
                            "name"
                          ).indexOf(tier.name)}
                          vpcIndex={splat(
                            [...this.props.slz.store.configDotJson.vpcs],
                            "prefix"
                          ).indexOf(network.prefix)}
                          hide={
                            // force open if last saved and rerender
                            splat(
                              [...this.props.slz.store.configDotJson.vpcs],
                              "prefix"
                            ).indexOf(network.prefix) !==
                              this.state.lastSaved.vpcIndex &&
                            splat(
                              this.props.slz.store.subnetTiers[network.prefix],
                              "name"
                            ).indexOf(tier.name) !==
                              this.state.lastSaved.tierIndex
                          }
                        />
                      )
                    )}
                  </StatelessToggleForm>
                </div>
              ))}
            </>
          }
          about={<SubnetDocs />}
        />
      </div>
    );
  }
}

SubnetForm.propTypes = {
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        vpcs: PropTypes.array.isRequired
      }).isRequired
    }).isRequired,
    vpcs: PropTypes.shape({
      save: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};

export default SubnetForm;
