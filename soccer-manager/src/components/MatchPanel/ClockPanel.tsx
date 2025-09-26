import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store';
import { formatClock, getTotalElapsedSec } from '../../utils/time';
import { Box, Typography, Button } from '@mui/material';

export default function ClockPanel() {
  const { isRunning, startedAtSec, accumulatedSec } = useAppStore(s => s.clock);
  const { startedAtSec: subStartedAtSec, accumulatedSec: subAccumulatedSec } = useAppStore(s => s.subClock);
  const startClock = useAppStore(s => s.startClock);
  const pauseClock = useAppStore(s => s.pauseClock);
  const resetClock = useAppStore(s => s.resetClock);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
  }, [isRunning]);

  const elapsedSec = useMemo(() => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec), [isRunning, startedAtSec, accumulatedSec, tick]);
  const subElapsedSec = useMemo(() => getTotalElapsedSec(isRunning, subStartedAtSec, subAccumulatedSec), [isRunning, subStartedAtSec, subAccumulatedSec, tick]);
  const formattedTime = formatClock(Math.floor(elapsedSec));
  const subFormattedTime = formatClock(Math.floor(subElapsedSec));

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, alignItems: 'center' }}>
      <Typography variant="h4">{formattedTime}</Typography>
      <Typography>Sub Clock: {subFormattedTime}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
            {!isRunning ? (
                    <Button variant="contained" color="success" onClick={startClock}>Start</Button>
                ) : (
                    <Button variant="contained" color="primary" onClick={pauseClock}>Pause</Button>
            )}
                <Button variant="contained" color="inherit" onClick={resetClock}>Reset</Button>
            </Box>
    </Box>
    );
}

