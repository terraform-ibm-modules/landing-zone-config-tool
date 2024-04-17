import { Accordion, AccordionItem } from "@carbon/react";
import React from "react";
import { SlzHeading } from "./icse/index.js";
import releaseNotes from "../docs/release-notes.json";

const ReleaseNote = props => {
  return (
    <AccordionItem title={props.note.version}>
      <div className="smallFont leftTextAlign">
        <strong>Features: </strong>
        <ul className="bullets indent">
          {props.note.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <strong>Fixes: </strong>
        <ul className="bullets indent">
          {props.note.fixes.map((fix, index) => (
            <li key={index}>{fix}</li>
          ))}
        </ul>
      </div>
    </AccordionItem>
  );
};

const ReleaseNotes = () => {
  return (
    <div>
      <SlzHeading name="Release Notes" />
      <hr />
      <Accordion align="start">
        {releaseNotes.map(note => (
          <ReleaseNote key={note.version} note={note} />
        ))}
      </Accordion>
    </div>
  );
};

export default ReleaseNotes;
