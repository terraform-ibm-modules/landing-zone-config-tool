import React, { Component } from "react";
import NetworkingRuleForm from "./NetworkingRuleForm.js";
import { containsKeys } from "lazy-z";
import {
  getRuleProtocol,
  getSubRule,
  disableSave,
} from "../../../../lib/index.js";
import {
  DynamicRender,
  SlzHeading,
  EmptyResourceTile,
  SaveAddButton,
  InstanceFormModal,
} from "../../../icse/index.js";
import PropTypes from "prop-types";

/**
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class NetworkingRulesOrderCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rules: [...this.props.rules],
      collapse: {},
      allCollapsed: false,
      showModal: false,
    };

    this.swapArrayElements = this.swapArrayElements.bind(this);
    this.handleCardUp = this.handleCardUp.bind(this);
    this.handleCardDown = this.handleCardDown.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (
      this.state.allCollapsed === false &&
      !this.props.slz.store.cheatsEnabled
    )
      this.collapseAll();
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  /**
   * toggle collapse rule
   * @param {string} ruleName rule name
   */
  toggleCollapse(ruleName) {
    let collapse = this.state.collapse;
    collapse[ruleName] = !containsKeys(this.state.collapse, ruleName) // if rule dies not exist
      ? true // set to true
      : !this.state.collapse[ruleName]; // otherwise set to opposite
    this.setState({ collapse: collapse });
  }

  /**
   * collapse each rule
   */
  collapseAll() {
    let collapse = this.state.collapse;
    this.state.rules.forEach((rule) => {
      collapse[rule.name] = !this.state.allCollapsed;
    });
    this.setState({
      collapse: collapse,
      allCollapsed: !this.state.allCollapsed,
    });
  }

  /**
   * Helper function to move items up and down in the list so they can be rendered properly
   * @param {Array} arr
   * @param {number} indexA
   * @param {number} indexB
   */
  swapArrayElements(arr, indexA, indexB) {
    let temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
  }

  /**
   * Move the card up
   * @param {number} index
   */
  handleCardUp(index) {
    let prevRulesState = [...this.state.rules];
    if (index !== 0) {
      this.swapArrayElements(prevRulesState, index, index - 1);
    }
    this.props.networkRuleOrderDidChange(prevRulesState);
    this.setState({ rules: prevRulesState });
  }

  /**
   * Move the card down
   * @param {number} index
   */
  handleCardDown(index) {
    let prevRulesState = [...this.state.rules];
    let maxLen = prevRulesState.length - 1;
    if (index !== maxLen) {
      this.swapArrayElements(prevRulesState, index, index + 1);
    }
    this.props.networkRuleOrderDidChange(prevRulesState);
    this.setState({ rules: prevRulesState });
  }

  /**
   * @param {Object} modalData data from the modal form passed back from instanceFormModal
   */
  handleSubmit(modalData) {
    if (this.props.vsiName) {
      // if vsi, create vsi rule
      this.props.slz[
        this.props.isTeleport ? "teleport_vsi" : "vsi"
      ].security_group.rules.create(modalData, this.props);
    } else if (this.props.isSecurityGroup) {
      // if sg, create sg rule
      this.props.slz.security_groups.rules.create(modalData, this.props);
    } else {
      this.props.slz.vpcs.network_acls.rules.create(modalData, this.props);
    }
    this.toggleModal();
  }

  render() {
    return (
      <>
        <SlzHeading
          name="Rules"
          className="marginBottomSmall"
          type="subHeading"
          buttons={
            <DynamicRender
              hide={this.props.hideCreate}
              show={
                <>
                  <SaveAddButton
                    type="add"
                    noDeleteButton
                    onClick={this.toggleModal}
                  />
                </>
              }
            />
          }
        />
        <InstanceFormModal
          name="Create a network rule"
          show={this.state.showModal}
          onRequestSubmit={this.handleSubmit}
          onRequestClose={this.toggleModal}
          primaryButtonText="Add Rule"
        >
          <NetworkingRuleForm
            parent_name={this.props.parent_name}
            slz={this.props.slz}
            vsiName={this.props.vsiName}
            isAclForm={this.props.isAclForm}
            isSecurityGroup={this.props.isSecurityGroup}
            vpc_name={this.props.vpc_name}
            isTeleport={this.props.isTeleport}
            shouldDisableSubmit={function () {
              //set modal form enable submit
              if (
                disableSave("networking_rule", this.state, this.props) === false
              ) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
          />
        </InstanceFormModal>
        <EmptyResourceTile
          name="network rules"
          showIfEmpty={this.state.rules}
        />
        {this.state.rules.map((rule, index) => (
          <div
            key={"rule-div-" + rule.name + "-wrapper"}
            className={
              this.props.isAclForm || this.props.vsiName
                ? "subForm marginBottomSmall"
                : "marginBottomSmall positionRelative formInSubForm"
            }
          >
            <NetworkingRuleForm
              index={index}
              parentRule={rule}
              parent_name={this.props.parent_name}
              show={!this.state.collapse[rule.name]}
              onToggle={() => this.toggleCollapse(rule.name)}
              disableUp={index === 0}
              handleCardUp={() => this.handleCardUp(index)}
              disableDown={index === this.state.rules.length - 1}
              handleCardDown={() => this.handleCardDown(index)}
              key={this.props.vpc_name + "-nw-rule-" + rule.name}
              id={this.props.vpc_name + "-nw-rule-form-" + rule.name}
              vpc_name={this.props.vpc_name}
              data={{
                name: rule.name,
                action: rule.action || null,
                direction: rule.direction,
                source: rule.source,
                destination: rule.destination || null,
                ruleProtocol: getRuleProtocol(rule),
                rule: getSubRule(
                  this.props.isSecurityGroup,
                  rule,
                  getRuleProtocol(rule),
                ),
              }}
              slz={this.props.slz}
              isSecurityGroup={this.props.isSecurityGroup}
              vsiName={this.props.vsiName}
              isTeleport={this.props.isTeleport}
              isAclForm={this.props.isAclForm}
            />
          </div>
        ))}
      </>
    );
  }
}

NetworkingRulesOrderCard.defaultProps = {
  rules: [],
  isSecurityGroup: false,
  isTeleport: false,
  hideCreate: false,
  isAclForm: false,
};

NetworkingRulesOrderCard.propTypes = {
  isAclForm: PropTypes.bool.isRequired,
  vpc_name: PropTypes.string, // can be undefined if vsi
  parent_name: PropTypes.string.isRequired,
  rules: PropTypes.array.isRequired,
  vsiName: PropTypes.string, // can be undefined if not vsi
  isSecurityGroup: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  hideCreate: PropTypes.bool.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        teleport_vsi: PropTypes.array.isRequired,
        vsi: PropTypes.array.isRequired,
      }).isRequired,
      networkAcls: PropTypes.shape({}).isRequired,
      securityGroups: PropTypes.shape({}).isRequired,
    }).isRequired,
    security_groups: PropTypes.shape({
      create: PropTypes.func.isRequired,
    }).isRequired,
    vpcs: PropTypes.shape({
      network_acls: PropTypes.shape({
        rules: PropTypes.shape({
          create: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    teleport_vsi: PropTypes.shape({
      security_group: PropTypes.shape({
        rules: PropTypes.shape({
          create: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    vsi: PropTypes.shape({
      security_group: PropTypes.shape({
        rules: PropTypes.shape({
          create: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default NetworkingRulesOrderCard;
