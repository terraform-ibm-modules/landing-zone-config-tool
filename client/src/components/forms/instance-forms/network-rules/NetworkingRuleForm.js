import React, { Component } from "react";
import { TextInput } from "@carbon/react";
import { capitalize, titleCase, kebabCase } from "lazy-z";
import { buildFormFunctions } from "../../../component-utils.js";
import {
  DynamicRender,
  StatelessToggleForm,
  SlzFormGroup,
  DeleteModal,
  DeleteButton,
  SaveAddButton,
  UpDownButtons,
  SlzSelect,
  SlzNameInput,
  SlzTextInput
} from "../../../icse/index.js";
import {
  stateInit,
  propsMatchState,
  hasInvalidCidrOrAddress,
  hasInvalidRuleProtocol,
  disableSave
} from "../../../../lib/index.js";
import PropTypes from "prop-types";

/** NetworkingRuleForm
 * @param {Object} props
 * @param {configDotJson} props.configDotJson config dot json
 * @param {slz} props.slz slz state store
 */
class NetworkingRuleForm extends Component {
  constructor(props) {
    super(props);
    this.state = stateInit("networking_rule", this.props);

    this.handleInput = this.handleInput.bind(this);
    this.handleRuleUpdate = this.handleRuleUpdate.bind(this);
    this.handleRuleDelete = this.handleRuleDelete.bind(this);
    this.handleRuleDataUpdate = this.handleRuleDataUpdate.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.shouldDisableSave = this.shouldDisableSave.bind(this);
    buildFormFunctions(this);
  }

  /**
   * Handle input change for a text field
   * @param {String} inputName name of the field to set state
   * @param {event} event
   * @param {boolean=} lowercase set value to lowercase
   */
  handleInput(inputName, event, lowercase) {
    let newValue = lowercase
      ? event.target.value.toLowerCase()
      : event.target.value;
    this.setState({ [inputName]: newValue });
  }

  /**
   * Handler function for the rule updates
   * @param {String} inputName name of the field to set state in Rule
   * @param event event
   */
  handleRuleDataUpdate(inputName, event) {
    let value = parseInt(event.target.value) || null;
    this.setState(prevState => ({
      rule: {
        // object that we want to update
        ...prevState.rule, // keep all other key-value pairs
        [inputName]: value // update the value of specific key
      }
    }));
  }

  /**
   * update a network rule
   */
  handleRuleUpdate() {
    if (this.props.vsiName) {
      // if is standalone security group
      this.props.slz.vsi.security_group.rules.save(this.state, this.props);
    } else if (this.props.isSecurityGroup) {
      this.props.slz.security_groups.rules.save(this.state, this.props);
    } else {
      this.props.slz.vpcs.network_acls.rules.save(this.state, this.props);
    }
  }

  /**
   * delete a network rule
   */
  handleRuleDelete() {
    if (this.props.vsiName) {
      // for vsi security group
      this.props.slz.vsi.security_group.rules.delete(this.state, this.props);
    } else if (this.props.isSecurityGroup) {
      // for security group
      this.props.slz.security_groups.rules.delete(this.state, this.props);
    } else {
      this.props.slz.vpcs.network_acls.rules.delete(this.state, this.props);
    }
  }

  /**
   * toggle delete modal
   */
  toggleDeleteModal() {
    this.setState({ showDeleteModal: !this.state.showDeleteModal });
  }

  /**
   * Returns true if save should be disabled or if props match state (save disabled)
   * @returns {boolean} if save is disabled
   */
  shouldDisableSave() {
    return (
      disableSave("networking_rule", this.state, this.props) ||
      propsMatchState("networking_rule", this.state, this.props)
    );
  }

