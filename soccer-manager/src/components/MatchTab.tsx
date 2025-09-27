import { useEffect, useState } from "react";
import ClockPanel from "./MatchPanel/ClockPanel";
import { useAppStore } from "../store";
import SubSheet from "./Subs/SubSheet";
import {
  Button,
  Box,
  // IconButton,
  Typography,
  Stack,
  ButtonGroup,
  Divider,
} from "@mui/material";
import Bench from "./Bench/Bench";
// import { getTotalElapsedSec } from "../utils/time";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";
// import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export default function MatchTab() {
  const roster = useAppStore((s) => s.roster);
  const getFormattedLiveMinutes = useAppStore((s) => s.getFormattedLiveMinutes);
  const isRunning = useAppStore((s) => s.isRunning);

  const tactics = useAppStore((s) => s.tactics);
  const formation = useAppStore((s) => s.formation);
  const {
    substitutionQueue,
    cancelSub,
    performSubs,
    recordShot,
    recordPass,
    recordSave,
    decrementShot,
    decrementPass,
    decrementSave,
  } = useAppStore((s) => s);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [benchId, setBenchId] = useState<string | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    undefined,
  );

  // const resetSubClock = useAppStore((s) => s.resetSubClock);
  // const rotationIntervalMinutes = useAppStore(
  //   (s) => s.config.rotationIntervalMinutes,
  // );

  const handleBenchClick = (benchId: string) => {
    setBenchId(benchId);
    setSheetOpen(true);
  };

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [isRunning]);

  const [onFieldPlayers, setOnFieldPlayers] = useState<any[]>([]);

  // const { startedAtSec, accumulatedSec } = useAppStore((s) => s.clock);
  // const elapsedSec = useMemo(
  //   () => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec),
  //   [isRunning, startedAtSec, accumulatedSec, tick],
  // );

  // const subElapsedSec = useMemo(
  //   () => getTotalElapsedSec(isRunning, subStartedAtSec, subAccumulatedSec),
  //   [isRunning, subStartedAtSec, subAccumulatedSec, tick],
  // );
  // const subFormattedTime = formatClock(Math.floor(subElapsedSec));
  // const intervalSec = rotationIntervalMinutes * 60;
  // const showRotation = isRunning && elapsedSec > intervalSec;
  const showRotation = false;

  useEffect(() => {
    const onField = roster.filter((p) => p.isOnField);

    // const currentFormationLayout = formationLayouts[formation];

    // const positionOrder = Object.entries(currentFormationLayout)
    //   .sort(([, a], [, b]) => a.order - b.order)
    //   .map(([positionId]) => positionId.toUpperCase());

    const sortedOnField = [...onField].sort((a, b) => {
      // const slotA = tactics.find((t) => t.playerId === a.id);
      // const slotB = tactics.find((t) => t.playerId === b.id);

      // const positionA = slotA ? slotA.id.toUpperCase() : "N/A";
      // const positionB = slotB ? slotB.id.toUpperCase() : "N/A";

      // const indexA = positionOrder.indexOf(positionA);
      // const indexB = positionOrder.indexOf(positionB);

      // if (indexA !== -1 && indexB !== -1) {
      //   return indexA - indexB;
      // } else if (indexA !== -1) {
      //   return -1;
      // } else if (indexB !== -1) {
      //   return 1;
      // } else {
      return a.name.localeCompare(b.name);
      // }
    });

    setOnFieldPlayers(sortedOnField);
  }, [roster, tick, tactics, formation]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        width: "90%",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mt: 2, textAlign: "center", fontWeight: "bold" }}
      >
        Scoreboard
      </Typography>
      <Box // ClockPanel itself already has some styling, so just container here
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        <ClockPanel />
      </Box>
      <Divider sx={{ width: "100%", maxWidth: 600 }} /> {/* Added Divider */}
      {/* Subs Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
        >
          Substitutions
        </Typography>
        {showRotation && (
          // Enhanced "Rotate Players Now!" message
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "warning.dark",
              p: 1,
              borderRadius: 1,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <WarningIcon color="warning" />
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              Rotate Players Now!
            </Typography>
          </Box>
        )}

        {/* <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
          <Typography variant="body2">Sub Clock: {subFormattedTime}</Typography>
          {isRunning && (
            <IconButton color="secondary" size="small" onClick={resetSubClock}>
              <RestartAltIcon />
            </IconButton>
          )}
        </Box> */}

        {substitutionQueue.length > 0 &&
          substitutionQueue.map((sub, index) => {
            const benchPlayer = roster.find((p) => p.id === sub.inId);
            const onFieldPlayer = roster.find((p) => p.id === sub.outId);
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                  p: 2,
                  bgcolor: "background.paper", // Keep individual sub item background
                  mb: 1, // Margin for each sub item
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <PersonAddAlt1Icon color="success" fontSize="small" />
                  <Typography variant="body2" component="span">
                    {benchPlayer?.number && (
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ fontWeight: "bold", mr: 0.5 }}
                      >
                        #{benchPlayer.number}
                      </Typography>
                    )}
                    {benchPlayer?.name}
                  </Typography>

                  <ArrowRightAltIcon
                    sx={{ mx: 0.5 }}
                    color="action"
                    fontSize="small"
                  />

                  <PersonRemoveAlt1Icon color="error" fontSize="small" />
                  <Typography variant="body2" component="span">
                    {onFieldPlayer?.number && (
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ fontWeight: "bold", mr: 0.5 }}
                      >
                        #{onFieldPlayer.number}
                      </Typography>
                    )}
                    {onFieldPlayer?.name}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => cancelSub(sub)}>
                  Cancel
                </Button>
              </Box>
            );
          })}
        <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}>
          {substitutionQueue.length > 0 && (
            <Button
              variant="outlined" // Changed variant to outlined for less prominence
              color="primary"
              size="medium" // IconButton size="small" makes it small. Button's default size is 'medium', or you can use "small" if preferred.
              onClick={performSubs}
              startIcon={<SwapHorizIcon />} // Using startIcon for proper spacing
            >
              Substitute Players
            </Button>
          )}
        </Box>
      </Box>{" "}
      {/* End of Subs Section */}
      <Divider sx={{ width: "100%", maxWidth: 600 }} /> {/* Added Divider */}
      {/* On Field Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
        >
          On Field
        </Typography>
        <Box width={"100%"}>
          {onFieldPlayers.map((p) => {
            const slot = tactics.find((t) => t.playerId === p.id);
            const position = slot ? slot.id.toUpperCase() : "N/A";
            const isGoalie = position === "GK";

            return (
              <Box
                key={p.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                  p: 2,
                  bgcolor: "background.paper",
                  mb: 1,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    {p.number ? `#${p.number} ` : ""}
                    {p.name}
                  </Typography>
                  <Stack direction="column" alignItems="flex-end">
                    <Typography variant="caption" sx={{ fontSize: "0.875rem" }}>
                      {getFormattedLiveMinutes(p.id)}
                    </Typography>
                    <Typography variant="caption">{position}</Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  {/* Conditional rendering for Goalies vs. Field Players */}
                  {isGoalie ? (
                    <ButtonGroup
                      variant="outlined"
                      size="small"
                      aria-label="goalie stats buttons"
                    >
                      <Button onClick={() => decrementSave(p.id)}>
                        <RemoveIcon fontSize="small" />
                      </Button>
                      <Button disableRipple>
                        <Typography color="text.primary" variant="body2">
                          Saves ({p.saves})
                        </Typography>
                      </Button>
                      <Button onClick={() => recordSave(p.id)}>
                        <AddIcon fontSize="small" />
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      {" "}
                      <ButtonGroup
                        variant="outlined"
                        size="small"
                        aria-label="pass stats buttons"
                      >
                        <Button onClick={() => decrementPass(p.id)}>
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button disableRipple>
                          <Typography color="text.primary" variant="body2">
                            Pass ({p.passes})
                          </Typography>
                        </Button>
                        <Button onClick={() => recordPass(p.id)}>
                          <AddIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>
                      <ButtonGroup
                        variant="outlined"
                        size="small"
                        aria-label="shot stats buttons"
                      >
                        <Button onClick={() => decrementShot(p.id)}>
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button disableRipple>
                          <Typography color="text.primary" variant="body2">
                            Shot ({p.shots})
                          </Typography>
                        </Button>
                        <Button onClick={() => recordShot(p.id)}>
                          <AddIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>
                    </Stack>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Divider sx={{ width: "100%", maxWidth: 600 }} /> {/* Added Divider */}
      <Bench
        selectedSlotId={selectedSlotId}
        setSelectedSlotId={setSelectedSlotId}
        onBenchClick={handleBenchClick}
      />
      <SubSheet
        open={sheetOpen}
        benchPlayerId={benchId}
        onClose={() => setSheetOpen(false)}
      />
    </Box>
  );
}
