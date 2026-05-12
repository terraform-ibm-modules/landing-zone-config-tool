import React from "react";
import {
  checkNullorEmptyString,
  hasInvalidName,
  vpcFieldCheck,
} from "../../../lib/index.js";
import PropTypes from "prop-types";
import {
  SlzSelect,
  ResourceGroupSelect,
  SlzHeading,
  SlzFormGroup,
  SlzToggle,
  SlzTextInput,
} from "../../icse/index.js";
import {
  buildFormDefaultInputMethods,
  buildFormFunctions,
} from "../../component-utils.js";
import { kebabCase, parseIntFromZone } from "lazy-z";

const nameFields = [
  "default_network_acl_name",
  "default_routing_table_name",
  "default_security_group_name",
];

class VpcNetworkForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.data };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handPgwToggle = this.handPgwToggle.bind(this);
    buildFormFunctions(this);
    buildFormDefaultInputMethods(this);
  }

  /**
   * handle input change
   * @param {string} name key to change in state
   * @param {*} value value to update
   */
  handleInputChange(name, value) {
    this.setState({ [name]: value });
  }
  /**
   * Toggle on and off param in state at name
   * @param {string} name name of the object key to change
   */
  handleToggle(name) {
    let vpc = this.state;
    vpc[name] = !vpc[name];
    this.setState({ ...vpc });
  }

  /**
   * handle change of public gateway by zone
   * @param {string} zone zone-1, zone-2, or zone-3
   */
  handPgwToggle(zone) {
    let vpc = { ...this.state };
    let currentGw = { ...this.state.use_public_gateways };
    currentGw[zone] = !currentGw[zone];
    vpc.use_public_gateways = currentGw;
    this.setState({ ...vpc });
  }

  render() {
    let composedId = `${this.props.data.prefix}-vpc-form`;
    let invalidVpcName = hasInvalidName("vpcs", this.state.prefix, this.props);
    return (
      <>
        <SlzFormGroup>
          {/* vpc name */}
          <SlzTextInput
            tooltip={{
              content:
                "This name will be prepended to all components within this VPC.",
              alignModal: "bottom-left",
              align: "top-left",
            }}
            id={composedId + "-prefix"}
            componentName="VPC Network"
            field="Name"
            labelText={"Name"}
            value={this.state.prefix}
            onChange={(event) =>
              this.handleInputChange("prefix", event.target.value)
            }
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            isModal={this.props.isModal}
            {...invalidVpcName}
          />
          {/* resource group */}
          <ResourceGroupSelect
            handleInputChange={(event) =>
              this.handleInputChange("resource_group", event.target.value)
            }
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            slz={this.props.slz}
            component={this.props.data.prefix}
            value={this.state.resource_group}
          />
          <SlzSelect
            labelText="Flow logs bucket name"
            component={this.props.data.prefix}
            name="flow_logs_bucket_name"
            groups={this.props.slz.store.cosBuckets}
            value={this.state.flow_logs_bucket_name || ""}
            handleInputChange={(event) =>
              this.handleInputChange(
                "flow_logs_bucket_name",
                event.target.value,
              )
            }
            className={this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"}
            invalidText="Select a bucket"
          />
        </SlzFormGroup>
        <SlzHeading name="VPC options" type="subHeading" />
        {/* vpc classic access and use manual address prefixes */}
        <SlzFormGroup>
          <SlzToggle
            id={this.props.data.prefix + "-classic-access"}
            labelText="Classic Infrastructure Access"
            toggleFieldName="classic_access"
            defaultToggled={this.state.classic_access}
            onToggle={this.handleToggle}
            className={
              (this.props.isModal ? "fieldWidthSmaller" : "fieldWidth") +
              " leftTextAlign"
            }
          />
        </SlzFormGroup>
        <SlzFormGroup>
          {nameFields.map((field) => {
            let invalidName = vpcFieldCheck(field, this.state, this.props);
            if (checkNullorEmptyString(this.state[field])) {
              invalidName.invalid = false;
            }
            return (
              <div
                className="fitContent"
                key={this.props.data.prefix + "-" + kebabCase(field) + "-div"}
              >
                <SlzTextInput
                  id={composedId + "-" + field}
                  componentName="VPC Network"
                  field={field}
                  labelText={field}
                  value={this.state[field]}
                  onChange={(event) =>
                    this.handleInputChange(field, event.target.value)
                  }
                  className={
                    this.props.isModal ? "fieldWidthSmaller" : "fieldWidth"
                  }
                  {...invalidName}
                />
              </div>
            );
          })}
        </SlzFormGroup>
        {/* vpc public gateways */}
        <SlzHeading
          name="Public gateways"
          type="subHeading"
          tooltip={{
            content:
              "Public gateways allow for all resources in a zone to communicate with the public internet. Public gateways are not needed for subnets where a VPN gateway is created.",
          }}
        />
        <SlzFormGroup noMarginBottom>
          {/* for each zone build a toggle */}
          {["zone-1", "zone-2", "zone-3"].map((zone) => (
            <SlzToggle
              key={this.props.data.prefix + "-gateway-toggle-" + zone}
              id={this.props.data.prefix + "-pgw-" + zone}
              labelText={"Create in zone " + parseIntFromZone(zone)}
              defaultToggled={this.state.use_public_gateways[zone]}
              onToggle={() => this.handPgwToggle(zone)}
              className={
                (this.props.isModal ? "fieldWidthSmaller" : "fieldWidth") +
                " leftTextAlign"
              }
            />
          ))}
        </SlzFormGroup>
      </>
    );
  }
}

VpcNetworkForm.defaultProps = {
  data: {
    prefix: "",
    resource_group: "",
    flow_logs_bucket_name: "",
    default_network_acl_name: "",
    default_security_group_name: "",
    default_routing_table_name: "",
    classic_access: false,
    use_public_gateways: {
      "zone-1": false,
      "zone-2": false,
      "zone-3": false,
    },
  },
};

VpcNetworkForm.propTypes = {
  data: PropTypes.shape({
    prefix: PropTypes.string.isRequired,
    resource_group: PropTypes.string,
    flow_logs_bucket_name: PropTypes.string,
    default_network_acl_name: PropTypes.string,
    default_security_group_name: PropTypes.string,
    default_routing_table_name: PropTypes.string,
    classic_access: PropTypes.bool.isRequired,
    use_public_gateways: PropTypes.object.isRequired,
  }),
};

export default VpcNetworkForm;
