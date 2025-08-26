import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store'
import { formatClock, getTotalElapsedSec } from '../../utils/time'
import { Box, Typography, Button } from '@mui/material';

export default function ClockPanel() {
  const { isRunning, startedAtSec, accumulatedSec } = useAppStore(s => s.clock)
  const startClock = useAppStore(s => s.startClock)
  const pauseClock = useAppStore(s => s.pauseClock)
  const resetClock = useAppStore(s => s.resetClock)
  const rotationIntervalMinutes = useAppStore(s => s.config.rotationIntervalMinutes)

  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [isRunning])

  const elapsedSec = useMemo(() => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec), [isRunning, startedAtSec, accumulatedSec, tick])
  const formattedTime = formatClock(Math.floor(elapsedSec));


  const intervalSec = rotationIntervalMinutes * 60
  
    const showRotation = isRunning && elapsedSec > intervalSec && (elapsedSec % intervalSec) < 1.5

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, alignItems: 'center' }}>
      
      <Typography variant="h4">{formattedTime}</Typography>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {!isRunning ? (
          <Button variant="contained" color="success" onClick={startClock}>Start</Button>
        ) : (
          <Button variant="contained" color="primary" onClick={pauseClock}>Pause</Button>
        )}
        <Button variant="contained" color="inherit" onClick={resetClock}>Reset</Button>
      </Box>
      
      {showRotation && (
        <Box sx={{ bgcolor: 'amber.900', color: 'amber.300', border: '1px solid amber.600', borderRadius: 1, px: 2, py: 1, fontSize: '0.875rem', textAlign: 'center' }}>
          Rotation time! Suggest swapping fresh legs.  {elapsedSec}
        </Box>
      )}
      <Typography variant="caption" color="text.secondary">Rotation every {rotationIntervalMinutes} min</Typography>
    </Box>
  )
}