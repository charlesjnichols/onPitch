import { Box, Typography, useTheme } from "@mui/material";
import { useAppStore } from "../../store";
import { formatClock } from "../../utils/time";
import { styled } from "@mui/system";
import type { FormationId } from "../../store";

interface PitchProps {
  selectedSlotId: string | undefined;
  setSelectedSlotId: (slotId: string | undefined) => void;
}

interface PitchContainerProps extends React.ComponentProps<typeof Box> {
  formation: FormationId;
}

// Styled Box component for the Pitch container
const PitchContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "formation",
})<PitchContainerProps>(({ theme, formation }) => {
  let gridTemplateAreas;

  switch (formation) {
    case "4-3-3":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". lb . lcb . . rcb . rb .",
        ". . . . . . . . . .",
        ". . lcm . cm cm . rcm . .",
        ". . . . . . . . . .",
        ". . lw . st st . rw . .",
        ". . . . . . . . . .",
      ];
      break;
    case "4-4-2":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". lb . lcb . . rcb . rb .",
        ". . . . . . . . . .",
        ". lw . cm1 . . cm2 . rw .",
        ". . . . . . . . . .",
        ". . . st1 .  . st2 . . .",

        ". . . . . . . . . .",
      ];
      break;
    case "3-5-2":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". . lb . cb cb . rb . .",
        ". . . . cdm cdm . . . .",
        ". . . . . . . . . .",
        ". lw . cm1 . . cm2 . rw .",
        ". . . . . . . . . .",
        ". . st1 . . . . st2 . .",
        ". . . . . . . . . .",
      ];
      break;
    case "4-4-2 (Diamond)":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". lb . lcb . . rcb . rb .",
        ". . . . cdm cdm . . . .",
        ". . lw . . . . rw . .",
        ". . . . cam cam . . . .",
        ". . . . . . . . . .",
        ". . . st1 . . st2 . . .",
        ". . . . . . . . . .",
      ];
      break;
    case "4-3-1 (9)":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". lb . lcb . . rcb . rb .",
        ". . . . cdm cdm . . . .",
        ". . lw . . . . rw . .",
        ". . . . . . . . . .",
        ". . . . st1 st1 . . . .",
      ];
      break;
    case "3-2-3 (9)":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". lb . . cb cb . . rb .",
        ". . . . . . . . . .",
        ". . . cm1 . . cm2 . . .",
        ". . . . . . . . . .",
        ". . lw . st1 st1 . rw . .",
      ];
      break;
    case "3-1-3-1 (9)":
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". . lb . cb cb . rb . .",
        ". . . . cdm cdm . . . .",
        ". . . . . . . . . .",
        ". . lw . cm cm . rw . .",
        ". . . . . . . . . .",
        ". . . . st1 st1 . . . .",
        ". . . . . . . . . .",
      ];
      break;
    default:
      gridTemplateAreas = [
        ". . . . . . . . . .",
        "gk gk gk gk gk gk gk gk gk gk",
        ". . lcb lcb . . rcb rcb . .",
        "lb lb lcb lcb . . rcb rcb rb rb",
        "lcm lcm . . cm cm . . rcm rcm",
        "lcm lcm . . cm cm . . rcm rcm",
        ". . . . . . . . . .",
        ". lw lw . st st . rw rw .",
        ". lw lw . st st . rw rw .",
        ". . . . . . . . . .",
      ];
  }

  return {
    borderRadius: "12px",
    border: `1px solid ${theme.palette.mode === "dark" ? "#444" : "#ccc"}`,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(to bottom, rgba(10, 27, 17, 0.6), rgba(50, 50, 50, 0.6))"
        : "linear-gradient(to bottom, rgba(180, 200, 180, 0.6), rgba(220, 230, 220, 0.6))",
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    aspectRatio: "3 / 3",
    height: "calc(100%)",
    display: "grid",
    gridTemplateRows: "repeat(10, 1fr)",
    gridTemplateColumns: "repeat(10, 1fr)",
    gridGap: "4px",
    gridTemplateAreas: gridTemplateAreas.map((row) => `"${row}"`).join("\n"),
  };
});

const PitchInner = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 12,
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}`,
  borderRadius: "8px",
}));

const PitchCenterLine = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: "50%",
  height: "1px",
  width: "calc(100%)",
  bgcolor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.6)"
      : "rgba(0, 0, 0, 0.6)",
}));

const PitchGoalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "calc(50% - 80px)",
  height: "50px",
  width: "160px",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}`,
}));

const PitchSmallBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "calc(50% - 30px)",
  height: "20px",
  width: "60px",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}`,
}));

export default function Pitch({
  selectedSlotId,
  setSelectedSlotId,
}: PitchProps) {
  const tactics = useAppStore((s) => s.tactics);
  const roster = useAppStore((s) => s.roster);
  const getLiveMinutesSec = useAppStore((s) => s.getLiveMinutesSec);
  const theme = useTheme();
  const formation = useAppStore((s) => s.formation);

  return (
    <PitchContainer formation={formation} sx={{}}>
      <PitchInner>
        <PitchCenterLine />
        <PitchGoalBox sx={{ top: 0 }} />
        <PitchSmallBox sx={{ top: 0 }} />
        <PitchGoalBox sx={{ bottom: 0 }} />
        <PitchSmallBox sx={{ bottom: 0 }} />
      </PitchInner>
      {tactics &&
        tactics.map((slot) => {
          const player = roster.find((p) => p.id === slot.playerId);
          const aria = player
            ? `${slot.id.toUpperCase()} — ${formatClock(
                getLiveMinutesSec(player.id),
              )} played`
            : `${slot.id.toUpperCase()} — empty`;
          const isSelected = selectedSlotId === slot.id;
          return (
            <Box // Use a regular Box component
              key={slot.id}
              sx={{
                gridArea: slot.gridArea, // Apply grid area here
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible", // Add overflow: visible
                position: "relative", // Add position: relative
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-label={aria}
                data-type="slot"
                data-id={slot.id}
                data-label={slot.id.toUpperCase()}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  touchAction: "none",
                  outline: "none",
                  "&:focus": {
                    outline: `2px solid ${
                      isSelected
                        ? "rgba(255, 0, 0, 0.5)"
                        : "rgba(76, 175, 80, 0.7)"
                    }`,
                    outlineOffset: "2px",
                  },
                  borderRadius: "50%",
                  ...(isSelected
                    ? { boxShadow: "0 0 0 2px rgba(255, 0, 0, 0.5)" }
                    : {}),
                }}
                onClick={() => {
                  if (isSelected) {
                    setSelectedSlotId(undefined);
                  } else if (selectedSlotId) {
                    const selectedSlot = tactics.find(
                      (s) => s.id === selectedSlotId,
                    );

                    if (selectedSlot?.playerId && slot.playerId) {
                      useAppStore.setState((state) => ({
                        tactics: state.tactics.map((t) =>
                          t.id === slot.id
                            ? { ...t, playerId: selectedSlot.playerId }
                            : t.id === selectedSlot.id
                              ? { ...t, playerId: slot.playerId }
                              : t,
                        ),
                      }));
                      setSelectedSlotId(undefined);
                    } else if (selectedSlot?.playerId && !slot.playerId) {
                      useAppStore.setState((state) => ({
                        tactics: state.tactics.map((t) =>
                          t.id === slot.id
                            ? { ...t, playerId: selectedSlot.playerId }
                            : t.id === selectedSlot.id
                              ? { ...t, playerId: undefined }
                              : t,
                        ),
                      }));
                      setSelectedSlotId(undefined);
                    } else {
                      setSelectedSlotId(slot.id);
                    }
                  } else {
                    setSelectedSlotId(slot.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    setSelectedSlotId(isSelected ? undefined : slot.id);
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: "1px solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    backgroundColor: player
                      ? "rgba(76, 175, 80, 0.8)"
                      : "rgba(50, 50, 50, 0.8)",
                    borderColor: player
                      ? "rgba(76, 175, 80, 0.6)"
                      : "rgba(80, 80, 80, 0.7)",
                    color: "white",
                  }}
                >
                  {slot.id.toUpperCase()}
                </Box>

                {player && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      bottom: "0px",
                      mb: 1,
                      whiteSpace: "nowrap",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(0, 0, 0, 0.7)"
                          : "rgba(255, 255, 255, 0.7)",
                      padding: "2px 4px",
                      borderRadius: "4px",
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.text.primary
                          : theme.palette.text.primary,
                      zIndex: 2, // Add z-index: 2
                    }}
                  >
                    {player.number ? `#${player.number}` : ""}&nbsp;
                    {player.name}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
    </PitchContainer>
  );
}
