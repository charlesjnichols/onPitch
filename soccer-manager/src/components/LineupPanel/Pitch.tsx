import { Box, Typography } from "@mui/material";
import { useAppStore } from "../../store";
import { formatClock } from "../../utils/time";

interface PitchProps {
  selectedSlotId: string | undefined;
  setSelectedSlotId: (slotId: string | undefined) => void;
}

export default function Pitch({
  selectedSlotId,
  setSelectedSlotId,
}: PitchProps) {
  const tactics = useAppStore((s) => s.tactics);
  const roster = useAppStore((s) => s.roster);
  const getLiveMinutesSec = useAppStore((s) => s.getLiveMinutesSec);

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid #444",
        background:
          "linear-gradient(to bottom, rgba(10, 27, 17, 0.6), rgba(50, 50, 50, 0.6))",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        aspectRatio: "3 / 3",
        height: "calc(100%)", // Increased height
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 12,
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "8px",
        }}
      >
        {/* Center Line */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            height: "1px",
            width: "calc(100%)",
            bgcolor: "rgba(255, 255, 255, 0.6)",
          }}
        />

        {/* Goal Boxes - adjust dimensions as needed */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "calc(50% - 80px)", // Adjust for centering
            height: "50px", // Adjust height
            width: "160px", // Adjust width
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "calc(50% - 30px)", // Adjust for centering
            height: "20px", // Adjust height
            width: "60px", // Adjust width
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "calc(50% - 80px)", // Adjust for centering
            height: "50px", // Adjust height
            width: "160px", // Adjust width
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "calc(50% - 30px)", // Adjust for centering
            height: "20px", // Adjust height
            width: "60px", // Adjust width
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        />
      </Box>
      {tactics &&
        tactics.map((slot) => {
          const player = roster.find((p) => p.id === slot.playerId);
          const aria = player
            ? `${slot.id.toUpperCase()} — ${formatClock(
                getLiveMinutesSec(player.id)
              )} played`
            : `${slot.id.toUpperCase()} — empty`;
          const isSelected = selectedSlotId === slot.id;
          return (
            <Box
              key={slot.id}
              sx={{
                position: "absolute",
                left: `${slot.y * 100}%`,
                top: `${(1 - slot.x) * 100}%`,
                zIndex: 1, // Ensure player info is above position
              }}
            >
              {/* Position button - always shown */}
              <Box
                role="button"
                tabIndex={0}
                aria-label={aria}
                data-type="slot"
                data-id={slot.id}
                data-label={slot.id.toUpperCase()}
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translateX(-50%) translateY(-50%)",
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
                    // Find the selected slot
                    const selectedSlot = tactics.find((s) => s.id === selectedSlotId);

                    // If both slots have players, swap them
                    if (selectedSlot?.playerId && slot.playerId) {
                      // Swap player IDs in the tactics array (you'll need to update your store accordingly)
                      useAppStore.setState((state) => ({
                        tactics: state.tactics.map((t) =>
                          t.id === slot.id
                            ? { ...t, playerId: selectedSlot.playerId }
                            : t.id === selectedSlot.id
                              ? { ...t, playerId: slot.playerId }
                              : t
                        ),
                      }));
                      setSelectedSlotId(undefined); // Clear selection after swap
                    } else if (selectedSlot?.playerId && !slot.playerId) {
                      useAppStore.setState((state) => ({
                        tactics: state.tactics.map((t) => t.id === slot.id
                          ? { ...t, playerId: selectedSlot.playerId }
                          : t.id === selectedSlot.id
                            ? { ...t, playerId: undefined }
                            : t),
                      }));
                      setSelectedSlotId(undefined); // Clear selection after swap
                    } else {
                      setSelectedSlotId(slot.id); // Just select the new slot if no swap
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
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "1px solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    backgroundColor: player
                      ? "rgba(76, 175, 80, 0.8)" // Solid green if player assigned
                      : "rgba(50, 50, 50, 0.8)", // Solid gray if empty
                    borderColor: player
                      ? "rgba(76, 175, 80, 0.6)"
                      : "rgba(80, 80, 80, 0.7)",
                    color: "white",
                  }}
                >
                  {slot.id.toUpperCase()}
                </Box>
              </Box>

              {/* Player information - displayed when a player is assigned */}
              {player && (
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "-100%",
                    transform: "translateX(-50%) translateY(150%)",
                    mb: 1,
                    whitespace: "nowrap",
                    backgroundColor: "rgba(0, 0, 0, 0.7)", // Opaque background
                    padding: "2px 4px", // Add padding for readability
                    borderRadius: "4px", // Round the corners
                  }}
                >
                  {player.number ? `#${player.number}` : ""}&nbsp;{player.name}
                </Typography>
              )}
            </Box>
          );
        })}
    </Box>
  );
}