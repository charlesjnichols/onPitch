import { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '../../store';
import { playerEligibleForSlot } from '../../utils/positions';
import BenchItem from './BenchItem';
import type { Player } from '../../types';

interface BenchProps {
    selectedSlotId: string | undefined;
    setSelectedSlotId: (slotId: string | undefined) => void;
    onBenchClick: (benchId: string) => void;
}

export default function Bench({ selectedSlotId, onBenchClick }: BenchProps) {
    const roster = useAppStore(s => s.roster);

    const [sortedBenchPlayers, setSortedBenchPlayers] = useState<any>([]);

    useEffect(() => {
        const bench = roster.filter(p => !p.isOnField);
        setSortedBenchPlayers([...bench].sort((a, b) => (a.number || 0) - (b.number || 0)));
    }, [roster]);

    const benchPlayers = useMemo(() => sortedBenchPlayers, [sortedBenchPlayers]);

    const eligibleBenchForSelected = useMemo(() => {
        if (!selectedSlotId) return benchPlayers;
        return benchPlayers.filter((p: Player) => playerEligibleForSlot(p, selectedSlotId));
    }, [benchPlayers, selectedSlotId]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontSize: '0.875rem' }}>Bench{selectedSlotId ? ` — Eligible for ${selectedSlotId.toUpperCase()}` : ''}</Typography>
            <Box sx={{ display: 'grid', gap: 2, flexDirection: 'column', width: '100%', maxWidth: 600 }}>
                {eligibleBenchForSelected.length === 0 && <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>No bench players</Typography>}
                {eligibleBenchForSelected.map((p: Player) => (
                    <Box
                        key={p.id}
                        data-type="bench"
                        data-id={p.id}
                        data-label={p.number ? `#${p.number}` : p.name}
                        aria-label={`Bench — ${p.name}`}
                        sx={{ '&>*': { pointerEvents: 'none' } }}
                        onClick={() => {
                            onBenchClick(p.id)
                        }}
                    >
                        <BenchItem
                            id={p.id}
                            name={p.name}
                            number={p.number}
                            positionTags={p.positionTags}
                        />
                    </Box>
                ))}
            </Box>
            {selectedSlotId && (
                <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Tap a bench player to assign to {selectedSlotId.toUpperCase()}.</Typography>
                </Box>
            )}
        </Box>
    );
}