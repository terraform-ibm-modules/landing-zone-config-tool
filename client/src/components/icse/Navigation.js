import {
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavLink
} from "@carbon/react";
import {
  Home,
  IbmCloudKeyProtect,
  ObjectStorage,
  VirtualPrivateCloud,
  SubnetAclRules,
  IbmCloudSubnets,
  IbmCloudTransitGateway,
  Security,
  IbmCloudVpcEndpoints,
  CloudAuditing,
  Password,
  BareMetalServer_02,
  IbmCloudKubernetesService,
  CloudApp,
  GatewayVpn,
  BastionHost,
  IdManagement,
  GroupAccess,
  GroupResource,
  IbmCloudSecretsManager,
  IbmCloudSecurityComplianceCenter,
  Report,
  Help,
  Launch,
  Bullhorn
} from "@carbon/icons-react";
import React from "react";
import "./navigation.scss";
import NavItem from "./wrappers/NavItem.js";
import PropTypes from "prop-types";

const onClickDocumentation = () => {
  window.open(
    "https://github.com/open-toolchain/landing-zone#ibm-secure-landing-zone",
    "_blank"
  );
};

const requiredComponents = [
  {
    title: "Resource groups",
    path: "/resourceGroups",
    icon: GroupResource
  },
  {
    title: "Key management",
    path: "/keyManagement",
    icon: IbmCloudKeyProtect
  },
  {
    title: "Object Storage",
    path: "/objectStorage",
    icon: ObjectStorage
  },
  {
    title: "Virtual private clouds",
    path: "/vpcs",
    icon: VirtualPrivateCloud
  },
  { title: "VPC access control", path: "/nacls", icon: SubnetAclRules },
  { title: "VPC subnets", path: "/subnets", icon: IbmCloudSubnets },
  {
    title: "Transit gateway",
    path: "/transitGateway",
    icon: IbmCloudTransitGateway
  },
  { title: "Security groups", path: "/securityGroups", icon: Security },
  {
    title: "Virtual private endpoints",
    path: "/vpe",
    icon: IbmCloudVpcEndpoints
  },
  {
    title: "Activity Tracker",
    path: "/activityTracker",
    icon: CloudAuditing
  },
  { title: "SSH keys", path: "/sshKeys", icon: Password },
  {
    title: "Virtual Server Instances",
    path: "/vsi",
    icon: BareMetalServer_02
  },
  {
    title: "Clusters",
    path: "/clusters",
    icon: IbmCloudKubernetesService
  },
  { title: "VPN gateways", path: "/vpn", icon: GatewayVpn }
];

const optionalComponents = [
  // not exposed in the catalog version

  // { title: "App ID", path: "/appID", icon: CloudApp },
  // {
  //   title: "Teleport Bastion Host",
  //   path: "/teleport",
  //   icon: BastionHost
  // },
  // { title: "F5 Big IP", path: "/f5BigIP", icon: F5Icon },
  // {
  //   title: "IAM Account Settings",
  //   path: "/iamAccountSettings",
  //   icon: IdManagement
  // },
  // { title: "Access Groups", path: "/accessGroups", icon: GroupAccess },
  // {
  //   title: "Secrets Manager",
  //   path: "/secretsManager",
  //   icon: IbmCloudSecretsManager
  // }
];

const Navigation = props => {
  let dividerClass = props.expanded ? "expandedDivider" : "railDivider";
  return (
    <SideNav
      expanded={props.expanded}
      onOverlayClick={props.onOverlayClick}
      aria-label="Side navigation"
      className={props.expanded ? "expanded" : "rail"}
    >
      <SideNavItems>
        <NavItem
          item={{ path: "/home", icon: Home, title: "Home" }}
          key="Home"
          expanded={props.expanded}
          navigate={props.navigate}
        />
        {props.expanded && (
          <>
            <NavItem
              item={{ path: "/about", icon: Help, title: "About" }}
              key="About"
              expanded={props.expanded}
              navigate={props.navigate}
            />
            <NavItem
              item={{
                path: "/releaseNotes",
                icon: Bullhorn,
                title: "Release Notes"
              }}
              key="ReleaseNotes"
              expanded={props.expanded}
              navigate={props.navigate}
            />
            <SideNavLink
              onClick={onClickDocumentation}
              renderIcon={Launch}
              title={props.expanded ? "" : "Documentation"} // only show title when not expanded
            >
              Documentation
            </SideNavLink>
          </>
        )}
        <SideNavDivider className={dividerClass} />
        {props.expanded && (
          <SideNavLink href="#">Required Components</SideNavLink>
        )}
        {requiredComponents.map(item => (
          <NavItem item={item} key={item.title} expanded={props.expanded}  navigate={props.navigate} />
        ))}
        {/* <SideNavDivider className={dividerClass} />
        {props.expanded && (
          <SideNavLink href="#">Optional Components</SideNavLink>
        )}
        {optionalComponents.map(item => (
          <NavItem
            item={item}
            optional
            key={item.title}
            expanded={props.expanded}
          />
        ))} */}
        <SideNavDivider className={dividerClass} />
        <NavItem
          item={{ path: "/summary", icon: Report, title: "Summary" }}
          key="Summary"
          expanded={props.expanded}
          navigate={props.navigate}
        />
      </SideNavItems>
    </SideNav>
  );
};

Navigation.defaultProps = {
  expanded: false
};

Navigation.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onOverlayClick: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default Navigation;
