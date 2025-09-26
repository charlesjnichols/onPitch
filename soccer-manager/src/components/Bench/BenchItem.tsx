import { Card, CardContent, Typography, Stack, useTheme } from "@mui/material"; // Import useTheme
import { useAppStore } from "../../store";

interface BenchItemProps {
  id: string;
  name: string;
  number?: number;
  positionTags: string[];
  // Add new stat props
  shots: number;
  passes: number;
  saves: number;
}

function BenchItem({
  id,
  name,
  number,
  positionTags,
  shots,
  passes,
  saves,
}: BenchItemProps) {
  const formattedMinutes = useAppStore((state) =>
    state.getFormattedLiveMinutes(id),
  );
  const theme = useTheme(); // Get the current theme
  const isGoalie = positionTags.includes("GK"); // Determine if the player is a goalie

  return (
    <Card
      sx={{
        borderRadius: "4px",
        border: `1px solid ${theme.palette.mode === "dark" ? "#555" : "#ccc"}`, // Dynamic border color
        backgroundColor:
          theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.6)" : "#fff", // Dynamic background color
        touchAction: "manipulation",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: theme.palette.text.primary, // Set text color
      }}
      aria-label={`Bench ${number ? `#${number} ` : ""}${name}`}
    >
      <CardContent
        sx={{
          p: 1.5,
          textAlign: "left",
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Stack direction="column">
          <Typography variant="subtitle1" sx={{ textAlign: "left" }}>
            {number ? `#${number} ` : ""}
            {name}
          </Typography>
          <Typography variant="caption">{positionTags.join(", ")}</Typography>
        </Stack>
      </CardContent>
      <CardContent
        sx={{
          p: 1.5,
          textAlign: "right",
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0.5,
        }}
      >
        <Stack direction="column" alignItems="flex-end">
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            {formattedMinutes} min
          </Typography>
        </Stack>
        {/* Display stats conditionally */}
        {isGoalie && (
          <Typography variant="caption" color="text.secondary">
            Saves: {saves}
          </Typography>
        )}
        <Stack direction="column" alignItems="flex-end" spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Passes: {passes}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Shots: {shots}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default BenchItem;
