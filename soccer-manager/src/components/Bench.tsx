import { useMemo } from 'react';
import { Box, Card, CardContent, Select, MenuItem, Typography } from '@mui/material';
import { useAppStore } from '../store';
import { playerEligibleForSlot, getEligibleTagsForSlot } from '../utils/positions';

interface BenchProps {
  selectedSlotId: string | undefined;
  setSelectedSlotId: (slotId: string | undefined) => void;
  onLongPressBench: (benchId: string) => void;
}

function BenchItem({ id, name, number, onLongPress }: { id: string, name: string, number?: number, onLongPress: (benchId: string) => void }) {
  return (
    <Card
      sx={{
        borderRadius: '4px',
        border: '1px solid #555', // Replace with static color
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        touchAction: 'manipulation',
        cursor: 'pointer',
      }}
      aria-label={`Bench ${number ? `#${number} ` : ''}${name}`}
    >
      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1, textAlign: 'center' }}>{number ? `#${number} ` : ''}{name}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Bench({ selectedSlotId, setSelectedSlotId, onLongPressBench }: BenchProps) {
  const roster = useAppStore(s => s.roster);
  const assignPlayerToSlot = useAppStore(s => s.assignPlayerToSlot);
  const makeSub = useAppStore(s => s.makeSub);
  const tactics = useAppStore(s => s.tactics);
  const benchPlayers = useMemo(() => roster.filter(p => !p.isOnField), [roster]);

  const eligibleBenchForSelected = useMemo(() => {
    if (!selectedSlotId) return benchPlayers;
    return benchPlayers.filter(p => playerEligibleForSlot(p, selectedSlotId));
  }, [benchPlayers, selectedSlotId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#616161', fontSize: '0.875rem' }}>Bench{selectedSlotId ? ` — Eligible for ${selectedSlotId.toUpperCase()}` : ''}</Typography>
      <Box sx={{ display: 'grid', gap: 2, flexDirection: 'column', width: '100%', maxWidth: 600 }}>
        {eligibleBenchForSelected.length === 0 && <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.75rem' }}>No bench players</Typography>}
        {eligibleBenchForSelected.map(p => (
          <Box
            key={p.id}
            data-type="bench"
            data-id={p.id}
            data-label={p.number ? `#${p.number}` : p.name}
            aria-label={`Bench — ${p.name}`}
            sx={{ '&>*': { pointerEvents: 'none' } }}
            onClick={() => {
              if (!selectedSlotId) return;
              const prevPlayerId = tactics.find(t => t.id === selectedSlotId)?.playerId;
              assignPlayerToSlot(selectedSlotId, p.id);
              if (prevPlayerId && prevPlayerId !== p.id) {
                makeSub(p.id, prevPlayerId);
              } else {
                makeSub(p.id, undefined);
              }
              setSelectedSlotId(undefined);
            }}
          >
            <BenchItem id={p.id} name={p.name} number={p.number} onLongPress={() => onLongPressBench(p.id)} />
          </Box>
        ))}
      </Box>
      {selectedSlotId && (
        <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.75rem' }}>Tap a bench player to assign to {selectedSlotId.toUpperCase()}.</Typography>
        </Box>
      )}
    </Box>
  );
}