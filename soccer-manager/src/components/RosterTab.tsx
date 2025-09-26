import { useRef } from "react";
import Papa from "papaparse";
import RosterPanel from "./RosterPanel/RosterPanel";
import { useAppStore } from "../store";
import { Box, Button, styled } from "@mui/material";
import type { PositionTag } from "../types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%) !important",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function RosterTab() {
  const roster = useAppStore((s) => s.roster);
  const addPlayer = useAppStore((s) => s.addPlayer);
  const resetRoster = useAppStore((s) => s.resetRoster);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const exportRosterCsv = () => {
    const rows = roster.map((p) => ({
      Name: p.name,
      Number: p.number ?? "",
      PreferredPos: p.positionTags.join("|") ?? "",
      MinutesPlayedSec: p.minutesPlayedSec ?? "",
      Passes: p.passes ?? "",
      Shots: p.shots ?? "",
      Saves: p.saves ?? "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roster.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (file: File) => {
    resetRoster();
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const seen = new Set<string>();
        const rows = res.data as any[];
        for (const r of rows) {
          const name = String(r.Name || r.name || "").trim();
          const number = r.Number ? Number(r.Number) : undefined;
          const preferred = String(r.PreferredPos || r.preferredPos || "")
            .trim()
            .split("|");
          if (!name) continue;
          const key = `${name}|${number ?? ""}`;
          if (seen.has(key)) continue;
          seen.add(key);
          addPlayer({
            name,
            number,
            positionTags: preferred ? (preferred as PositionTag[]) : [],
            isOnField: false,
            minutesPlayedSec: 0,
            shots: 0,
            passes: 0,
            saves: 0,
          });
        }
        alert("Roster imported");
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "90%",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        <Button variant="contained" onClick={() => fileRef.current?.click()}>
          Import CSV
        </Button>
        <Button variant="contained" onClick={exportRosterCsv}>
          Export CSV
        </Button>

        <VisuallyHiddenInput
          type="file"
          accept=".csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
          ref={fileRef}
        />
      </Box>
      <RosterPanel />
    </Box>
  );
}
