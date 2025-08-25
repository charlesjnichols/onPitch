import { Box, Typography } from '@mui/material';
import { useAppStore } from '../store';
import { formatClock } from '../utils/time';

interface PitchProps {
  selectedSlotId: string | undefined;
  setSelectedSlotId: (slotId: string | undefined) => void;
}

export default function Pitch({ selectedSlotId, setSelectedSlotId }: PitchProps) {
  const tactics = useAppStore(s => s.tactics);
  const roster = useAppStore(s => s.roster);
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid #444',
        background: 'linear-gradient(to bottom, rgba(10, 27, 17, 0.6), rgba(50, 50, 50, 0.6))',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        aspectRatio: '3 / 2',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 12, border: '1px solid rgba(10, 70, 40, 0.6)', borderRadius: '8px' }} />
      {tactics && tactics.map(slot => {
        const player = roster.find(p => p.id === slot.playerId);
        const aria = player ? `${slot.id.toUpperCase()} — ${formatClock(getLiveMinutesMs(player.id))} played` : `${slot.id.toUpperCase()} — empty`;
        const isSelected = selectedSlotId === slot.id;
        return (
          <Box key={slot.id} sx={{ position: 'absolute', left: `${slot.y * 100}%`, top: `${(1 - slot.x) * 100}%` }}>
            {/* Position button - always shown */}
            <Box
              role="button"
              tabIndex={0}
              aria-label={aria}
              data-type="slot"
              data-id={slot.id}
              data-label={slot.id.toUpperCase()}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
                cursor: 'pointer',
                touchAction: 'none',
                outline: 'none',
                '&:focus': {
                  outline: `2px solid ${isSelected ? 'rgba(76, 175, 80, 0.8)' : 'rgba(76, 175, 80, 0.7)'}`,
                  outlineOffset: '2px'
                },
                borderRadius: '50%',
                ...(isSelected ? { boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.5)' } : {}),
              }}
              onClick={() => setSelectedSlotId(isSelected ? undefined : slot.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedSlotId(isSelected ? undefined : slot.id) }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '1px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  backgroundColor: player ? 'rgba(76, 175, 80, 0.3)' : 'rgba(50, 50, 50, 0.8)',
                  borderColor: player ? 'rgba(76, 175, 80, 0.6)' : 'rgba(80, 80, 80, 0.7)',
                  color: 'white'
                }}
              >
                {slot.id.toUpperCase()}
              </Box>
            </Box>

            {/* Player information - displayed when a player is assigned */}
            {player && (
              <Typography variant="caption" sx={{ position: 'absolute', left: '50%', top: '-100%', transform: 'translateX(-50%) translateY(150%)', mb: 1, whitespace: 'nowrap' }}>
                {player.number ? `#${player.number}` : ''}&nbsp;{player.name}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}