import React from "react";
import {
  buildFormFunctions,
  buildFormDefaultInputMethods,
} from "../../../component-utils.js";
import { stateInit, conditionOperators } from "../../../../lib/index.js";
import {
  SlzNameInput,
  SlzSelect,
  SlzNumberSelect,
  SlzHeading,
  SlzFormGroup,
  SlzTextInput,
} from "../../../icse/index.js";
import { eachKey } from "lazy-z";
import PropTypes from "prop-types";

class AccessGroupDynamicPolicyForm extends React.Component {
  constructor(props) {
    super(props);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
    this.state = {
      ...stateInit("policies", this.props),
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputCondition = this.handleInputCondition.bind(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputChange(event) {
    this.setState(this.eventTargetToNameAndValue(event));
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputCondition(event) {
    let { name, value } = event.target;
    let conditions = { ...this.state.conditions };
    if (name === "operator") {
      conditions[name] = snakeCase(value.replace(/[()]/g, "")).toUpperCase(); // remove all parentheses
    } else {
      conditions[name] = value;
    }
    this.setState({ conditions });
  }

  render() {
    let conditionOperatorGroups = [];
    eachKey(conditionOperators, (key) => {
      conditionOperatorGroups.push(conditionOperators[key]);
    });
    return (
      <>
        <SlzFormGroup>
          <SlzNameInput
            id="name"
            component="dynamic_policies"
            field="name"
            labelText="Name"
            value={this.state.name}
            componentProps={this.props}
            onChange={this.handleInputChange}
          />
          <SlzNumberSelect
            tooltip={{
              content:
                "How many hours authenticated users can work before refresh",
            }}
            component="expiration"
            max={24}
            value={this.state.expiration}
            name="expiration"
            labelText="Expiration Hours"
            isModal={this.props.isModal}
            handleInputChange={this.handleInputChange}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="identity_provider"
            tooltip={{
              content: "URI for identity provider",
              alignModal: "bottom-left",
            }}
            componentName="identity_provider"
            field="identity_provider"
            isModal={this.props.isModal}
            labelText="Identity Provider"
            value={this.state.identity_provider}
            invalid={"sixOrMore"}
            componentProps={this.props}
            onChange={this.handleInputChange}
            className="textInputWide"
          />
        </SlzFormGroup>
        <SlzFormGroup className="marginBottomSmall">
          <SlzHeading name="Condition Configuration" type="subHeading" />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="claim"
            tooltip={{
              content: "Key value to evaluate the condition against",
              alignModal: "bottom-left",
            }}
            componentName="claim"
            field="claim"
            isModal={this.props.isModal}
            labelText="Condition Claim"
            value={this.state.conditions.claim}
            componentProps={this.props}
            invalid={false}
            onChange={this.handleInputCondition}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzSelect
            component="operator"
            tooltip={{
              content: "The operation to perform on the claim.",
            }}
            value={conditionOperators[this.state.conditions.operator]}
            groups={conditionOperatorGroups}
            field="operator"
            isModal={this.props.isModal}
            name="operator"
            disableInvalid
            labelText="Conditon Operator"
            handleInputChange={this.handleInputCondition}
          />
        </SlzFormGroup>
        <SlzFormGroup>
          <SlzTextInput
            id="value"
            tooltip={{ content: "Value to be compared against" }}
            componentName="value"
            field="value"
            isModal={this.props.isModal}
            value={this.state.conditions.value}
            componentProps={this.props}
            labelText="Condition Value"
            invalid={false}
            onChange={this.handleInputCondition}
          />
        </SlzFormGroup>
      </>
    );
  }
}

AccessGroupDynamicPolicyForm.defaultProps = {
  data: {
    name: "",
    identity_provider: "",
    expiration: 1,
    conditions: {
      claim: "",
      operator: "",
      value: "",
    },
  },
  isModal: false,
};

AccessGroupDynamicPolicyForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    identity_provider: PropTypes.string.isRequired,
    expiration: PropTypes.number.isRequired,
    conditions: PropTypes.shape({
      claim: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isModal: PropTypes.bool.isRequired,
};

export default AccessGroupDynamicPolicyForm;
