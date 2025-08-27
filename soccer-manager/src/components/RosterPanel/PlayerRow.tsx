import React from 'react';
import { Box, MenuItem, Select, TextField, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAppStore } from '../../store';
import type { Player } from '../../types';
import { ALL_POSITIONS } from '../../utils/positions';

interface PlayerRowProps {
  player: Player;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player }) => {
  const updatePlayer = useAppStore(s => s.updatePlayer);
  const removePlayer = useAppStore(s => s.removePlayer);

  const handleChange = (event: any) => { // event: SelectChangeEvent<typeof player.positionTags>
    const { value } = event.target;
    updatePlayer(player.id, { positionTags: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and limit to a maximum of two digits
    const number = value.replace(/[^0-9]/g, '').slice(0, 2);
    updatePlayer(player.id, { number: Number(number) || undefined });
  };

  return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`, mb: 1 }}>
      <TextField
        sx={{ width: 50 }}
        placeholder="#"
        value={player.number ?? ''}
        onChange={handleNumberChange}
        inputProps={{ maxLength: 2 }} // Limit input to 2 characters (numbers)
      />
      <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'left' }}>{player.name}</Typography>
      <Select
        multiple
        value={player.positionTags}
        onChange={handleChange}
        sx={{ width: 120, minWidth: 120 }}
      >
        {ALL_POSITIONS.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </Select>
      <IconButton aria-label="delete player" onClick={() => removePlayer(player.id)}>
        <Delete />
      </IconButton>
    </Box>
  );
};

export default PlayerRow;