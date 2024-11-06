import { Select, SelectItem } from "@carbon/react";
import {
  azsort,
  isEmpty,
  isNullOrEmptyString,
  kebabCase,
  splat,
  buildNumberDropdownList
} from "lazy-z";
import PopoverWrapper from "./Popover.js";
import PropTypes from "prop-types";
import {
  addClassName,
  prependEmptyStringToArrayOnNullOrEmptyString
} from "../../../lib/index.js";
import { DynamicToolTipWrapper } from "../../wrappers/Tooltips.js";
import React from "react";
import { clusterFlavors } from "./caches/clusterFlavors.js"
import { clusterVersions } from "./caches/clusterVersions.js"
import { vsiImages } from "./caches/vsiImages.js"
import { vsiInstanceProfiles } from "./caches/vsiInstanceProfiles.js"

export const SlzSelect = props => {
  let invalid = // automatically set to invalid is is null or empty string and invalid not disabled
    props.disableInvalid !== true && isNullOrEmptyString(props.value)
      ? true
      : props.invalid;
  let groups =
    props.groups.length === 0
      ? [] // if no groups, empty array
      : prependEmptyStringToArrayOnNullOrEmptyString(
          // otherwise try and prepend empty string if null
          props.value,
          props.groups
        );
  // please leave debug here //
  if (props.debug) {
    console.log("PROPS: ", props);
    console.log("GROUPS: ", groups);
  }
  return (
    <DynamicToolTipWrapper
      innerForm={() => {
        return (
          <PopoverWrapper
            hoverText={props.defaultValue || props.value || ""}
            // inherit classnames from tooltip
            className={
              props.tooltip ? "cds--form-item tooltip" : "cds--form-item"
            }
          >
            <Select
              id={props.component + kebabCase(props.name)}
              name={props.name}
              labelText={props.tooltip ? null : props.labelText}
              value={props.value || undefined}
              className={addClassName("fieldWidth leftTextAlign", props)}
              disabled={props.disabled}
              invalid={invalid}
              invalidText={props.invalidText}
              readOnly={props.readOnly}
              onChange={props.handleInputChange}
              helperText={props.helperText}
            >
              {groups.map(value => (
                <SelectItem
                  key={`${props.component}-${value}`}
                  text={value}
                  value={value}
                />
              ))}
            </Select>
          </PopoverWrapper>
        );
      }}
      {...props}
    />
  );
};

SlzSelect.defaultProps = {
  value: "",
  disabled: false,
  defaultValue: undefined, // prevent null values erroring select when value is passed
  disableInvalid: false,
  invalid: false,
  invalidText: "Invalid Selection",
  readOnly: false,
  groups: [],
  debug: false
};

SlzSelect.propTypes = {
  value: PropTypes.any, // must accept null
  component: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  defaultValue: PropTypes.any,
  disableInvalid: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  invalidText: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
  groups: PropTypes.array.isRequired,
  debug: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    alignModal: PropTypes.string
  })
};

export class ClusterVersionSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      versions: []
    };
  }
  componentDidMount() {
    this._isMounted = true;
    if (isEmpty(this.state.versions)) {
      let data = [];
      clusterVersions["kubernetes"].forEach(version => {
        data.push(`${version.major}.${version.minor}.${version.patch}_kubernetes`)
      })
      clusterVersions["openshift"].forEach(version => {
        data.push(`${version.major}.${version.minor}.${version.patch}_openshift`)
      })
      if (this._isMounted) this.setState({ versions: data });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <SlzSelect
        labelText="Kube version"
        handleInputChange={this.props.handleInputChange}
        name="kube_version"
        className={this.props.className}
        component="cluster"
        groups={this.state.versions.filter(version => {
          if (
            (this.props.kube_type === "openshift" &&
              version.indexOf("openshift") !== -1) || // is openshift and contains openshift
            (this.props.kube_type !== "openshift" &&
              version.indexOf("openshift") === -1) || // is not openshift and does not contain openshift
            version === "default" // or is default
          ) {
            return version;
          }
        })}
        value={this.props.value}
      />
    );
  }
}

ClusterVersionSelect.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  className: PropTypes.string, // can be null or undefined
  value: PropTypes.string, // can be null or undefined
  kube_type: PropTypes.string.isRequired
};

