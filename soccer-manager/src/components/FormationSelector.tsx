import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useAppStore, FORMATION_LAYOUTS, type FormationId } from '../store';
import type { SelectChangeEvent } from '@mui/material'; // Import SelectChangeEvent

export default function FormationSelector() {
  const formation = useAppStore(s => s.formation);
  const setFormation = useAppStore(s => s.setFormation);

  const handleFormationChange = (e: SelectChangeEvent<FormationId>) => {
    setFormation(e.target.value as FormationId);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'neutral.300', fontSize: '0.875rem' }}>Formation</Typography>
      <Select
        value={formation}
        onChange={handleFormationChange}
        sx={{
          backgroundColor: 'rgba(var(--color-surface-200-rgb), 0.6)',
          borderRadius: '4px',
          px: 2,
          py: 1,
          fontSize: '0.875rem',
          color: 'white'
        }}
      >
        {Object.keys(FORMATION_LAYOUTS).map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </Box>
  );
}