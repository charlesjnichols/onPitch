import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useAppStore } from "../../store";
import type { Player } from "../../types";
import PlayerRow from "./PlayerRow";
import RosterInput from "./RosterInput";

function RosterPanel() {
  const roster = useAppStore((s) => s.roster);
  const addPlayer = useAppStore((s) => s.addPlayer);
  const [sortedRoster, setSortedRoster] = useState<Player[]>([]);

  useEffect(() => {
    {
      {
        setSortedRoster(
          [...roster].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    }
  }, [roster]);

  const handleAddPlayer = (name: string) => {
    addPlayer({
      name: name.trim(),
      positionTags: [],
      isOnField: false,
      minutesPlayedSec: 0,
      shots: 0,
      passes: 0,
      saves: 0,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 600,
      }}
    >
      <RosterInput onAddPlayer={handleAddPlayer} />

      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {sortedRoster.length === 0 ? (
          <Box>No players yet. Add some to build your roster.</Box>
        ) : (
          sortedRoster.map((p) => <PlayerRow key={p.id} player={p} />)
        )}
      </Box>
    </Box>
  );
}

export default RosterPanel;
