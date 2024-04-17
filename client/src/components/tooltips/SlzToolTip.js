import {
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  Link
} from "@carbon/react";
import React from "react";
import { Information } from "@carbon/icons-react";

/**
 * render a tooltip around an input field
 * @param {Object} props
 * @param {string} props.content
 * @param {string=} props.link optional link
 * @param {string=} props.align alignment
 * @returns slz tooltip component
 */
const SlzToolTip = props => {
  return (
    <>
      <Toggletip align={props.align}>
        <ToggletipButton>
          <Information className="tooltipMarginLeft" />
        </ToggletipButton>
        <ToggletipContent>
          <p>
            {props.content}
            {props.link && (
              <>
                {" "}
                Visit{" "}
                <Link onClick={() => window.open(props.link, "_blank")}>
                  this link
                </Link>{" "}
                for more information.
              </>
            )}
          </p>
        </ToggletipContent>
      </Toggletip>
    </>
  );
};

export default SlzToolTip;
