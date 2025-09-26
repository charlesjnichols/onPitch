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
        setSortedBenchPlayers([...bench].sort((a, b) => a.name.localeCompare(b.name)));
    }, [roster]);

    const benchPlayers = useMemo(() => sortedBenchPlayers, [sortedBenchPlayers]);

    const preferredBenchPlayers = useMemo(() => {
        if (!selectedSlotId) return benchPlayers;
        return benchPlayers.filter((p: Player) => playerEligibleForSlot(p, selectedSlotId));
    }, [benchPlayers, selectedSlotId]);

   const otherBenchPlayers = useMemo(() => {
        if (!selectedSlotId) return benchPlayers;
        return benchPlayers.filter((p: Player) => !playerEligibleForSlot(p, selectedSlotId));
    }, [benchPlayers, selectedSlotId]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
            <Typography variant="subtitle1" sx={{ }}>Bench{selectedSlotId ? ` — Eligible for ${selectedSlotId.toUpperCase()}` : ''}</Typography>
            {selectedSlotId && preferredBenchPlayers.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Preferred</Typography>
                    <Box sx={{ display: 'grid', gap: 1, flexDirection: 'column', width: '100%', maxWidth: 600 }}>
                        {preferredBenchPlayers.map((p: Player) => (
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
                                    // Pass new stat props
                                    shots={p.shots}
                                    passes={p.passes}
                                    saves={p.saves}
                                />
                            </Box>
                        ))}
                    </Box>
                </>
            )}
            {selectedSlotId && preferredBenchPlayers.length === 0 && (
                <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 2 }}>No Preferred Players</Typography>
            )}

            {otherBenchPlayers.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>All Players</Typography>
                    <Box sx={{ display: 'grid', gap: 1, flexDirection: 'column', width: '100%', maxWidth: 600 }}>
                        {otherBenchPlayers.map((p: Player) => (
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
                                    // Pass new stat props
                                    shots={p.shots}
                                    passes={p.passes}
                                    saves={p.saves}
                                />
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}