import React from "react";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  HeaderMenuButton,
  Modal,
  Theme
} from "@carbon/react";
import { Reset, Download, Copy, Code, CodeHide } from "@carbon/icons-react";
import { azsort, keys, prettyJSON } from "lazy-z";
import { Navigation } from "./icse/index.js";
import { validate } from "../lib/validate.js";

/**
 * format configDotJson
 * @returns {Object} slz config json
 */
export const formatConfig = (parent, isCopy, isRender) => {
  let newOverrideJson = {};
  try {
    if (!isRender) validate(parent.props.slz.store.configDotJson, true);
    // sort fields from a-z to match override.json in landing zone
    keys(parent.props.slz.store.configDotJson)
      .sort(azsort)
      .forEach(key => {
        // modules that are not exposed in catalog
        if(key !== "appid" && key !== "f5_template_data" && key !== "f5_vsi" && key !== "teleport_config" && key !== "teleport_vsi" && key !== "iam_account_settings" && key !== "secrets_manager" && key !== "access_groups") {
          newOverrideJson[key] = parent.props.slz.store.configDotJson[key];
        }
      });
    if (isCopy)
      // stringify json on copy with escaped quotation marks to allow for string parsing from tf without schematics deciding it's an object
      return JSON.stringify(newOverrideJson);
    else return prettyJSON(newOverrideJson);
  } catch (err) {
    parent.props.slz.sendError(err);
  }
};

/**
 * Download configuration object
 */
export const downloadContent = (parent, clickEvent, isCopy) => {
  // call validate on current configDotJson
  try {
    validate(parent.props.slz.store.configDotJson, true);

    // create blob and create an object URL
    const blob = new Blob([formatConfig(parent, isCopy)]);
    const fileDownloadUrl = URL.createObjectURL(blob);
    // download the file and then free the object URL
    parent.setState({ fileDownloadUrl: fileDownloadUrl }, () => {
      clickEvent.click();
      URL.revokeObjectURL(fileDownloadUrl);
      parent.setState({ fileDownloadUrl: "" });
    });
  } catch (error) {
    parent.props.slz.sendError(error);
  }
};
class SlzHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileDownloadUrl: "",
      showModal: false,
      expanded: false
    };
    this.resetState = this.resetState.bind(this);
    this.copyToClipBoard = this.copyToClipBoard.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onModalShow = this.onModalShow.bind(this);
    this.onHamburgerClick = this.onHamburgerClick.bind(this);
  }
  // Reset state and redirect to home page
  resetState() {
    window.localStorage.removeItem(this.props.storeName);
    window.location.href = "/home";
  }

  onModalClose = () => {
    this.setState({ showModal: false });
  };

  onModalShow = () => {
    this.setState({ showModal: true });
  };

  /**
   * copy to clipboard
   */
  copyToClipBoard() {
    // call validate on current configDotJson
    try {
      validate(this.props.slz.store.configDotJson, true);
      // convert object to string and copy to clipboard
      navigator.clipboard.writeText(formatConfig(this, true));
    } catch (error) {
      this.props.slz.sendError(error);
    }
  }

  onHamburgerClick() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    return (
      <Theme theme="g10">
        <Header aria-label="IBM Platform Name">
          <HeaderMenuButton
            aria-label="Open menu"
            isCollapsible
            onClick={this.onHamburgerClick}
            isActive={this.state.expanded}
          />
          <HeaderName href="/home" prefix="">
            landing zone configuration tool
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label={
                this.props.slz.store.hideJson
                  ? "Show JSON Pane"
                  : "Hide JSON Pane"
              }
              isActive
              onClick={this.props.jsonCallback}
              tooltipAlignment="end"
            >
              {this.props.slz.store.hideJson ? <Code /> : <CodeHide />}
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Copy Landing Zone JSON to Clipboard"
              isActive
              onClick={this.copyToClipBoard}
              tooltipAlignment="end"
            >
              <Copy />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Download Landing Zone JSON"
              isActive
              onClick={() => downloadContent(this, this.dofileDownload)}
              tooltipAlignment="end"
            >
              <Download />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Reset State"
              isActive
              onClick={this.onModalShow}
              tooltipAlignment="end"
            >
              <Reset />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <a
            className="hidden" // hidden button to allow download
            download="override.json"
            href={this.state.fileDownloadUrl}
            ref={e => (this.dofileDownload = e)} // set to the ID of the anchor element
          >
            download it
          </a>
          <Navigation
            expanded={this.state.expanded}
            onOverlayClick={this.onHamburgerClick}
            navigate={this.props.navigate}
          />
          {this.state.showModal ? (
            <Modal
              modalHeading="Reset state"
              open={this.state.showModal}
              onRequestSubmit={() => {
                window.localStorage.removeItem(this.props.storeName);
                window.location.hash = "#/home";
                this.props.slz.store.pattern = "";
                this.state.showModal = false;
                this.setState({show: false});
                window.location.reload();
              }}
              onRequestClose={this.onModalClose}
              primaryButtonText="Reset"
              secondaryButtonText="Cancel"
              size="xs"
              danger={true}
              className="hard-left"
            >
              <p>
                Are you sure you want to reset state data? Clicking reset will
                remove any and all changes you have made.
              </p>
            </Modal>
          ) : (
            ""
          )}
        </Header>
      </Theme>
    );
  }
}

export default SlzHeader;
