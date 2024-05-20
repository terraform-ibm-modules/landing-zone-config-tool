import React from "react";
import { Tabs, TabList, TabPanels, TabPanel, Tab } from "@carbon/react";
import CustomJson from "./forms/CustomJson.js";
import PatternForm from "./forms/Pattern.js";

const Home = props => {
  return (
    <div>
      <Tabs>
        <TabList aria-label={"home-tab-list"}>
          <Tab>Start</Tab>
          <Tab>Import JSON</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div>
              <h2>landing zone configuration tool</h2>
              <PatternForm slz={props.slz} />
            </div>
          </TabPanel>
          <TabPanel>
            <CustomJson slz={props.slz} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Home;
