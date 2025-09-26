import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../../store";
import { formatClock, getTotalElapsedSec } from "../../utils/time";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
export default function ClockPanel() {
  const { isRunning, startedAtSec, accumulatedSec } = useAppStore(
    (s) => s.gameClock,
  );
  const { startedAtSec: subStartedAtSec, accumulatedSec: subAccumulatedSec } =
    useAppStore((s) => s.subClock);
  const startClock = useAppStore((s) => s.startClock);
  const pauseClock = useAppStore((s) => s.pauseClock);
  const resetClock = useAppStore((s) => s.resetClock);
  const [tick, setTick] = useState(0);
  // New state for reset confirmation dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const elapsedSec = useMemo(
    () => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec),
    [isRunning, startedAtSec, accumulatedSec, tick],
  );
  const subElapsedSec = useMemo(
    () => getTotalElapsedSec(isRunning, subStartedAtSec, subAccumulatedSec),
    [isRunning, subStartedAtSec, subAccumulatedSec, tick],
  );
  const formattedTime = formatClock(Math.floor(elapsedSec));
  const subFormattedTime = formatClock(Math.floor(subElapsedSec));

  // Handlers for the reset confirmation dialog
  const handleOpenResetConfirm = () => {
    setIsResetConfirmOpen(true);
  };

  const handleCloseResetConfirm = () => {
    setIsResetConfirmOpen(false);
  };

  const handleConfirmReset = () => {
    resetClock(); // Perform the actual reset
    handleCloseResetConfirm(); // Close the dialog
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        alignItems: "center",
      }}
    >
      <Typography variant="h4">{formattedTime}</Typography>
      <Typography variant="body2">Sub Clock: {subFormattedTime}</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        {!isRunning ? (
          <Button variant="contained" color="success" onClick={startClock}>
            Start
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={pauseClock}>
            Pause
          </Button>
        )}
        {/* Changed onClick to open the confirmation dialog */}
        <Button
          variant="contained"
          color="inherit"
          onClick={handleOpenResetConfirm}
        >
          Reset
        </Button>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={isResetConfirmOpen}
        onClose={handleCloseResetConfirm}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">{"Reset Game Clock?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            Are you sure you want to reset the game clock? This will also reset
            all player minutes played.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReset} color="error" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
