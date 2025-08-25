import { useEffect, useState, useMemo } from 'react';
import ClockPanel from './ClockPanel';
import { useAppStore } from '../store';
import { formatClock } from '../utils/time';
import SubSheet from './SubSheet';
import { Box, Typography, Button, IconButton } from '@mui/material';

export default function MatchTab() {
  const roster = useAppStore(s => s.roster);
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs);
  const isRunning = useAppStore(s => s.clock.isRunning);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [benchId, setBenchId] = useState<string | undefined>(undefined);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, [isRunning]);

  const stats = useMemo(() => {
    const msList = roster.map(p => getLiveMinutesMs(p.id));
    const avg = msList.length ? msList.reduce((a, b) => a + b, 0) / msList.length : 0;
    const withMs = roster.map(p => ({ ...p, ms: getLiveMinutesMs(p.id) }));
    const onField = withMs.filter(p => p.isOnField).sort((a, b) => b.ms - a.ms);
    const bench = withMs.filter(p => !p.isOnField).sort((a, b) => a.ms - b.ms);
    return { avg, onField, bench };
  }, [roster, getLiveMinutesMs, tick]);

  const openSheet = (id: string) => { setBenchId(id); setSheetOpen(true) };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '90%', maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
        <ClockPanel />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
        <Typography variant="subtitle1">On Field</Typography>
        <Box width={'100%'}>
          {stats.onField.map(p => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, bgcolor: 'background.paper', mb: 1 }}>
              <Typography variant="body2">{p.number ? `#${p.number} ` : ''}{p.name}</Typography>
              <Typography variant="caption" sx={{ color: p.ms < stats.avg ? '#ffc107' : '#757575', fontSize: '0.875rem' }}>{formatClock(p.ms)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
        <Typography variant="subtitle1">Bench</Typography>
        <Box width={'100%'}>
          {stats.bench.map(p => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, bgcolor: 'background.paper', mb: 1 }} onClick={() => openSheet(p.id)}>
              <Typography variant="body2">{p.number ? `#${p.number} ` : ''} {p.name}</Typography>
              <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.875rem' }}>{formatClock(p.ms)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <SubSheet open={sheetOpen} benchPlayerId={benchId} onClose={() => setSheetOpen(false)} />
    </Box>
  );
}