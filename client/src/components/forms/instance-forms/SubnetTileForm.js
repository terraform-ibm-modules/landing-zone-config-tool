import React from "react";
import { getObjectFromArray, eachKey } from "lazy-z";
import { getTierSubnetsFromVpcData } from "../../../lib/index.js";
import SubnetTile from "./SubnetTile.js";
import { SlzHeading, SlzSubForm } from "../../icse/index.js";
import PropTypes from "prop-types";

class SubnetTileForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subnetData: {},
    };
    if (!this.props.isModal) {
      let vpcNetwork = getObjectFromArray(
        this.props.slz.store.configDotJson.vpcs,
        "prefix",
        this.props.vpc_name,
      );
      let subnetMap = this.props.isModal
        ? this.props.subnets
        : getTierSubnetsFromVpcData(vpcNetwork, this.props.tier);
      subnetMap.forEach((subnet) => {
        this.state.subnetData[subnet.name] = true;
      });
    }
    this.childSubnetHasChanged = this.childSubnetHasChanged.bind(this);
    this.allSubnetsMatch = this.allSubnetsMatch.bind(this);
  }

  childSubnetHasChanged(name, propsMatchState) {
    if (this.state.subnetData[name] !== propsMatchState) {
      let subnetData = { ...this.state.subnetData };
      subnetData[name] = propsMatchState;
      this.setState({ subnetData: subnetData });
    }
  }

  allSubnetsMatch() {
    let propsMatchState = true;
    eachKey(this.state.subnetData, (subnetName) => {
      if (this.state.subnetData[subnetName] === false) {
        propsMatchState = false;
      }
    });
    return propsMatchState;
  }

  render() {
    let subnetMap = [...this.props.subnets];
    return (
      <SlzSubForm
        id={`subnet-tile-${this.props.tier}-${this.props.vpc_name}`}
        formInSubForm
        className="popoverLeft subnetTileFormMargin"
      >
        <SlzHeading
          name="Subnets"
          type="subHeading"
          className="marginBottomSmall"
        />
        <div className="displayFlex">
          {subnetMap.map((subnet) => (
            <SubnetTile // change so doesn't show buttons
              key={`${subnet.name}-tile-${this.props.tier}-${
                this.props.vpc_name
              }-${JSON.stringify(subnet)}`}
              prefix={this.props.vpc_name}
              subnet={subnet}
              store={this.props.slz.store}
              onSave={this.props.onSave}
              isModal={this.props.isModal}
              slz={this.props.slz}
              childSubnetHasChanged={this.childSubnetHasChanged}
            />
          ))}
        </div>
      </SlzSubForm>
    );
  }
}

export default SubnetTileForm;

SubnetTileForm.defaultProps = {
  isModal: false,
};

SubnetTileForm.propTypes = {
  isModal: PropTypes.bool.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      configDotJson: PropTypes.shape({
        vpcs: PropTypes.array.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  vpc_name: PropTypes.string.isRequired,
  tier: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};
