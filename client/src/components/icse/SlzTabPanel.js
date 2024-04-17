import React from "react";
import { Tab, TabList, TabPanels, Tabs, TabPanel } from "@carbon/react";
import UnderConstruction from "../forms/UnderConstruction.js";
import { contains } from "lazy-z";
import { DynamicRender, SlzHeading } from "./wrappers/Utils.js";
import { SaveAddButton } from "./wrappers/Buttons.js";
import { isFunction } from "lazy-z";
import PropTypes from "prop-types";

/**
 * slz tab panel wrapper for non array forms
 * @param {*} props props
 * @param {*} props.form form to put in the create tab
 * @param {*} props.about docs to put in the about tab
 */
class SlzTabPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
  }

  setSelectedIndex(event) {
    // if the index is being set to a new tab
    if (
      this.props.toggleShowChildren &&
      event.selectedIndex !== this.state.tabIndex
    )
      this.props.toggleShowChildren();
    this.setState({ tabIndex: event.selectedIndex });
  }

  render() {
    let hasNoAbout = contains(
      [
        "Policies",
        "Dynamic Policies",
        "Encryption Keys",
        "Service Credentials",
        "Buckets",
        "Worker Pools",
        "Teleport VSI",
        "Claims to Roles",
        "Network Access Control Lists", // prevent rendering on nacl inner form
        undefined // prevent rendering on subnet tier inner form
        // neither of those forms is a top level component but
        // each behaves like one.
      ],
      this.props.name
    );

    let hasBuiltInHeading = contains(
      ["Network Access Control Lists"], // prevent double rendering of heading for nacl
      this.props.name
    );

    return (
      <>
        {this.props.name && !hasBuiltInHeading && (
          <SlzHeading
            name={this.props.name}
            type={this.props.subHeading ? "subHeading" : "heading"}
            className={this.props.className}
            tooltip={this.props.tooltip}
            buttons={
              <DynamicRender
                hide={
                  this.props.hideFormTitleButton ||
                  this.state.tabIndex !== 0 ||
                  !isFunction(this.props.onClick) ||
                  this.props.name === "Network Access Control Lists"
                }
                show={
                  <SaveAddButton
                    type="add"
                    noDeleteButton
                    onClick={this.props.onClick}
                    disabled={
                      this.props.shouldDisableSave
                        ? this.props.shouldDisableSave()
                        : false
                    }
                  />
                }
              />
            }
          />
        )}
        {hasNoAbout && !this.props.about ? (
          this.props.form
        ) : (
          <Tabs onChange={this.setSelectedIndex}>
            <TabList aria-label="formTabs">
              <Tab>Create</Tab>
              <Tab>About</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="doc">{this.props.form}</TabPanel>
              <TabPanel className="doc">
                {this.props.about ? this.props.about : <UnderConstruction />}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </>
    );
  }
}

SlzTabPanel.defaultProps = {
  subHeading: false,
  hideFormTitleButton: false
};

SlzTabPanel.propTypes = {
  name: PropTypes.string, // can be null
  subHeading: PropTypes.bool.isRequired,
  className: PropTypes.string, // can be null
  tooltip: PropTypes.object, // only if using tooltip
  hideFormTitleButton: PropTypes.bool.isRequired,
  onClick: PropTypes.func, // can be null
  shouldDisableSave: PropTypes.func, // can be null
  about: PropTypes.node, // can be null
  form: PropTypes.node.isRequired
};

export default SlzTabPanel;
