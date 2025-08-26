import { useEffect, useState, useMemo } from 'react';
import ClockPanel from './MatchPanel/ClockPanel';
import { useAppStore } from '../store';
import SubSheet from './Subs/SubSheet';
import { Box, Typography, Stack } from '@mui/material';
import Bench from './Bench/Bench';
import { formationLayouts } from '../store'; // Import formationLayouts

export default function MatchTab() {
    const roster = useAppStore(s => s.roster);
    const getFormattedLiveMinutes = useAppStore(s => s.getFormattedLiveMinutes);
    const isRunning = useAppStore(s => s.clock.isRunning);
    const tactics = useAppStore(s => s.tactics);
    const formation = useAppStore(s => s.formation); // Access the current formation

    const [sheetOpen, setSheetOpen] = useState(false);
    const [benchId, setBenchId] = useState<string | undefined>(undefined);
    const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);

    const handleBenchClick = (benchId: string) => {
        setBenchId(benchId);
        setSheetOpen(true);
    };

    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => setTick(t => t + 1), 500);
        return () => clearInterval(id);
    }, [isRunning]);

    const playerTimes = useMemo(() => {
        const times: { [playerId: string]: number } = {};
        roster.forEach(p => {
            times[p.id] = getFormattedLiveMinutes(p.id);
        });
        return times;
    }, [roster, getFormattedLiveMinutes, tick]);

    const [onFieldPlayers, setOnFieldPlayers] = useState<any[]>([]);

    useEffect(() => {
        const withMs = roster.map(p => ({ ...p, ms: playerTimes[p.id] }));
        const onField = withMs.filter(p => p.isOnField);

        // Get the layout for the current formation
        const currentFormationLayout = formationLayouts[formation];

        // Define the desired order of positions based on the order property in the formation layout
        const positionOrder = Object.entries(currentFormationLayout)
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([positionId]) => positionId.toUpperCase());

        const sortedOnField = [...onField].sort((a, b) => {
            const slotA = tactics.find(t => t.playerId === a.id);
            const slotB = tactics.find(t => t.playerId === b.id);

            const positionA = slotA ? slotA.id.toUpperCase() : 'N/A';
            const positionB = slotB ? slotB.id.toUpperCase() : 'N/A';

            const indexA = positionOrder.indexOf(positionA);
            const indexB = positionOrder.indexOf(positionB);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB; // Sort by position order if both positions are in the order array
            } else if (indexA !== -1) {
                return -1; // a comes before b if only a's position is in the order array
            } else if (indexB !== -1) {
                return 1; // b comes before a if only b's position is in the order array
            } else {
                // If neither position is in the order array, sort by minutes played and then player number
                if (b.ms - a.ms !== 0) {
                    return b.ms - a.ms;
                } else {
                    return (a.number || 0) - (b.number || 0);
                }
            }
        });

        setOnFieldPlayers(sortedOnField);
    }, [roster, playerTimes, tick, tactics, formation]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '90%', maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
                <ClockPanel />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
                <Typography variant="subtitle1">On Field</Typography>
                <Box width={'100%'}>
                    {onFieldPlayers.map(p => {
                        const slot = tactics.find(t => t.playerId === p.id); // Find the slot
                        const position = slot ? slot.id.toUpperCase() : 'N/A'; // Get position
                        return (
                            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 2, bgcolor: 'background.paper', mb: 1 }}>
                                <Typography variant="body2">{p.number ? `#${p.number} ` : ''}{p.name}</Typography>
                                <Stack direction="column" alignItems="flex-end">
                                    <Typography variant="caption" sx={{ fontSize: '0.875rem' }}>{p.ms}</Typography>
                                    <Typography variant="caption">{position}</Typography>
                                </Stack>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
            <Bench selectedSlotId={selectedSlotId} setSelectedSlotId={setSelectedSlotId} onBenchClick={handleBenchClick} />
            <SubSheet open={sheetOpen} benchPlayerId={benchId} onClose={() => setSheetOpen(false)} />
        </Box>
    );
}