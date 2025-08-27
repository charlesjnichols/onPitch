import { useState } from 'react';
import { Box, Button, TextField, styled, useTheme } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
  '& .MuiInputBase-root': {
    color: theme.palette.text.primary,
  },
}));

interface RosterInputProps {
  onAddPlayer: (name: string) => void;
}

function RosterInput({ onAddPlayer }: RosterInputProps) {
  const [name, setName] = useState('');
  const theme = useTheme();

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
        InputProps={{
          style: {
            color: theme.palette.text.primary,
          },
        }}
      />
      <Button variant="contained" color="primary" onClick={handleAddPlayer}>
        Add
      </Button>
    </Box>
  );
}

export default RosterInput;