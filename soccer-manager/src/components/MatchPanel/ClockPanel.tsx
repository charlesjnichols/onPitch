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
  ButtonGroup, // Added
} from "@mui/material";

export default function ClockPanel() {
  const { isRunning, startedAtSec, accumulatedSec } = useAppStore(
    (s) => s.gameClock,
  );
  const startClock = useAppStore((s) => s.startClock);
  const pauseClock = useAppStore((s) => s.pauseClock);
  const resetClock = useAppStore((s) => s.resetClock);
  // Added score states and actions
  const myTeamScore = useAppStore((s) => s.myTeamScore);
  const opponentTeamScore = useAppStore((s) => s.opponentTeamScore);
  const incrementMyScore = useAppStore((s) => s.incrementMyScore);
  const decrementMyScore = useAppStore((s) => s.decrementMyScore);
  const incrementOpponentScore = useAppStore(
    (s) => s.incrementOpponentScore,
  );
  const decrementOpponentScore = useAppStore(
    (s) => s.decrementOpponentScore,
  );

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
  const formattedTime = formatClock(Math.floor(elapsedSec));

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
        alignItems: "center",
      }}
    >
      {/* Score Display and Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
        <ButtonGroup size="small" variant="outlined" aria-label="my team score controls">
          <Button onClick={decrementMyScore}>-</Button>
          <Button disableRipple>
            <Typography color="text.primary" variant="body2">My Team: {myTeamScore}</Typography>
          </Button>
          <Button onClick={incrementMyScore}>+</Button>
        </ButtonGroup>

        <ButtonGroup size="small" variant="outlined" aria-label="opponent team score controls">
          <Button onClick={decrementOpponentScore}>-</Button>
          <Button disableRipple>
            <Typography color="text.primary" variant="body2">Opponents: {opponentTeamScore}</Typography>
          </Button>
          <Button onClick={incrementOpponentScore}>+</Button>
        </ButtonGroup>
      </Box>

      <Typography variant="h4">{formattedTime}</Typography>

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
          color="secondary"
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

