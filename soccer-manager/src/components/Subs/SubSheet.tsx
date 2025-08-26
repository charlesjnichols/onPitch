import { useMemo } from 'react';
import BottomSheet from '../MatchPanel/BottomSheet';
import { useAppStore } from '../../store';
import { SLOT_ELIGIBLE_TAGS } from '../../utils/positions';
import { Box, Typography } from '@mui/material';
import BenchItem from '../Bench/BenchItem';

interface SubSheetProps {
    open: boolean;
    benchPlayerId?: string;
    onClose: () => void;
}

export default function SubSheet({ open, benchPlayerId, onClose }: SubSheetProps) {
    const roster = useAppStore(s => s.roster);
    const tactics = useAppStore(s => s.tactics);
    const getLiveMinutesSec = useAppStore(s => s.getLiveMinutesSec);
    const makeSub = useAppStore(s => s.makeSub);

    const candidates = useMemo(() => {
        if (!benchPlayerId) return [];

        const bench = roster.find(p => p.id === benchPlayerId);
        if (!bench) return [];

        const onFieldIds = new Set(roster.filter(p => p.isOnField).map(p => p.id));
        const playerIdToSlotId = new Map<string, string>();

        for (const t of tactics) {
            if (t.playerId) {
                playerIdToSlotId.set(t.playerId, t.id);
            }
        }

        const eligibleSlotIds = new Set<string>();
        for (const [slotId, tags] of Object.entries(SLOT_ELIGIBLE_TAGS)) {
            if (bench.positionTags.some(tag => tags.includes(tag))) {
                eligibleSlotIds.add(slotId);
            }
        }

        const onField = roster.filter(p => onFieldIds.has(p.id));
        const filtered = onField.filter(p => {
            const slotId = playerIdToSlotId.get(p.id);
            return slotId ? eligibleSlotIds.has(slotId) : true;
        });

        return filtered
            .map(p => ({ p, ms: getLiveMinutesSec(p.id) }))
            .sort((a, b) => b.ms - a.ms)
            .slice(0, 8);
    }, [roster, tactics, benchPlayerId, getLiveMinutesSec]);

    return (
        <BottomSheet open={open && !!benchPlayerId} onClose={onClose} title="Sub for">
            <Box sx={{ display: 'grid', gap: 2 }}>
                {candidates.length === 0 && <Typography variant="subtitle2" color="textSecondary">No eligible on-field players</Typography>}
                {candidates.map(({ p }) => (
                    <Box
                        key={p.id}
                        onClick={() => {
                            if (!benchPlayerId) return;
                            makeSub(benchPlayerId, p.id || undefined);
                            onClose();
                        }}
                        sx={{ cursor: 'pointer' }}
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
        </BottomSheet>
    );
}