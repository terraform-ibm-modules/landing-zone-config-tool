import React, { Component } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { javascript } from "@codemirror/lang-javascript";
import { tags as t } from "@lezer/highlight";
import {
  Home,
  About,
  SlzHeader,
  AccessGroups,
  Vpe,
  Vsi,
  SshKeys,
  SecurityGroups,
  ResourceGroups,
  ObjectStorage,
  Vpc,
  VpcAcl,
  Clusters,
  Vpn,
  KeyManagement,
  TransitGateway,
  Atracker,
  AppId,
  Teleport,
  IamAccountSettings,
  SecretsManager,
  F5BigIp,
  ResetState,
  SubnetForm,
  Footer,
  Summary,
  ReleaseNotes
} from "./components/index.js";
import { slzState, codeMirrorJson } from "./lib/index.js";
import "./app.scss";
import { Notification } from "./components/icse/index.js";
import { contains } from "lazy-z";
import { Modal, Button } from "@carbon/react";

const slzStateStore = new slzState();

const pathToNameMap = {
  "/home": "Home",
  "/resourceGroups": "Resource groups",
  "/keyManagement": "Key management",
  "/objectStorage": "Object Storage",
  "/vpcs": "Virtual private clouds",
  "/nacls": "VPC access control",
  "/subnets": "VPC subnets",
  "/transitGateway": "Transit gateway",
  "/securityGroups": "Security groups",
  "/vpe": "Virtual private endpoints",
  "/activityTracker": "Activity Tracker",
  "/sshKeys": "SSH keys",
  "/vsi": "Virtual server instance deployments",
  "/clusters": "Clusters",
  "/vpn": "VPN gateways",
  "/appID": "App ID",
  "/teleport": "Teleport Bastion Host",
  "/f5BigIP": "F5 Big IP",
  "/summary": "Summary"
};

const pageOrder = [
  "/home",
  "/resourceGroups",
  "/keyManagement",
  "/objectStorage",
  "/vpcs",
  "/nacls",
  "/subnets",
  "/transitGateway",
  "/securityGroups",
  "/vpe",
  "/activityTracker",
  "/sshKeys",
  "/vsi",
  "/clusters",
  "/vpn",
  "/summary"
];

const carbonDesignCodemirrorTheme = createTheme({
  theme: "light",
  settings: {
    background: "#F4F4F4",
    foreground: "#161616",
    caret: "#161616",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#F4F4F4",
    gutterForeground: "#161616"
  },
  styles: [
    { tag: t.comment, color: "#161616" },
    { tag: t.variableName, color: "#161616" },
    { tag: [t.string, t.special(t.brace)], color: "#161616" },
    { tag: t.number, color: "#161616" },
    { tag: t.bool, color: "#161616" },
    { tag: t.null, color: "#161616" },
    { tag: t.keyword, color: "#161616" },
    { tag: t.operator, color: "#161616" },
    { tag: t.className, color: "#161616" },
    { tag: t.definition(t.typeName), color: "#161616" },
    { tag: t.typeName, color: "#161616" },
    { tag: t.angleBracket, color: "#161616" },
    { tag: t.tagName, color: "#161616" },
    { tag: t.attributeName, color: "#161616" }
  ]
});
class App extends Component {
  constructor(props) {
    super(props);
    if (window.location.hash !== "#/resetState")
      try {
        let storeName =
          process.env.NODE_ENV === "development" ? "devSlzStore" : "slzStore";
        let stateInStorage = window.localStorage.getItem(storeName);
        // If there is a state in browser local storage, use it instead.
        if (stateInStorage) {
          slzStateStore.store = JSON.parse(stateInStorage);
        }
        this.state = {
          store: slzStateStore.store,
          storeName: storeName,
          notifications: []
        };
      } catch (err) {
        window.location.hash = "#/resetState";
      }
    this.updateComponents = this.updateComponents.bind(this);
    this.handleStateErrors = this.handleStateErrors.bind(this);
    this.navigate = this.navigate.bind(this);
    this.navigateNavItem = this.navigateNavItem.bind(this);
    this.toggleStateStoreValue = this.toggleStateStoreValue.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.setItem = this.setItem.bind(this);
  }