export class ClusterOperatingSystemSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      operating_systems: []
    };
  }
  componentDidMount() {
    this._isMounted = true;
    if (isEmpty(this.state.operating_systems)) {
      let data = ["REDHAT_8_64", "RHCOS"];
      if (this._isMounted) this.setState({ operating_systems: data });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <SlzSelect
        labelText="Kube operating system"
        handleInputChange={this.props.handleInputChange}
        name="operating_system"
        className={this.props.className}
        component="cluster"
        groups={this.state.operating_systems}
        value={this.props.value}
      />
    );
  }
}

ClusterOperatingSystemSelect.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  className: PropTypes.string, // can be null or undefined
  value: PropTypes.string, // can be null or undefined
};

export class FlavorSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      flavors: []
    };
  }
  componentDidMount() {
    this._isMounted = true;
    if (isEmpty(this.state.flavors)) {
      let data = [];
      if (this.props.kind === "cluster") {
        clusterFlavors.forEach(flavor => {
          data.push(flavor.id)
        })
      }
      else {
        vsiInstanceProfiles["profiles"].forEach(profile => {
          data.push(profile.name)
        })
      }
      if (this._isMounted) this.setState({ flavors: data });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <SlzSelect
        labelText="Instance profile"
        handleInputChange={this.props.handleInputChange}
        name={this.props.name}
        className={this.props.className}
        component={this.props.kind}
        groups={
          this.state.flavors.length === 0 && this.props.value === ""
            ? [] // if modal set to [] to avoid two empty string params
            : this.state.flavors.length === 0
            ? [this.props.value]
            : this.state.flavors
        }
        key={this.state.flavors} // force update on return api call
        value={this.props.value}
      />
    );
  }
}

FlavorSelect.defaultProps = {
  name: "machine_type",
  kind: "cluster"
};

FlavorSelect.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  className: PropTypes.string, // can be null or undefined
  value: PropTypes.string, // can be null or undefined
  name: PropTypes.string.isRequired,
  kind: PropTypes.string.isRequired
};

export class ImageSelect extends React.Component {
  _isMounted = true;
  constructor(props) {
    super(props);
    this.state = {
      images: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    if (isEmpty(this.state.images)) {
      let imageMap = {};
      let images = [];
      vsiImages["images"].forEach((element) => {
        images.push({
          display_name:
            element.operating_system.display_name + ` (${element.name})`,
          name: element.name,
        });
      });
      images.forEach(image => {
        // create a map matching each display name to image name and vice versa
        imageMap[image.display_name] = image.name;
        imageMap[image.name] = image.display_name;
      });
      if (this._isMounted)
        this.setState({ images: images, imageMap: imageMap });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  handleInputChange(event) {
    let newEvent = {
      target: {
        name: event.target.name,
        value: this.state.imageMap[event.target.value]
      }
    };
    this.props.handleInputChange(newEvent);
  }

  render() {
    return (
      <SlzSelect
        labelText="OS image name"
        handleInputChange={this.handleInputChange}
        name="image_name"
        component="vsi"
        className={this.props.className}
        groups={
          this.state.images.length === 0 && this.props.value === ""
            ? [] // prevent duplicate empty string on modal
            : this.state.images.length === 0
            ? [this.props.value]
            : splat(this.state.images, "display_name").sort(azsort)
        }
        key={this.state.images} // force update on return api call
        value={
          this.state.images.length === 0
            ? this.props.value // show raw value until load
            : this.state.imageMap[this.props.value] // when loaded, show composed
        }
      />
    );
  }
}

ImageSelect.defaultProps = {
  className: "fieldWidthSmaller"
};

ImageSelect.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  className: PropTypes.string, // can be null or undefined
  value: PropTypes.string // can be null or undefined
};

export const SlzNumberSelect = props => {
  return (
    <SlzSelect
      component={props.component}
      groups={buildNumberDropdownList(props.max, props.min)}
      value={props.value.toString()}
      name={props.name}
      className={props.className}
      handleInputChange={event => {
        // set name target value and parse int
        let sendEvent = {
          target: {
            name: event.target.name,
            value: parseInt(event.target.value)
          }
        };
        props.handleInputChange(sendEvent);
      }}
      invalid={props.invalid}
      invalidText={props.invalidText}
      tooltip={props.tooltip}
      labelText={props.labelText}
      isModal={props.isModal}
      disabled={props.disabled}
      helperText={props.helperText}
    />
  );
};

SlzNumberSelect.defaultProps = {
  min: 1,
  invalid: false,
  isModal: false,
  disabled: false
};

SlzNumberSelect.propTypes = {
  disabled: PropTypes.bool.isRequired,
  helperText: PropTypes.string,
  component: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // can be null
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  invalidText: PropTypes.string,
  invalid: PropTypes.bool.isRequired,
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string
  }),
  labelText: PropTypes.string.isRequired,
  isModal: PropTypes.bool.isRequired
};

