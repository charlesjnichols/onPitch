import { useState } from 'react';
import { Box, Button, TextField, styled } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
}));

interface RosterInputProps {
  onAddPlayer: (name: string) => void;
}

function RosterInput({ onAddPlayer }: RosterInputProps) {
  const [name, setName] = useState('');

  const handleAddPlayer = () => {
    if (!name.trim()) return;
    onAddPlayer(name.trim());
    setName('');
  };

  return (
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
  );
}

export default RosterInput;