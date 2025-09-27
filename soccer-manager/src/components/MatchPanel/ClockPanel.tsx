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
  ButtonGroup,
  Stack,
  IconButton,
} from "@mui/material";
// Added Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function ClockPanel() {
  const { startedAtSec, accumulatedSec } = useAppStore((s) => s.clock);
  const isRunning = useAppStore((s) => s.isRunning);
  const startClock = useAppStore((s) => s.startClock);
  const pauseClock = useAppStore((s) => s.pauseClock);
  const resetClock = useAppStore((s) => s.resetClock);
  const resetPlayerStats = useAppStore((s) => s.resetPlayerStats);
  const myTeamScore = useAppStore((s) => s.myTeamScore);
  const opponentTeamScore = useAppStore((s) => s.opponentTeamScore);
  const incrementMyScore = useAppStore((s) => s.incrementMyScore);
  const decrementMyScore = useAppStore((s) => s.decrementMyScore);
  const incrementOpponentScore = useAppStore((s) => s.incrementOpponentScore);
  const decrementOpponentScore = useAppStore((s) => s.decrementOpponentScore);

  const [tick, setTick] = useState(0);
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

  const handleOpenResetConfirm = () => {
    setIsResetConfirmOpen(true);
  };

  const handleCloseResetConfirm = () => {
    setIsResetConfirmOpen(false);
  };

  const handleConfirmReset = () => {
    resetClock();
    resetPlayerStats();
    handleCloseResetConfirm();
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
        <ButtonGroup
          size="small"
          variant="outlined"
          aria-label="my team score controls"
        >
          <Button onClick={decrementMyScore}>-</Button>
          <Button disableRipple>
            <Typography variant="body2" color="text.primary">
              Home: {myTeamScore}
            </Typography>
          </Button>
          <Button onClick={incrementMyScore}>+</Button>
        </ButtonGroup>
        {":"}
        <ButtonGroup
          size="small"
          variant="outlined"
          aria-label="opponent team score controls"
        >
          <Button onClick={decrementOpponentScore}>-</Button>
          <Button disableRipple>
            <Typography variant="body2" color="text.primary">
              Away: {opponentTeamScore}
            </Typography>
          </Button>
          <Button onClick={incrementOpponentScore}>+</Button>
        </ButtonGroup>
      </Box>

      <Typography variant="h4">{formattedTime}</Typography>

      {/* Replaced Buttons with IconButtons in a Stack */}
      <Stack direction="row" spacing={1}>
        {!isRunning ? (
          <IconButton
            color="primary"
            onClick={startClock}
            aria-label="start clock"
          >
            <PlayArrowIcon />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={pauseClock}
            aria-label="pause clock"
          >
            <PauseIcon />
          </IconButton>
        )}
        <IconButton
          color="secondary"
          onClick={handleOpenResetConfirm}
          aria-label="reset clock"
        >
          <RestartAltIcon />
        </IconButton>
      </Stack>

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
            all player minutes played and scores.
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
