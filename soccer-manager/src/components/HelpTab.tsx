import { Box, Tabs, Tab } from "@mui/material";
import LineupHelp from "./Help/LineupHelp";
import RosterHelp from "./Help/RosterHelp";
import MatchHelp from "./Help/MatchHelp";
import { useState } from "react";

export default function Help() {
  const [helpTab, setHelpTab] = useState<number>(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setHelpTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={helpTab}
          onChange={handleChange}
          aria-label="help section tabs"
        >
          <Tab label="Roster" />
          <Tab label="Lineup" />
          <Tab label="Match" />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {helpTab === 0 && <RosterHelp />}
        {helpTab === 1 && <LineupHelp />}
        {helpTab === 2 && <MatchHelp />}
      </Box>
    </Box>
  );
}
