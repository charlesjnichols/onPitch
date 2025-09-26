import { Box, TextField, Button, Typography } from '@mui/material';
import { useAppStore } from '../store';
import { useState } from 'react';

interface SettingsPanelProps {
    onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const config = useAppStore((s) => s.config);
  const setConfig = useAppStore((s) => s.setConfig);
  const [matchTimeMinutes, setMatchTimeMinutes] = useState<number>(config.matchTimeMinutes);
  const [rotationIntervalMinutes, setRotationIntervalMinutes] = useState<number>(config.rotationIntervalMinutes);
  const [maxOnField, setMaxOnField] = useState<number>(config.maxOnField);

  const handleSaveConfig = () => {
    setConfig({
      matchTimeMinutes,
      rotationIntervalMinutes,
      maxOnField,
    });
    onClose(); // Close the modal after saving
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
      <Typography variant="h6">Settings</Typography>
      <TextField
        label="Match Time (minutes)"
        type="number"
        size="small"
        value={matchTimeMinutes}
        onChange={(e) => setMatchTimeMinutes(Number(e.target.value))}
      />
      <TextField
        label="Rotation Interval (minutes)"
        type="number"
        size="small"
        value={rotationIntervalMinutes}
        onChange={(e) => setRotationIntervalMinutes(Number(e.target.value))}
      />
      <TextField
        label="Max Players on Field"
        type="number"
        size="small"
        value={maxOnField}
        onChange={(e) => setMaxOnField(Number(e.target.value))}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" color="primary" onClick={handleSaveConfig}>
            Save Settings
        </Button>
        <Button variant="outlined" onClick={onClose}>
            Cancel
        </Button>
      </Box>
    </Box>
  );
}