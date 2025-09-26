import { Box, Select, MenuItem, Typography, useTheme } from "@mui/material";
import { useAppStore, FORMATION_LAYOUTS, type FormationId } from "../../store";
import type { SelectChangeEvent } from "@mui/material";

export default function FormationSelector() {
  const formation = useAppStore((s) => s.formation);
  const setFormation = useAppStore((s) => s.setFormation);
  const theme = useTheme(); // Get the current theme

  const handleFormationChange = (e: SelectChangeEvent<FormationId>) => {
    setFormation(e.target.value as FormationId);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        Formation
      </Typography>
      <Select
        value={formation}
        onChange={handleFormationChange}
        sx={{
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(var(--color-surface-200-rgb), 0.6)"
              : "rgba(0, 0, 0, 0.1)", // Use theme mode
        }}
      >
        {Object.keys(FORMATION_LAYOUTS).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
