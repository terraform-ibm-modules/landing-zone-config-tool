import { CaretLeft, CaretRight, Close, ChevronUp } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import React from "react";
import { PopoverWrapper } from "./icse/index.js";
import PropTypes from "prop-types";
import "./footer.scss";

/**
 * div for fooyer components
 */
class FooterHighlight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }
  /**
   * handle mouse over
   */
  handleMouseOver() {
    this.setState({ isHovering: true });
  }

  /**
   * handle mouse out
   */
  handleMouseOut() {
    this.setState({ isHovering: false });
  }

  render() {
    return (
      <a
        className="cursorPointer"
        onClick={() => this.props.navigate(this.props.backButton)}
      >
        <div
          className={
            "displayFlex alignItemsCenter justifyContent " +
            (this.props.backButton ? "backButton" : "floatRight nextButton") +
            (this.state.isHovering ? " highlight" : "")
          }
          onMouseEnter={this.handleMouseOver}
          onMouseLeave={this.handleMouseOut}
        >
          {this.props.children}
        </div>
      </a>
    );
  }
}

FooterHighlight.defaultProps = {
  backButton: false
};

FooterHighlight.propTypes = {
  children: PropTypes.node.isRequired,
  backButton: PropTypes.bool,
  navigate: PropTypes.func.isRequired
};

const Footer = props => {
  return (
    <div className="footerButton pointerEventsNone">
      <div className="buttonRight">
        <PopoverWrapper
          hoverText={
            props.footerOpen ? "Dismiss Navigation Bar" : "Show Navigation Bar"
          }
          contentClassName="footerPopover"
          align="left"
        >
          <Button
            kind="primary"
            size="sm"
            id="footer-open-close"
            onClick={() => {
              props.toggleFooter();
            }}
            className={
              "forceTertiaryButtonStyles pointerEventsAuto" +
              (props.footerOpen ? "" : " buttonCollapsed")
            }
          >
            {props.footerOpen ? <Close /> : <ChevronUp />}
          </Button>
        </PopoverWrapper>
      </div>
      {props.footerOpen && (
        <div className="footer pointerEventsAuto">
          {props.previous && (
            <FooterHighlight backButton navigate={props.navigate}>
              <CaretLeft size="24" />
              <div className="caretMargin leftTextAlign">
                <div className="smallerTextFooter">
                  Return to previous section
                </div>
                <div className="smallerText">{props.previous}</div>
              </div>
            </FooterHighlight>
          )}
          {props.next && (
            <FooterHighlight navigate={props.navigate}>
              <div className="caretMargin rightTextAlign">
                {window.location.hash === "#/home" || window.location.hash === "" ? (
                  <div>Begin Customization</div>
                ) : (
                  <>
                    <div className="smallerTextFooter">
                      Continue on to next section
                    </div>
                    <div className="smallerText">{props.next}</div>
                  </>
                )}
              </div>
              <CaretRight size="24" />
            </FooterHighlight>
          )}
        </div>
      )}
    </div>
  );
};

Footer.propTypes = {
  footerOpen: PropTypes.bool.isRequired,
  next: PropTypes.string, // can be null for conditional rendering
  previous: PropTypes.string, // can be null for conditional rendering
  navigate: PropTypes.func.isRequired,
  toggleFooter: PropTypes.func.isRequired
};

export default Footer;