export const EntitlementDropdown = props => {
  return (
    <SlzSelect
      name="entitlement"
      labelText="Entitlement"
      groups={["null", "cloud_pak"]}
      value={props.value || "null"}
      handleInputChange={props.handleInputChange}
      className="fieldWidthSmaller"
      component={props.component}
    />
  );
};

EntitlementDropdown.propTypes = {
  value: PropTypes.string, // can be null
  component: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired
};

export const WorkersPerSubnetDropdown = props => {
  return (
    <SlzSelect
      name="workers_per_subnet"
      groups={buildNumberDropdownList(10, 1)}
      value={props.value.toString()}
      labelText="Workers per subnet"
      handleInputChange={props.handleInputChange}
      className={props.fieldWidthSmaller ? "fieldWidth" : "fieldWidthSmaller"}
      component={props.component}
      invalid={props.invalid}
      invalidText={props.invalidText}
    />
  );
};

WorkersPerSubnetDropdown.defaultProps = {
  invalid: false,
  invalidText: "",
  fieldWidthSmaller: false
};

WorkersPerSubnetDropdown.propTypes = {
  invalid: PropTypes.bool.isRequired,
  invalidText: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  component: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  fieldWidthSmaller: PropTypes.bool.isRequired
};

export const SubnetNameDropdown = props => {
  return (
    <SlzSelect
      name="subnet_name"
      labelText="Subnet"
      component={props.component}
      groups={
        props.vpc_name === "" ? [] : props.slz.store.subnets[props.vpc_name]
      }
      value={props.value}
      handleInputChange={props.handleInputChange}
      className={props.className}
      invalid={props.invalid}
      invalidText={props.invalidText}
    />
  );
};

SubnetNameDropdown.defaultProps = {
  vpc_name: "",
  invalid: false
};

SubnetNameDropdown.propTypes = {
  vpc_name: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  component: PropTypes.string.isRequired,
  value: PropTypes.string, // can be null
  invalid: PropTypes.bool.isRequired,
  invalidText: PropTypes.string.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      subnets: PropTypes.object.isRequired
    }).isRequired
  }).isRequired,
  className: PropTypes.string
};

export const KmsKeySelect = props => {
  return (
    <SlzSelect
      labelText="encryption key"
      invalidText="Select a valid encryption key."
      component={props.component}
      name={props.name}
      className={props.className}
      invalid={props.invalid}
      disabled={props.disabled}
      groups={props.slz.store.encryptionKeys}
      value={props.value}
      handleInputChange={props.handleInputChange}
    />
  );
};

KmsKeySelect.defaultProps = {
  name: "kms_key",
  disabled: false,
  invalid: false
};

KmsKeySelect.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      encryptionKeys: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired
  }).isRequired
};

export const ResourceGroupSelect = props => {
  return (
    <SlzSelect
      name="resource_group"
      invalidText="Select a resource group."
      component={`${kebabCase(props.component)}-rg-select`}
      labelText={props.labelText}
      disableInvalid={props.disableInvalid}
      groups={props.slz.store.resourceGroups}
      handleInputChange={props.handleInputChange}
      className={props.className}
      value={props.value}
    />
  );
};

ResourceGroupSelect.defaultProps = {
  disableInvalid: false, // used in access group dynamic policies/policies
  labelText: "Resource group"
};

ResourceGroupSelect.propTypes = {
  component: PropTypes.string.isRequired,
  disableInvalid: PropTypes.bool.isRequired,
  labelText: PropTypes.string.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      resourceGroups: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  value: PropTypes.string
};

export const VpcSelect = props => {
  return (
    <SlzSelect
      labelText="VPC"
      invalidText="Select a VPC."
      component={props.component}
      name={props.name}
      groups={props.slz.store.vpcList}
      value={props.value}
      handleInputChange={props.handleInputChange}
      className={props.className}
      disabled={props.disabled}
    />
  );
};

VpcSelect.defaultProps = {
  name: "vpc",
  disabled: false
};

VpcSelect.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.string.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      vpcList: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired
  }).isRequired,
  className: PropTypes.string,
  value: PropTypes.string,
  handleInputChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};
