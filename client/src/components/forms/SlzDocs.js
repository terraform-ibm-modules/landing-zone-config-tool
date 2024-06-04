import React from "react";
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell
} from "@carbon/react";
import PropTypes from "prop-types";
import "./slzDocs.css";
import docs from "../../docs/slz-docs.json";

/**
 * Text field
 */
const SlzDocTextField = props => {
  return (
    <div
      className={
        props.text === "_default_includes"
          ? "marginBottomSmall"
          : props.className
      }
    >
      {props.text === "_default_includes"
        ? "The default configuration includes:"
        : props.text}
    </div>
  );
};

SlzDocTextField.defaultProps = {
  className: "marginBottom"
};

SlzDocTextField.propTypes = {
  className: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

/**
 * table rendered this way to pass key param
 */
const SlzDocTable = props => {
  let headers = [];
  if (props.list[0][0] === "_headers") {
    headers = props.list.shift(); // set headers to header row
    headers.shift(); // remove _headers item
  }
  return <StructuredList list={props.list} headers={headers} />;
};

SlzDocTable.propTypes = {
  list: PropTypes.array.isRequired
};

/**
 * related links
 */
const RelatedLinks = props => {
  return (
    <>
      <div className="smallerText">Related links</div>
      {props.links.map((link, index) => (
        <div key={"related-link-" + index}>
          <a
            href={link[0]}
            target="_blank"
            rel="noreferrer"
            className="smallerText"
          >
            {link.length === 1 ? "Docs" : link[1]}
          </a>
        </div>
      ))}
    </>
  );
};

RelatedLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  ).isRequired
};

/*
 * Doc form to force props after retrieve from json
 */
const SlzDocForm = props => {
  return (
    <div className="subForm leftTextAlign about">
      {props.content.map((field, index) =>
        field.text ? (
          // text field
          <SlzDocTextField key={index} {...field} />
        ) : field.subHeading ? (
          // subheading
          <h6 className="marginBottomSmall" key={index}>
            {field.subHeading}
          </h6>
        ) : (
          // table
          <SlzDocTable key={index} list={field.table} />
        )
      )}
      {props.relatedLinks && <RelatedLinks links={props.relatedLinks} />}
    </div>
  );
};

SlzDocForm.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      className: PropTypes.string,
      table: PropTypes.array,
      subHeading: PropTypes.string
    })
  ).isRequired,
  relatedLinks: PropTypes.array
};

