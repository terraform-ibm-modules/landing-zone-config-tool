import React from "react";
import PropTypes from "prop-types";
import { FilterableMultiSelect, MultiSelect } from "@carbon/react";
import { addClassName, checkNullorEmptyString } from "../../../lib/index.js";

/**
 * slz multiselect template
 */
export const SlzMultiSelect = props => {
  return (
    <FilterableMultiSelect
      id={props.id}
      className={addClassName("fieldWidth leftTextAlign cds--select", props)}
      titleText={props.titleText}
      itemToString={item => (item ? item : "")}
      invalid={props.invalid}
      invalidText={props.invalidText}
      initialSelectedItems={props.initialSelectedItems}
      onChange={props.onChange}
      items={props.items}
      useTitleInItem={props.useTitleInItem}
      label={props.label}
      disabled={props.disabled}
    />
  );
};

SlzMultiSelect.defaultProps = {
  disabled: false
};

SlzMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  titleText: PropTypes.string.isRequired,
  invalid: PropTypes.bool.isRequired,
  invalidText: PropTypes.string.isRequired,
  initialSelectedItems: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  useTitleInItem: PropTypes.bool,
  label: PropTypes.string,
  disabled: PropTypes.bool.isRequired
};

/**
 * ssh key multiselect
 */
export const SshKeyMultiSelect = props => {
  return (
    <SlzMultiSelect
      id={props.id + "-ssh-key-multiselect"}
      useTitleInItem
      label="SSH keys"
      titleText="SSH keys"
      invalidText="At least one SSH key is required"
      invalid={
        props.initialSelectedItems
          ? props.initialSelectedItems.length === 0
          : true
      }
      items={props.slz.store.sshKeys}
      initialSelectedItems={props.initialSelectedItems || []}
      onChange={event => {
        props.onChange(event.selectedItems);
      }}
      className="fieldWidthSmaller cds--form-item"
    />
  );
};

SshKeyMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  initialSelectedItems: PropTypes.array, // null needs to be passed
  onChange: PropTypes.func.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      sshKeys: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired
  }).isRequired
};

/**
 * sg multiselect
 */

export const SecurityGroupMultiSelect = props => {
  return (
    <MultiSelect
      id={props.id + "-security-group-multiselect"}
      label={props.label}
      titleText="security groups"
      className="fieldWidthSmaller cds--form-item"
      initialSelectedItems={props.initialSelectedItems}
      vpcName={props.vpcName}
      invalid={false}
      invalidText="Invalid Selection"
      onChange={event => {
        props.onChange(event.selectedItems);
      }}
      disabled={props.disabled}
      items={
        props.vpcName === ""
          ? []
          : props.slz.store.securityGroups[props.vpcName]
      }
      itemToString={item => (item ? item : "")}
    />
  );
};

SecurityGroupMultiSelect.defaultProps = {
  disabled: false,
  label: "Select"
};

SecurityGroupMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  initialSelectedItems: PropTypes.array.isRequired,
  vpcName: PropTypes.string, // not required, null value should be valid
  onChange: PropTypes.func.isRequired,
  useTitleInItem: PropTypes.bool,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      securityGroups: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};

/**
 * vpc subnet multiselect
 */

export const SubnetMultiSelect = props => {
  return (
    <SlzMultiSelect
      id={props.id + "-subnet-multiselect"}
      className={props.className}
      titleText="Subnets"
      name={props.name}
      label={props.label}
      items={
        checkNullorEmptyString(props.vpc_name)
          ? []
          : props.slz.store.subnets[props.vpc_name]
      }
      initialSelectedItems={props.initialSelectedItems}
      invalidText={
        checkNullorEmptyString(props.vpc_name)
          ? "Select a VPC."
          : "Select at least one subnet."
      }
      invalid={props.initialSelectedItems.length === 0}
      disabled={props.disabled}
      onChange={props.onChange}
    />
  );
};

SubnetMultiSelect.defaultProps = {
  name: "subnet_names",
  label: "Subnets",
  disabled: false
};

SubnetMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  vpc_name: PropTypes.string, // not required, `null` needs to be passed here
  slz: PropTypes.shape({
    store: PropTypes.shape({
      subnets: PropTypes.object.isRequired
    })
  }),
  disabled: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  initialSelectedItems: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * VPC List MultiSelect
 */

export const VpcListMultiSelect = props => {
  return (
    <SlzMultiSelect
      invalidText="At least one VPC must be selected."
      invalid={props.invalid}
      id={props.id}
      titleText={
        // only used in tgw and vpe
        props.id === "tg-vpc-multiselect" ? "Connected VPCs" : "Gateway VPCs"
      }
      onChange={props.onChange}
      initialSelectedItems={props.initialSelectedItems}
      className={props.className}
      items={props.slz.store.vpcList}
    />
  );
};

VpcListMultiSelect.propTypes = {
  invalid: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  initialSelectedItems: PropTypes.array.isRequired,
  slz: PropTypes.shape({
    store: PropTypes.shape({
      vpcList: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  })
};
