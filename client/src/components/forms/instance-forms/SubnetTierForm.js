import React from "react";
import {
  subnetTierFormList,
  subnetTierInitState,
  subnetTierModalList,
  subnetTierName,
  subnetTierVpcHasNoEnabledGateways,
  reservedSubnetNameExp,
  disableSave,
  propsMatchState,
  hasInvalidName,
} from "../../../lib/index.js";
import {
  SlzNameInput,
  SlzSelect,
  SlzNumberSelect,
  DynamicRender,
  StatelessToggleForm,
  SlzFormGroup,
  SlzSubForm,
  DeleteButton,
  SaveAddButton,
  DeleteModal,
  SlzToggle,
} from "../../icse/index.js";
import SubnetTileForm from "./SubnetTileForm.js";
import PropTypes from "prop-types";

class SubnetTierForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...subnetTierInitState(this.props) };
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.handleShowToggle = this.handleShowToggle.bind(this);
    this.shouldDisableSubmit = this.shouldDisableSubmit.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.onSubnetSave = this.onSubnetSave.bind(this);
    this.subnetList = this.subnetList.bind(this);
  }

  /**
   * Handle input change
   * @param {event} event
   */
  handleChange(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  /**
   * handle toggle
   */
  handleToggle() {
    this.setState({ addPublicGateway: !this.state.addPublicGateway });
  }
  /**
   * toggle delete modal
   */
  toggleDeleteModal() {
    this.setState({ showDeleteModal: !this.state.showDeleteModal });
  }

  /**
   * handle hide/show form data
   */
  handleShowToggle() {
    this.setState({ hide: !this.state.hide });
  }

  onSave() {
    this.props.onSaveCallback(this.props.vpcIndex, this.props.index);
    this.props.slz.vpcs.subnetTiers.save(this.state, this.props);
  }

  onSubnetSave(stateData, componentProps) {
    this.props.slz.vpcs.subnets.save(stateData, componentProps);
    this.handleShowToggle();
  }

  onDelete() {
    this.props.slz.vpcs.subnetTiers.delete(this.state, this.props);
  }

  shouldDisableSubmit() {
    if (this.props.isModal) {
      if (disableSave("subnet_tiers", this.state, this.props) === false)
        this.props.enableModal();
      else this.props.disableModal();
    }
  }

  componentDidUpdate() {
    this.shouldDisableSubmit();
  }

  componentDidMount() {
    this.shouldDisableSubmit();
  }

  subnetList() {
    // vpc index
    let nextTierSubnets = [];
    if (this.props.isModal)
      nextTierSubnets = subnetTierModalList(this.state, this.props);
    else nextTierSubnets = subnetTierFormList(this.state, this.props);
    return nextTierSubnets;
  }

  render() {
    let composedId = `${this.props.vpc_name}-tier-${
      this.props.tier.name === "" ? "new-subnet-tier" : this.props.tier.name
    }`;
    let noDeleteButton =
      this.props.vpc_name === this.props.slz.store.edge_vpc_prefix &&
      this.props.tier.name.match(reservedSubnetNameExp) !== null;
    let tierName = subnetTierName(this.props.tier.name);
    return (
      <SlzSubForm formInSubForm id={composedId} className="marginBottomSmall">
        <DeleteModal
          name={tierName}
          modalOpen={this.state.showDeleteModal}
          onModalClose={this.toggleDeleteModal}
          onModalSubmit={this.onDelete}
        />

        <StatelessToggleForm
          hideTitle={this.props.isModal === true}
          hide={this.state.hide}
          props={this.props}
          onIconClick={this.handleShowToggle}
          toggleFormTitle
          name={tierName}
          buttons={
            <>
              <SaveAddButton
                onClick={this.onSave}
                noDeleteButton={noDeleteButton}
                disabled={
                  disableSave("subnet_tiers", this.state, this.props) ||
                  propsMatchState("subnetTiers", this.state, this.props)
                }
              />
              <DynamicRender
                hide={noDeleteButton}
                show={
                  <DeleteButton
                    name={tierName}
                    onClick={this.toggleDeleteModal}
                  />
                }
              />
            </>
          }
        >
          <>
            <SlzFormGroup>
              <SlzNameInput
                id={
                  this.props.isModal
                    ? "new-tier-name"
                    : this.props.tier.name + "-tier-name"
                }
                value={this.state.name}
                componentProps={this.props}
                slz={this.props.slz}
                parentName={this.props.vpc_name}
                component="subnetTiers"
                onChange={this.handleChange}
                className="fieldWidthSmaller"
                readOnly={
                  this.props.vpc_name ===
                    this.props.slz.store?.edge_vpc_prefix &&
                  this.props.tier.name.match(reservedSubnetNameExp) !== null
                }
                {...hasInvalidName}
              />
              <SlzNumberSelect
                max={3}
                value={this.state.zones}
                labelText="Subnet tier zones"
                name="zones"
                handleInputChange={this.handleChange}
                className="fieldWidthSmaller"
                invalid={this.state.zones === 0}
                invalidText="At least one zone must be selected."
                component={this.props.tier.name}
              />
              <SlzSelect
                tooltip={{
                  content:
                    "Changing this field will overwrite existing network ACL changes to subnets in this tier.",
                }}
                component={this.props.tier.name}
                className="fieldWidthSmaller"
                field="networkAcl"
                name="networkAcl"
                value={this.state.networkAcl || ""}
                vpcName={this.props.vpc_name}
                labelText="Network ACL"
                groups={this.props.slz.store.networkAcls[this.props.vpc_name]}
                handleInputChange={this.handleChange}
                isModal={this.props.isModal}
              />
            </SlzFormGroup>
            <SlzFormGroup className="marginBottomSmall">
              <SlzToggle
                tooltip={{
                  content: subnetTierVpcHasNoEnabledGateways(this.props)
                    ? "This VPC has no public gateways enabled. To add public gateways, return to the VPC page."
                    : "Changing this field will overwrite existing public gateway changes to subnets in this tier.",
                }}
                id={composedId + "-public-gateway"}
                labelText="Use public gateways"
                defaultToggled={this.state.addPublicGateway}
                onToggle={this.handleToggle}
                isModal={this.props.isModal}
                toggleFieldName="public_gateway"
                disabled={subnetTierVpcHasNoEnabledGateways(this.props)}
              />
            </SlzFormGroup>
            <SubnetTileForm
              tier={this.props.tier.name}
              slz={this.props.slz}
              vpc_name={this.props.vpc_name}
              onSave={this.onSubnetSave}
              isModal={this.props.isModal}
              subnets={this.subnetList()}
              key={this.state.zones}
            />
          </>
        </StatelessToggleForm>
      </SlzSubForm>
    );
  }
}

SubnetTierForm.defaultProps = {
  tier: {
    name: "",
    zones: 1,
  },
  isModal: false,
  hide: true,
};

SubnetTierForm.propTypes = {
  isModal: PropTypes.bool.isRequired,
  tier: PropTypes.shape({
    name: PropTypes.string.isRequired,
    zones: PropTypes.number.isRequired,
  }),
  hide: PropTypes.bool.isRequired,
  onSaveCallback: PropTypes.func,
  slz: PropTypes.shape({
    vpcs: PropTypes.shape({
      save: PropTypes.func.isRequired,
      delete: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  enableModal: PropTypes.func,
  disableModal: PropTypes.func,
  vpc_name: PropTypes.string.isRequired,
};

export default SubnetTierForm;
