import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Bench from "./Bench/Bench";
import FormationSelector from "./LineupPanel/FormationSelector";
import Pitch from "./LineupPanel/Pitch";
import { useAppStore } from "../store";

export default function LineupTab() {
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    undefined
  );
  const placePlayerInSlot = useAppStore((s) => s.placePlayerInSlot);

  const handleBenchClick = (benchId: string) => {
    if (selectedSlotId) {
      placePlayerInSlot(selectedSlotId, benchId);
      setSelectedSlotId(undefined);
    }
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iP(ad|hone|od)/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        (navigator as any).maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
      // HTML5 DnD is unreliable on iOS Safari; pointer-based drag is enabled
      console.warn(
        "[SubTracker] iOS Safari detected — using Pointer Events drag (no HTML5 DnD)."
      );
    }
  }, []);
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
      <Box
        sx={{
          gridColumn: { xs: "auto", md: "span 2" },
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        <FormationSelector />
        <Pitch
          selectedSlotId={selectedSlotId}
          setSelectedSlotId={setSelectedSlotId}
        />
      </Box>
      <Bench
        selectedSlotId={selectedSlotId}
        setSelectedSlotId={setSelectedSlotId}
        onBenchClick={handleBenchClick}
      />
    </Box>
  );
}