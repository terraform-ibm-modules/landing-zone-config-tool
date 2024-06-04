import "./patterns.css";
import React from "react";
import { Tile } from "@carbon/react";
import { Add, CloudAlerting } from "@carbon/icons-react";
import PropTypes from "prop-types";
import vsi from "../../../images/vsi.png";
import roks from "../../../images/roks.png";
import vpc from "../../../images/vpc.png";

export const EmptyResourceTile = props => {
  return props.showIfEmpty === false || props.showIfEmpty.length === 0 ? (
    <Tile className="marginBottomXs">
      <CloudAlerting size="24" className="iconMargin" />
      No {props.name}.{" "}
      {props.instructions || (
        <>
          Click the
          <Add size="24" className="inlineIconMargin" />
          button to add one.
        </>
      )}
    </Tile>
  ) : (
    ""
  );
};

EmptyResourceTile.defaultProps = {
  name: "items in this list."
};

EmptyResourceTile.propTypes = {
  name: PropTypes.string.isRequired,
  showIfEmpty: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]).isRequired
};

export const PatternTile = props => {
  let patternImage =
    props.state.id === "vsi" ? vsi : props.state.id === "roks" ? roks : vpc;
  return (
    <a
      href={patternImage}
      target="_blank"
      className="tile"
      rel="noreferrer noopener"
    >
      <Tile className={"tileStyles borderGray"}>
        <h4>{props.state.title}</h4>
        <div className="description">{props.state.description}</div>
        <img
          alt="Pattern images"
          src={patternImage}
          className="imageMargin imageTileSized magnifier"
        />
      </Tile>
    </a>
  );
};

PatternTile.propTypes = {
  state: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired
};