  render() {
    let ruleName = this.props.parentRule?.name || "new-rule";
    return (
      <>
        <div
          key={"rule-div-" + ruleName}
          className={
            "alignItemsCenter spaceBetween " +
            (!this.props.show ? "" : "marginBottomSmall") // add margin bottom small if shown
          }
        >
          {this.props.isModal !== true && (
            <DeleteModal
              name={ruleName}
              modalOpen={this.state.showDeleteModal}
              onModalClose={this.toggleDeleteModal}
              onModalSubmit={this.handleRuleDelete}
            />
          )}
          <DynamicRender
            hide={this.props.show === false && this.props.isModal === true}
            show={
              <StatelessToggleForm
                key={"rule-name-" + ruleName}
                name={this.props.isModal ? "" : ruleName} // do not show name when modal
                onIconClick={this.props.onToggle}
                toggleFormTitle
                hide={this.props.show === false && this.props.isModal !== true}
                hideIcon={this.props.isModal}
                alwaysShowButtons
                buttons={
                  this.props.isModal ? (
                    ""
                  ) : this.props.show === true ? (
                    <>
                      <SaveAddButton
                        onClick={this.handleRuleUpdate}
                        disabled={this.shouldDisableSave()}
                      />
                      <DeleteButton
                        onClick={this.toggleDeleteModal}
                        name={ruleName}
                      />
                    </>
                  ) : (
                    <UpDownButtons
                      name={ruleName}
                      handleCardUp={this.props.handleCardUp}
                      handleCardDown={this.props.handleCardDown}
                      disableUp={this.props.disableUp}
                      disableDown={this.props.disableDown}
                    />
                  )
                }
              >
                <>
                  <SlzFormGroup>
                    {/* name */}
                    <SlzNameInput
                      id={this.state.name + "-name"}
                      component="networking_rule"
                      componentProps={this.props}
                      parentName={this.props.parent_name}
                      value={this.state.name}
                      onChange={event => this.handleInput("name", event)}
                      className="fieldWidthSmaller"
                      // network acl name is decorative, used in slz to create a map of rules
                      hideHelperText={this.props.isSecurityGroup !== true}
                    />
                    {/* show action if not security group */}
                    {!this.props.isSecurityGroup && (
                      <NetworkingRuleSelect
                        state={this.state}
                        name="action"
                        onChange={this.handleInput}
                        groups={["Allow", "Deny"]}
                        props={this.props}
                      />
                    )}
                    <NetworkingRuleSelect
                      name="direction"
                      state={this.state}
                      onChange={this.handleInput}
                      groups={["Inbound", "Outbound"]}
                      props={this.props}
                    />
                    {/* show source if security group */}
                    {this.props.isSecurityGroup && (
                      <NetworkingRuleTextField
                        name="source"
                        state={this.state}
                        onChange={this.handleInput}
                      />
                    )}
                  </SlzFormGroup>
                  {/* Source, Dest, Protocol */}
                  <SlzFormGroup>
                    {/* render source and destination here if ACL rule */}
                    {!this.props.isSecurityGroup && (
                      <>
                        <NetworkingRuleTextField
                          name="source"
                          state={this.state}
                          onChange={this.handleInput}
                        />
                        <NetworkingRuleTextField
                          name="destination"
                          state={this.state}
                          onChange={this.handleInput}
                        />
                      </>
                    )}
                    {/* rule protocol */}
                    <SlzSelect
                      component={ruleName + "-protocol"}
                      groups={["ALL", "TCP", "UDP", "ICMP"]}
                      value={this.state.ruleProtocol.toUpperCase()}
                      labelText="Protocol"
                      name="ruleProtocol"
                      handleInputChange={event =>
                        this.handleInput("ruleProtocol", event, true)
                      }
                      className="fieldWidthSmaller"
                    />
                  </SlzFormGroup>
                  {/* Rendering for TCP or UDP */}
                  {(this.state.ruleProtocol === "tcp" ||
                    this.state.ruleProtocol === "udp") && (
                    <div>
                      <SlzFormGroup>
                        <NetworkingRuleProtocolTextField
                          name="port_min"
                          state={this.state}
                          onChange={this.handleRuleDataUpdate}
                        />
                        <NetworkingRuleProtocolTextField
                          name="port_max"
                          state={this.state}
                          onChange={this.handleRuleDataUpdate}
                        />
                      </SlzFormGroup>
                      {/* render source port min and source port max if acl */}
                      {!this.props.isSecurityGroup && (
                        <SlzFormGroup>
                          <NetworkingRuleProtocolTextField
                            name="source_port_min"
                            state={this.state}
                            onChange={this.handleRuleDataUpdate}
                          />
                          <NetworkingRuleProtocolTextField
                            name="source_port_max"
                            state={this.state}
                            onChange={this.handleRuleDataUpdate}
                          />
                        </SlzFormGroup>
                      )}
                    </div>
                  )}
                  {/* Rendering for ICMP */}
                  {this.state.ruleProtocol === "icmp" && (
                    <SlzFormGroup>
                      <NetworkingRuleProtocolTextField
                        name="type"
                        state={this.state}
                        onChange={this.handleRuleDataUpdate}
                      />
                      <NetworkingRuleProtocolTextField
                        name="code"
                        state={this.state}
                        onChange={this.handleRuleDataUpdate}
                      />
                    </SlzFormGroup>
                  )}
                </>
              </StatelessToggleForm>
            }
          />
        </div>
      </>
    );
  }
}

