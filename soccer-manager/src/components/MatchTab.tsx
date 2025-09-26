import { useEffect, useState, useMemo } from 'react';
import ClockPanel from './MatchPanel/ClockPanel';
import { useAppStore } from '../store';
import SubSheet from './Subs/SubSheet';
import { Button, Box, Typography, Stack } from '@mui/material';
import Bench from './Bench/Bench';
import { formationLayouts } from '../store';
import { formatClock, getTotalElapsedSec } from '../utils/time';

export default function MatchTab() {
    const roster = useAppStore(s => s.roster);
    const getFormattedLiveMinutes = useAppStore(s => s.getFormattedLiveMinutes);
    const isRunning = useAppStore(s => s.clock.isRunning);
    const tactics = useAppStore(s => s.tactics);
    const formation = useAppStore(s => s.formation);
    const { substitutionQueue, cancelSub, performSubs } = useAppStore(s => s);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [benchId, setBenchId] = useState<string | undefined>(undefined);
    const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);

    const resetSubClock = useAppStore(s => s.resetSubClock);
    const rotationIntervalMinutes = useAppStore(s => s.config.rotationIntervalMinutes);

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

    const { startedAtSec, accumulatedSec } = useAppStore(s => s.subClock);
    const elapsedSec = useMemo(() => getTotalElapsedSec(isRunning, startedAtSec, accumulatedSec), [isRunning, startedAtSec, accumulatedSec, tick]);
    const formattedTime = formatClock(Math.floor(elapsedSec));

    const intervalSec = rotationIntervalMinutes * 60;
    const showRotation = isRunning && elapsedSec > intervalSec;
    

    useEffect(() => {
        const withMs = roster.map(p => ({ ...p, ms: playerTimes[p.id] }));
        const onField = withMs.filter(p => p.isOnField);

        const currentFormationLayout = formationLayouts[formation];

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
                return indexA - indexB;
            } else if (indexA !== -1) {
                return -1;
            } else if (indexB !== -1) {
                return 1;
            } else {
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
                {showRotation ? (
                    <Typography variant="subtitle1">Rotate Players Now!</Typography>
                    ) : (
                    <Typography variant="subtitle1">Substitution Queue</Typography>
                )}

                {substitutionQueue.length > 0 && (
                    substitutionQueue.map((sub, index) => {
                        const benchPlayer = roster.find(p => p.id === sub.inId);
                        const onFieldPlayer = roster.find(p => p.id === sub.outId);
                        return (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1, p: 2, marginBottom: 5, bgcolor: 'background.paper', mb: 1 }}>
                                <Typography variant="body2">
                                    {benchPlayer?.name} for {onFieldPlayer?.name}
                                </Typography>
                                <Button size="small" onClick={() => cancelSub(sub)}>Cancel</Button>
                            </Box>
                        );
                    })
                )}
                {substitutionQueue.length == 0 &&
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1, p: 2, bgcolor: 'background.paper', mb: 1 }}>
                        <Typography variant="body2">
                            No Substitutions Queued
                        </Typography>
                    </Box>
                }
                <Box sx={{ display: 'flex', gap: 2 }}>
                {isRunning && (
                            <Button variant="contained" color="secondary" onClick={resetSubClock}>Reset Sub Clock</Button>
                        )}
                {substitutionQueue.length > 0 && (
                    <Button variant="contained" color="primary" onClick={performSubs}>
                        Perform Substitutions
                    </Button>
                )}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 600 }}>
                <Typography variant="subtitle1">On Field</Typography>
                <Box width={'100%'}>
                    {onFieldPlayers.map(p => {
                        const slot = tactics.find(t => t.playerId === p.id);
                        const position = slot ? slot.id.toUpperCase() : 'N/A';
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