import React from "react";
import { disableSave } from "../../lib/index.js";
import { InstanceFormModal, SaveAddButton, SlzHeading } from "../icse/index.js";
import { buildFormDefaultInputMethods } from "../component-utils.js";
import NetworkAclForm from "./instance-forms/NetworkAclForm.js";
import { NetworkAcls } from "./SlzArrayForms.js";

class VpcNaclForm extends React.Component {
  constructor(props) {
    super(props);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    buildFormDefaultInputMethods(this);
  }
  onModalSubmit(data) {
    this.props.slz.vpcs.network_acls.create(data, {
      vpc_name: this.props.data.prefix
    });
    this.props.handleModalToggle();
  }
  render() {
    return (
      <>
        <InstanceFormModal
          name={this.props.addText}
          show={this.props.showSubModal}
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={this.props.handleModalToggle}
        >
          <NetworkAclForm
            vpc_name={this.props.data.prefix}
            slz={this.props.slz}
            shouldDisableSubmit={function() {
              // set modal form enable submit
              if (disableSave("acl", this.state, this.props) === false) {
                this.props.enableModal();
              } else {
                this.props.disableModal();
              }
            }}
            isModal
          />
        </InstanceFormModal>
        <SlzHeading
          name="Network access control lists"
          className="marginRight marginBottomSmall"
          type="subHeading"
          buttons={
            <SaveAddButton
              onClick={() => this.props.handleModalToggle()}
              type="add"
              noDeleteButton
            />
          }
        />
        <NetworkAcls
          slz={this.props.slz}
          arrayParentName={this.props.data.prefix}
          parentToggle={{
            callback: this.props.onChildShowToggle,
            index: this.props.index,
            shownChildren: this.props.shownChildren
          }}
        />
      </>
    );
  }
}

export default VpcNaclForm;
