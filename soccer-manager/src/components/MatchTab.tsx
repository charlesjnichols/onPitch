import { useEffect, useState, useMemo } from "react";
import ClockPanel from "./MatchPanel/ClockPanel";
import { useAppStore } from "../store";
import SubSheet from "./Subs/SubSheet";
import { Button, Box, Typography, Stack, ButtonGroup } from "@mui/material";
import Bench from "./Bench/Bench";
import { formationLayouts } from "../store";
import { getTotalElapsedSec } from "../utils/time";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function MatchTab() {
  const roster = useAppStore((s) => s.roster);
  const getFormattedLiveMinutes = useAppStore((s) => s.getFormattedLiveMinutes);
  const isRunning = useAppStore((s) => s.clock.isRunning); // Corrected to s.clock.isRunning
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

  const resetSubClock = useAppStore((s) => s.resetSubClock);
  const rotationIntervalMinutes = useAppStore(
    (s) => s.config.rotationIntervalMinutes,
  );

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

  const { startedAtSec, accumulatedSec } = useAppStore((s) => s.subClock);
  const elapsedSec = useMemo(
    () => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec),
    [isRunning, startedAtSec, accumulatedSec, tick],
  );

  const intervalSec = rotationIntervalMinutes * 60;
  const showRotation = isRunning && elapsedSec > intervalSec;

  useEffect(() => {
    const onField = roster.filter((p) => p.isOnField);

    const currentFormationLayout = formationLayouts[formation];

    const positionOrder = Object.entries(currentFormationLayout)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([positionId]) => positionId.toUpperCase());

    const sortedOnField = [...onField].sort((a, b) => {
      const slotA = tactics.find((t) => t.playerId === a.id);
      const slotB = tactics.find((t) => t.playerId === b.id);

      const positionA = slotA ? slotA.id.toUpperCase() : "N/A";
      const positionB = slotB ? slotB.id.toUpperCase() : "N/A";

      const indexA = positionOrder.indexOf(positionA);
      const indexB = positionOrder.indexOf(positionB);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      } else if (indexA !== -1) {
        return -1;
      } else if (indexB !== -1) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setOnFieldPlayers(sortedOnField);
  }, [roster, tick, tactics, formation]);

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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        <ClockPanel />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        {showRotation && (
          <Typography variant="subtitle1">Rotate Players Now!</Typography>
        )}

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
                  marginBottom: 5,
                  bgcolor: "background.paper",
                  mb: 1,
                }}
              >
                {/* Modified substitution display to use icons */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 0.5,
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
                {/* End of modified substitution display */}
                <Button size="small" onClick={() => cancelSub(sub)}>
                  Cancel
                </Button>
              </Box>
            );
          })}
        {substitutionQueue.length === 0 && ( // Changed `== 0` to `=== 0` for strict equality
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: 1,
              p: 2,
              bgcolor: "background.paper",
              mb: 1,
            }}
          >
            <Typography variant="body2">No Substitutions Queued</Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          {substitutionQueue.length > 0 && (
            <Button variant="contained" color="primary" onClick={performSubs}>
              Perform Substitutions
            </Button>
          )}
          {isRunning && (
            <Button
              variant="contained"
              color="secondary"
              onClick={resetSubClock}
            >
              Reset Sub Clock
            </Button>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        <Typography variant="subtitle1">On Pitch</Typography>
        <Box width={"100%"}>
          {onFieldPlayers.map((p) => {
            const slot = tactics.find((t) => t.playerId === p.id);
            const position = slot ? slot.id.toUpperCase() : "N/A";
            // Check if player's positionTags includes 'GK' for goalie determination
            const isGoalie = p.positionTags.includes("GK");

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
                      <Button onClick={() => recordSave(p.id)}>
                        Save ({p.saves})
                      </Button>
                      <Button onClick={() => recordSave(p.id)}>
                        <AddIcon fontSize="small" />
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      {" "}
                      {/* Use Stack to group Pass and Shot controls */}
                      <ButtonGroup
                        variant="outlined"
                        size="small"
                        aria-label="pass stats buttons"
                      >
                        <Button onClick={() => decrementPass(p.id)}>
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button onClick={() => recordPass(p.id)}>
                          Pass ({p.passes})
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
                        <Button onClick={() => recordShot(p.id)}>
                          Shot ({p.shots})
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
