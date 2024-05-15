import { CheckmarkFilled, ErrorFilled } from "@carbon/icons-react";
import { Tile, Button, TextArea } from "@carbon/react";
import React from "react";
import { validate } from "../lib/index.js";
import { SlzToggle } from "./icse/index.js";
import { downloadContent, formatConfig } from "./SlzHeader.js";
import "./summary.css";

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usePrettyJson: true,
      error: "",
      fileDownloadUrl: ""
    };
    try {
      validate(this.props.slz.store.configDotJson, true);
    } catch (error) {
      this.state.error = error.message;
    }
    this.toggleUsePrettyJson = this.toggleUsePrettyJson.bind(this);
  }

  toggleUsePrettyJson() {
    this.setState({ usePrettyJson: !this.state.usePrettyJson });
  }

  render() {
    let json = formatConfig(this, !this.state.usePrettyJson, true);
    return (
      <>
        <h4 className="leftTextAlign marginBottomSmall">Summary</h4>
        <Tile className="widthOneHundredPercent">
          {this.state.error ? (
            <>
              <div className="displayFlex">
                <ErrorFilled
                  size="16"
                  className="marginTopXs marginRightSmall redFill"
                />
                <h4 className="marginBottomSmall">Invalid Configuration</h4>
              </div>
              <p className="leftTextAlign marginBottomSmall">
                We found an error in your configuration. Please go back to the
                previous steps to fix it.
              </p>
            </>
          ) : (
            <>
              <div className="displayFlex">
                <CheckmarkFilled
                  size="16"
                  className="marginTopXs marginRightSmall greenFill"
                />
                <h4 className="marginBottomSmall">Congratulations!</h4>
              </div>
              <div className="leftTextAlign">
                <p className="marginBottomSmall">
                  You have completed the customization of your landing zone.
                </p>
                <ul>
                  <p className="marginBottomSmall">
                    • You can view and download your <em>override.json</em> file, and then import it into{" "}
                    <a
                      href="https://github.com/open-toolchain/landing-zone#ibm-secure-landing-zone"
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      Secure Landing Zone
                    </a>
                    .
                  </p>
                  <p className="marginBottomXs">
                    • To get a stringified copy of the JSON for use in IBM
                    Schematics, click the <strong>Copy to Clipboard</strong> button.
                  </p>
                  <ul className="marginLeft marginBottomSmall">
                    <li className="marginBottomXs">
                      • Currently, Schematics has a character limit of 15000.
                    </li>
                    <li>
                      • Configuration files over 15000 characters can still be
                      used by local landing zone configuration tool deployments.
                    </li>
                  </ul>
                  <div className="marginBottom">
                    <p className="marginBottomXs">
                      • Your custom environment prefix is{" "}
                      <code className="highlightCode">
                        {this.props.slz.store.prefix}
                      </code>
                    </p>
                    <div className="marginLeft">
                      <ul>
                        <li className="marginBottomXs">
                          • This prefix <strong>must</strong> be added to your
                          Schematics workspace or Terraform environment as the
                          value for the variable "prefix".
                        </li>
                        <li>
                          •{" "}
                          <strong>
                            Your deployment will fail if the prefix used here
                            does not match the template.
                          </strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </ul>
              </div>
            </>
          )}
          <SlzToggle
            labelText="Use Pretty JSON"
            defaultToggled={this.state.usePrettyJson}
            onToggle={this.toggleUsePrettyJson}
            className="marginBottom displayFlex"
            id="use-pretty-json"
          />
          <TextArea
            labelText="override.json"
            rows={20}
            cols={75}
            value={json}
            readOnly
            className="marginBottomSmall fitContent rightTextAlign codeFont"
            invalid={this.state.error !== ""}
            invalidText={this.state.error}
            helperText={
              <div className={json.length > 15000 ? "orangeText" : ""}>
                {json.length + "/15000"}
              </div>
            }
          />
          <div className="marginBottomXs fitContent">
            <Button
              className="marginRightMed"
              onClick={() =>
                downloadContent(this, this.download, !this.state.usePrettyJson)
              }
              disabled={this.state.error !== ""}
            >
              Download JSON
            </Button>
            <a
              className="hidden"
              download="override.json"
              href={this.state.fileDownloadUrl}
              ref={e => (this.download = e)}
            >
              download
            </a>
            <Button
              kind="tertiary"
              onClick={() =>
                navigator.clipboard.writeText(formatConfig(this, true))
              }
              disabled={this.state.error !== ""}
            >
              Copy to Clipboard
            </Button>
          </div>
        </Tile>
      </>
    );
  }
}

export default Summary;