// Show items in a structured list
const StructuredList = props => {
  return (
    <StructuredListWrapper className="marginBottom">
      {props.headers && (
        <StructuredListHead>
          <StructuredListRow>
            {props.headers.map((cell, index) => (
              <StructuredListCell head key={index}>
                {cell}
              </StructuredListCell>
            ))}
          </StructuredListRow>
        </StructuredListHead>
      )}
      <StructuredListBody>
        {props.list.map((row, rowIndex) => (
          <StructuredListRow key={rowIndex}>
            {row.map((cell, colIndex) => (
              <StructuredListCell key={colIndex}>{cell}</StructuredListCell>
            ))}
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

StructuredList.propTypes = {
  headers: PropTypes.array,
  list: PropTypes.array.isRequired
};

/**
 * slz docs component
 */
export const SlzDocs = component => {
  let docJson = docs[component];
  return <SlzDocForm {...docJson} />;
};

export const ResourceGroupDocs = () => {
  return SlzDocs("resource_groups");
};

export const ObjectStorageDocs = () => {
  return SlzDocs("cos");
};

export const VpcDocs = () => {
  return SlzDocs("vpcs");
};

export const VsiDocs = () => {
  return SlzDocs("vsi");
};

export const KeyManagementDocs = () => {
  return SlzDocs("key_management");
};

export const VpeDocs = () => {
  return SlzDocs("virtual_private_endpoints");
};

export const TransitGatewayDocs = () => {
  return SlzDocs("transit_gateway");
};

export const AtrackerDocs = () => {
  return SlzDocs("atracker");
};

export const VpnDocs = () => {
  return SlzDocs("vpn_gateways");
};

export const ClusterDocs = () => {
  return SlzDocs("clusters");
};

export const TeleportDocs = () => {
  return SlzDocs("teleport");
};

export const SshKeysDocs = () => {
  return SlzDocs("ssh_keys");
};

export const SecurityGroupsDocs = () => {
  return SlzDocs("security_groups");
};

export const AclDocs = () => {
  return SlzDocs("network_acls");
};

export const SecretsManagerDocs = () => {
  return SlzDocs("secrets_manager");
};

export const IAMDocs = () => {
  return SlzDocs("iam_account_settings");
};

export const AccessGroupDocs = () => {
  return SlzDocs("access_groups");
};

export const AppIdDocs = () => {
  return SlzDocs("appid");
};

export const SubnetDocs = () => {
  return SlzDocs("subnets");
};

export const F5Docs = () => {
  return SlzDocs("f5");
};

// fine as is, not used in tab panel
export const EdgeNetworkingDocs = () => {
  return (
    <div className="marginBottomSmall">
      <p className="smallFontPatterns leftTextAlign">
        Need public internet access? With{" "}
        <a
          href="https://www.f5.com/trials/big-ip-virtual-edition"
          rel="noreferrer noopener"
          target="_blank"
        >
          F5 BIG-IP Virtual Edition
        </a>
        , users can create a full tunnel client-to-site{" "}
        <a
          href="https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-full-tunnel-vpn"
          rel="noreferrer noopener"
          target="_blank"
        >
          VPN
        </a>{" "}
        to connect you to your management VPC, and/or enable a{" "}
        <a
          href="https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-waf-tutorial"
          rel="noreferrer noopener"
          target="_blank"
        >
          Web Application Firewall
        </a>{" "}
        (WAF) to allow consumers to connect to your workload VPC over the public
        internet.
      </p>
    </div>
  );
};

// fine as is, not used in tab panel
export const PatternDocs = () => {
  return (
    <div
      id="pattern-form-information"
      className="leftTextAlign smallFontPatterns marginBottom"
    >
      <div className="marginBottomSmall">
        <p className="patternDocText">
          Use the landing zone configuration tool to customize your deployable architecture landing zone's override.json file.
        </p>
      </div>
      <h6>By customizing the override.json, you can create the following:</h6>
      <ul className="bullets indent">
        <li>A resource group for cloud services and for each VPC</li>
        <li>Object storage instances for flow logs and activity tracker</li>
        <li>
          Encryption keys in either a Key Protect or Hyper Protect Crypto
          Services instance
        </li>
        <li>A management and workload VPC connected by a transit gateway</li>
        <li>A flow log collector for each VPC</li>
        <li>All necessary networking rules to allow communication</li>
        <li>Virtual private endpoints for Cloud Object Storage in each VPC</li>
        <li>A VPN Gateway in the Management VPC</li>
      </ul>
      <p>This tool is verified to work with landing zone deployable architecture version: <a href="https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone/releases/tag/v5.24.0">5.24.0</a></p>
    </div>
  );
};

// fine as is, not used in tab panel
export const PrefixDocs = () => {
  return (
    <div className="leftTextAlign marginLeft">
      <p className="smallFont">
        <strong>
          The prefix must begin with a lowercase letter and contain only
          lowercase letters, numbers, and - characters. Prefixes must end with a
          lowercase letter or number and be 16 or fewer characters.&nbsp;
        </strong>
        The prefix added here is for component rendering only. The landing zone
        variable prefix is not exposed to the user from override.json and can
        only be entered at the pattern level. To ensure your environment
        provisions correctly, make sure to set the prefix variable to this value
        on environment creation.
      </p>
    </div>
  );
};
