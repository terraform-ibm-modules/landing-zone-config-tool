import React, { Component } from "react";
import { SlzTextInput } from "../../icse/index.js";
import { contains } from "lazy-z";
import { validName } from "../../../lib/index.js";
import { buildFormFunctions } from "../../component-utils.js";
import PropTypes from "prop-types";

class AppIdKeyCreateForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.data;

    buildFormFunctions(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputChange(event) {
    this.setState({ key_name: event.target.value });
  }

  render() {
    return (
      <>
        <SlzTextInput
          id={"app-id-key-name"}
          value={this.state.key_name}
          onChange={this.handleInputChange}
          field="appid_key"
          labelText="App ID Key"
          componentName="appid"
          className="fieldWidthSmaller"
          invalid={
            !validName(this.state.key_name) ||
            contains(
              this.props.slz.store.configDotJson.appid.keys,
              this.state.key_name,
            )
          }
          invalidText={
            contains(
              this.props.slz.store.configDotJson.appid.keys,
              this.state.key_name,
            )
              ? `Key name ${this.state.key_name} already in use.`
              : `Invalid Key Name. Must match the regular expression: /[A-z][a-z0-9-]*[a-z0-9]`
          }
        />
      </>
    );
  }
}

AppIdKeyCreateForm.defaultProps = {
  data: {
    key_name: "",
  },
};

AppIdKeyCreateForm.propTypes = {
  data: PropTypes.shape({
    key_name: PropTypes.string.isRequired,
  }),
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        appid: PropTypes.shape({
          keys: PropTypes.arrayOf(PropTypes.string).isRequired,
        }).isRequired,
      }).isRequired,
    }),
  }),
};

export default AppIdKeyCreateForm;