  /**
   * toggle true/false state store value
   * @param {string} name value in store
   */
  toggleStateStoreValue(name) {
    slzStateStore.store[name] = !slzStateStore.store[name];
    this.setItem(this.state.storeName, slzStateStore.store);
    this.setState({ store: slzStateStore.store });
  }

  handleStateErrors(err) {
    let notification = {
      key: err.message,
      kind: "error",
      text: err.message
    };
    this.setState(prevState => ({
      notifications: [...prevState.notifications, notification]
    }));
  }

  // update components
  updateComponents() {
    // Save state to local storage
    this.setItem(this.state.storeName, slzStateStore.store);
    // Show a notification when state is updated successfully
    let notification = {
      title: "Success",
      text: "Successfully updated!",
      timeout: 3000
    };
    this.setState(prevState => ({
      store: slzStateStore.store,
      notifications: [...prevState.notifications, notification]
    }));
  }

  // when react component mounts, set update callback for slz state store
  // to update components
  componentDidMount() {
    if (window.location.hash !== "#/resetState") {
      slzStateStore.setErrorCallback(this.handleStateErrors);
      slzStateStore.setUpdateCallback(() => {
        this.updateComponents();
      });
    }
  }

  /** @method
   *  navigate pageOrder map
   */

  navigate(isBackward) {
    let currentWindow = window.location.hash.split("#")[1];
    let nextPathIndex = isBackward
      ? pageOrder.indexOf(currentWindow) - 1
      : pageOrder.indexOf(currentWindow) + 1;
    if (nextPathIndex >= 0 && nextPathIndex < pageOrder.length) {
      window.location.hash = "#" + pageOrder[nextPathIndex];
      // trick the component into refreshing itself
      this.setState({refresh_component: false});
      this.setState({refresh_component: true});
    }
  }

  /** @method
   *  navigate pageOrder map
   */

  navigateNavItem(currentWindow) {
    let nextPathIndex = pageOrder.indexOf(currentWindow);
    if (nextPathIndex >= 0 && nextPathIndex < pageOrder.length) {
      window.location.hash = "#" + pageOrder[nextPathIndex];
      // trick the component into refreshing itself
      this.setState({refresh_component: false});
      this.setState({refresh_component: true});
    }
  }

  /** @method
   * if pathToNameMap is at the very beginning or very end
   * do not render a back or next option
   */
  getTitle(isPrevious) {
    let currentWindow = window.location.hash.split("#")[1];
    let nextPathIndex =
      pageOrder.indexOf(currentWindow) + (isPrevious ? -1 : 1);
    if (nextPathIndex === pageOrder.length || nextPathIndex === -1) {
      return "";
    } else {
      return pathToNameMap[pageOrder[nextPathIndex]];
    }
  }

  /**
   * calls window.localStore.setItem
   * @param {*} storeName
   * @param {*} store
   */
  setItem(storeName, store) {
    window.localStorage.setItem(storeName, JSON.stringify(store));
  }

