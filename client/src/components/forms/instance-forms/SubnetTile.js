import React from "react";
import { Tile, TextInput } from "@carbon/react";
import {
  propsMatchState,
  subnetGatewayToggleShouldBeDisabled
} from "../../../lib/index.js";
import {
  DynamicRender,
  SlzHeading,
  SlzFormGroup,
  SlzSelect,
  SaveAddButton,
  SlzToggle
} from "../../icse/index.js";
import PropTypes from "prop-types";

/**
 * create a tile for each subnet
 * @param {Object} props
 * @returns {SubnetTile} react component
 */
class SubnetTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props.subnet };
    this.handleSave = this.handleSave.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleChange(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  componentDidUpdate() {
    this.props.childSubnetHasChanged(
      this.state.name,
      propsMatchState("subnet", this.state, this.props)
    );
  }

  handleSave() {
    this.props.onSave(this.state, this.props);
  }

  handleToggle() {
    this.setState({ public_gateway: !this.state.public_gateway });
  }

  render() {
    return (
      <Tile
        key={this.props.prefix + "-subnets-" + this.props.subnet.name}
        className="marginRight fieldWidth"
      >
        <SlzHeading
          name={this.props.subnet.name}
          type="subHeading"
          className="marginBottomSmall"
          buttons={
            <DynamicRender
              hide={this.props.isModal}
              show={
                <SaveAddButton
                  disabled={propsMatchState("subnet", this.state, this.props)}
                  onClick={this.handleSave}
                  noDeleteButton
                />
              }
            />
          }
        />
        <SlzFormGroup className="marginBottomSmall">
          <TextInput
            id={this.props.subnet.name + "-cidr"}
            invalidText="Invalid error message."
            labelText="Subnet CIDR"
            defaultValue={this.props.subnet.cidr}
            className="fieldWidthSmaller"
          />
        </SlzFormGroup>
        <SlzFormGroup className="marginBottomSmall">
          <SlzSelect
            vpcName={this.props.prefix}
            store={this.props.store}
            field="acl_name"
            name="acl_name"
            labelText="Network ACL"
            component={this.props.subnet.name}
            groups={this.props.slz.store.networkAcls[this.props.prefix]}
            value={this.state.acl_name}
            handleInputChange={this.handleChange}
            className="fieldWidthSmaller"
            disabled={this.props.isModal}
          />
        </SlzFormGroup>
        <SlzFormGroup noMarginBottom>
          <SlzToggle
            tooltip={{
              content:
                "A Public Gateway must be enabled in this zone to use. To enable public gateways, see the VPC page."
            }}
            id={"new-subnet-public-gateway-" + this.props.subnet.name}
            labelText="Use Public Gateway"
            defaultToggled={this.state.public_gateway}
            onToggle={this.handleToggle}
            disabled={
              this.props.isModal ||
              subnetGatewayToggleShouldBeDisabled(this.props)
            }
          />
        </SlzFormGroup>
      </Tile>
    );
  }
}

SubnetTile.defaultProps = {
  isModal: false
};

SubnetTile.propTypes = {
  isModal: PropTypes.bool.isRequired,
  childSubnetHasChanged: PropTypes.func,
  onSave: PropTypes.func,
  prefix: PropTypes.string.isRequired,
  subnet: PropTypes.shape({
    name: PropTypes.string.isRequired,
    cidr: PropTypes.string.isRequired,
    public_gateway: PropTypes.bool,
    acl_name: PropTypes.string.isRequired
  }).isRequired,
  store: PropTypes.object.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      networkAcls: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};

export default SubnetTile;