NetworkingRuleForm.defaultProps = {
  parentRule: {
    name: ""
  },
  isAclForm: false,
  isSecurityGroup: false,
  isModal: false,
  isTeleport: false,
  data: {
    name: "",
    action: "allow",
    direction: "inbound",
    source: "",
    destination: "",
    ruleProtocol: "all",
    rule: {
      port_max: null,
      port_min: null,
      source_port_max: null,
      source_port_min: null,
      type: null,
      code: null
    }
  }
};

NetworkingRuleForm.propTypes = {
  data: PropTypes.shape({
    action: PropTypes.string, // not required for sg
    destination: PropTypes.string, // not required for sg
    direction: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    rule: PropTypes.object,
    source: PropTypes.string.isRequired
  }),
  parentRule: PropTypes.shape({
    action: PropTypes.string, // not required for sg
    destination: PropTypes.string, // not required for sg
    direction: PropTypes.string, // not required for sg
    name: PropTypes.string.isRequired,
    source: PropTypes.string, // not required
    tcp: PropTypes.shape({
      port_max: PropTypes.number, // can be null
      port_min: PropTypes.number // can be null
    }),
    udp: PropTypes.shape({
      port_max: PropTypes.number, // can be null
      port_min: PropTypes.number // can be null
    }),
    icmp: PropTypes.shape({
      code: PropTypes.number, // can be null
      type: PropTypes.number // can be null
    })
  }),
  disableDown: PropTypes.bool, // can be undefined for NetworkRuleCreate
  disableUp: PropTypes.bool, // can be undefined for NetworkRuleCreate
  handleCardDown: PropTypes.func, // can be undefined for NetworkRuleCreate
  handleCardUp: PropTypes.func, // can be undefined for NetworkRuleCreate
  isSecurityGroup: PropTypes.bool,
  vpc_name: PropTypes.string,
  isAclForm: PropTypes.bool.isRequired,
  isSecurityGroup: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  isModal: PropTypes.bool.isRequired
};

/**
 * readability shortcut for nw rules
 * @param {*} props
 * @param {string} props.name field to update
 * @param {Object} props.state parent state
 * @param {Function} props.onChange onchange function
 */
const NetworkingRuleTextField = props => {
  let invalidData = hasInvalidCidrOrAddress(props.state[props.name]);
  return (
    <SlzTextInput
      componentName="Networking rule"
      field={props.name}
      labelText={props.name}
      value={String(props.state[props.name])}
      onChange={e => props.onChange(props.name, e)}
      className="fieldWidthSmaller"
      placeholder="x.x.x.x"
      {...invalidData}
    />
  );
};

NetworkingRuleTextField.propTypes = {
  name: PropTypes.string.isRequired,
  state: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * rule protocol text field
 * @param {*} props
 * @param {string} props.name field to update
 * @param {Object} props.state parent state
 * @param {Function} props.onChange onchange function
 */
const NetworkingRuleProtocolTextField = props => {
  let invalidRuleProtocol = hasInvalidRuleProtocol(
    props.name,
    props.state.rule[props.name]
  );
  return (
    <TextInput
      id={`${props.state.name}-nw-${kebabCase(props.name)}-input`}
      labelText={titleCase(props.name)}
      placeholder={String(props.state.rule[props.name] || "")}
      value={props.state.rule[props.name] || ""}
      onChange={e => props.onChange(props.name, e)}
      {...invalidRuleProtocol}
      className="fieldWidthSmaller"
    />
  );
};

NetworkingRuleProtocolTextField.propTypes = {
  name: PropTypes.string.isRequired,
  state: PropTypes.shape({
    rule: PropTypes.shape({}).isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * readability shortcut for nw rules
 * @param {*} props
 * @param {string} props.name field to update
 * @param {Object} props.state parent state
 * @param {Function} props.onChange onchange function
 * @param {Array<string>} props.groups list of groups for select
 */
const NetworkingRuleSelect = props => {
  return (
    <SlzSelect
      component={props.state.name + "-nw-rule-" + props.name}
      name={props.name}
      groups={props.groups}
      value={capitalize(props.state[props.name])}
      labelText={capitalize(props.name)}
      handleInputChange={e => props.onChange(props.name, e, true)}
      className="fieldWidthSmaller"
    />
  );
};

NetworkingRuleSelect.propTypes = {
  name: PropTypes.string.isRequired,
  state: PropTypes.shape({
    rule: PropTypes.shape({}).isRequired,
    name: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired
};

export default NetworkingRuleForm;