  render() {
    return (
      <div className="App">
        <Modal
          id="no-pattern-selected-modal"
          modalHeading="No Pattern Selected"
          className="leftTextAlign unselectedPatternModal"
          alert={true}
          danger={true}
          open={
            window.location.hash === "#/home" ||
            window.location.hash === "#/resetState"
              ? false
              : !slzStateStore.store.pattern
          }
          passiveModal
        >
          <div>
            Uh oh! It looks like you haven't selected a pattern yet. Select a
            pattern from the home page to begin customization.
          </div>
          <div>
            <Button
              kind="primary"
              className="marginTopSmall unselectedPatternModal"
              onClick={() => {
                window.location.hash = "#/home";
                this.setState({show: false});
              }}
            >
              Return to home page
            </Button>
          </div>
        </Modal>
        <SlzHeader
          slz={slzStateStore}
          storeName={this.state.storeName}
          navigate= {this.navigateNavItem}
          jsonCallback={() => this.toggleStateStoreValue("hideJson")}
        />
        <div
          className={
            "navBarAlign parentFloat minHeight whiteBackground fieldPadding displayFlex "
          }
        >
          <div
            className={
              slzStateStore.store.hideJson === true ||
              contains(
                ["/home", "/summary", "/about", "/resetState", "/releaseNotes"],
                window.location.hash.split("#")[1]
              )
                ? "widthOneHundredPercent"
                : "leftPanelWidth"
            }
          >
            <Routes>
              <Route path="/" element={ <Navigate to ="/home" />} />
              <Route path="/home" element={<Home slz={slzStateStore} />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/activityTracker"
                element={<Atracker slz={slzStateStore} />}
              />
              <Route
                path="/keyManagement"
                element={<KeyManagement slz={slzStateStore} />}
              />
              <Route path="/vpe" element={<Vpe slz={slzStateStore} />} />
              <Route
                path="/objectStorage"
                element={<ObjectStorage slz={slzStateStore} />}
              />
              <Route path="/vpcs" element={<Vpc slz={slzStateStore} />} />
              <Route path="/nacls" element={<VpcAcl slz={slzStateStore} />} />
              <Route
                path="/transitGateway"
                element={<TransitGateway slz={slzStateStore} />}
              />
              <Route path="/vpn" element={<Vpn slz={slzStateStore} />} />
              <Route path="/appID" element={<AppId slz={slzStateStore} />} />
              <Route
                path="/secretsManager"
                element={<SecretsManager slz={slzStateStore} />}
              />
              <Route
                path="/teleport"
                element={<Teleport slz={slzStateStore} />}
              />
              {/* edit */}
              <Route
                path="/securityGroups"
                element={<SecurityGroups slz={slzStateStore} />}
              />
              <Route
                path="/sshKeys"
                element={<SshKeys slz={slzStateStore} />}
              />
              <Route path="/vsi" element={<Vsi slz={slzStateStore} />} />
              <Route
                path="/resourceGroups"
                element={<ResourceGroups slz={slzStateStore} />}
              />
              <Route
                path="/f5BigIP"
                element={<F5BigIp slz={slzStateStore} />}
              />
              <Route
                path="/clusters"
                element={<Clusters slz={slzStateStore} />}
              />
              <Route
                path="/iamAccountSettings"
                element={<IamAccountSettings slz={slzStateStore} />}
              />
              <Route
                path="/subnets"
                element={<SubnetForm slz={slzStateStore} />}
              />
              <Route
                path="/accessGroups"
                element={<AccessGroups slz={slzStateStore} />}
              />
              <Route
                path="/resetState"
                element={<ResetState storeName={this.state.storeName} />}
              />
              <Route
                path="/summary"
                element={<Summary slz={slzStateStore} />}
              />
              <Route path="/releaseNotes" element={<ReleaseNotes />} />
            </Routes>
          </div>
          {window.location.hash !== "#/resetState" && (
            <>
              <div>
                <ul className="notification-list leftTextAlign">
                  {this.state.notifications.map((notification, index) => (
                    <li key={index}>
                      <Notification
                        kind={notification.kind}
                        text={notification.text}
                        title={notification.title}
                        timeout={notification.timeout}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={
                  slzStateStore.store.hideJson === true ||
                  contains(
                    ["/home", "/summary", "/about", "/releaseNotes"],
                    window.location.hash.split("#")[1]
                  )
                    ? "hidden"
                    : "rightPanelWidth"
                }
              >
                <CodeMirror
                  className="label"
                  readOnly={true}
                  value={codeMirrorJson(window.location.hash, this.state)}
                  extensions={[javascript({ jsx: true })]}
                  theme={carbonDesignCodemirrorTheme}
                />
              </div>
            </>
          )}
        </div>
        <Footer
          navigate={this.navigate}
          previous={this.getTitle(true)}
          next={this.getTitle(false)}
          footerOpen={slzStateStore.store.footerOpen}
          toggleFooter={() => this.toggleStateStoreValue("footerOpen")}
        />
      </div>
    );
  }
}
export default App;
