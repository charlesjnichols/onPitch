import React from 'react';
import { Box, Button, MenuItem, Select, TextField, styled, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useState } from 'react';
import { useAppStore } from '../store';
import type { Player } from '../types';
import { ALL_POSITIONS } from '../utils/positions';

const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
}));

function RosterPanel() {
  const roster = useAppStore(s => s.roster);
  const addPlayer = useAppStore(s => s.addPlayer);
  const [name, setName] = useState('');

  const handleAddPlayer = () => {
            if (!name.trim()) return;
            addPlayer({ name: name.trim(), positionTags: [], isOnField: false });
            setName('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%', maxWidth: 600 }}>
        <StyledTextField
          fullWidth
          placeholder="Add player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddPlayer}>
          Add
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {roster.length === 0 ? (
          <Box>No players yet. Add some to build your roster.</Box>
        ) : (
          roster.map((p) => (
            <PlayerRow key={p.id} player={p} />
          ))
        )}
      </Box>
      </Box>
  );
}

const PlayerRow: React.FC<{ player: Player }> = ({ player }) => {
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.12)', mb: 1 }}>
      <TextField
        sx={{ width: 50 }}
        placeholder="#"
        value={player.number ?? ''}
        onChange={handleNumberChange}
        inputProps={{ maxLength: 2 }} // Limit input to 2 characters (numbers)
      />
      <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center' }}>{player.name}</Typography>
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

export default RosterPanel;

