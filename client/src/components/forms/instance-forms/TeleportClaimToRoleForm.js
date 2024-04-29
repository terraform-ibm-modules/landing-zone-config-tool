import React, { Component } from "react";
import { buildFormFunctions } from "../../component-utils.js";
import { emailValidationExp } from "../../../lib/index.js";
import { SlzTextInput, SlzFormGroup } from "../../icse/index.js";
import PropTypes from "prop-types";

class TeleportClaimToRoleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
      email: this.props.data.email,
      roles: this.props.data.roles || ["teleport-admin"]
    };
    this.onChangeTextInput = this.onChangeTextInput.bind(this);
    this.handleShowToggle = this.handleShowToggle.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    buildFormFunctions(this);
  }

  /**
   * When the show prop is passed, make sure the corresponding state is passed
   * Otherwise the menus will not collapse due to the state not being set
   * But state must still be able to be set so they can open and close individually
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    if (this.props.componentDidUpdate) this.props.componentDidUpdate();
    if (prevProps.show !== this.props.show) {
      this.setState({ show: this.props.show });
    }
  }

  handleShowToggle() {
    this.setState({ show: !this.state.show });
  }

  /**
   *
   * @param {String} name specifies name of state value to change
   * @param {String} value value to set it to
   */
  onChangeTextInput(name, value) {
    if (name === "roles") {
      this.setState({ [name]: [value] });
    } else this.setState({ [name]: value });
  }

  render() {
    let composedId = `teleport-claim-form-${this.props.data.email}`;
    return (
      <div className="marginTopSmall">
        <SlzFormGroup>
          {/* edit name */}
          <SlzTextInput
            id={composedId + "-email"}
            componentName="email"
            field="email"
            labelText="Email"
            invalid={this.state.email.match(emailValidationExp) === null}
            value={this.state.email}
            onChange={event =>
              this.onChangeTextInput("email", event.target.value)
            }
            className="fieldWidth"
          />
          <SlzTextInput
            id={composedId + "roles"}
            componentName="roles"
            field="roles"
            labelText="Roles"
            value={this.state.roles[0] || ""}
            onChange={event =>
              this.onChangeTextInput("roles", event.target.value)
            }
            invalid={
              (this.state.roles.length === 0
                ? ""
                : this.state.roles[0].length) < 6
            }
            invalidText="Invalid roles value."
            className="fieldWidth"
          />
        </SlzFormGroup>
      </div>
    );
  }
}

TeleportClaimToRoleForm.defaultProps = {
  data: {
    email: "",
    roles: []
  },
  show: false
};

TeleportClaimToRoleForm.propTypes = {
  show: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    email: PropTypes.string.isRequired,
    roles: PropTypes.array.isRequired
  }).isRequired
};

export default TeleportClaimToRoleForm;
