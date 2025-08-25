import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import SubSheet from './SubSheet';
import FormationSelector from './FormationSelector';
import Pitch from './Pitch';
import Bench from './Bench';
export default function PointerTacticsBoard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetBenchId, setSheetBenchId] = useState<string | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);
  const onLongPressBench = (benchId: string) => {
    setSheetBenchId(benchId);
    setSheetOpen(true);
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iP(ad|hone|od)/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
      // HTML5 DnD is unreliable on iOS Safari; pointer-based drag is enabled
      console.warn('[SubTracker] iOS Safari detected — using Pointer Events drag (no HTML5 DnD).');
    }
  }, []);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '90%', maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' }, alignItems: 'center', width: '100%', maxWidth: 600 }}>
        <FormationSelector />
        <Pitch selectedSlotId={selectedSlotId} setSelectedSlotId={setSelectedSlotId} />
      </Box>
      <Bench selectedSlotId={selectedSlotId} setSelectedSlotId={setSelectedSlotId} onLongPressBench={onLongPressBench} />
      <SubSheet open={sheetOpen} benchPlayerId={sheetBenchId} onClose={() => setSheetOpen(false)} />
    </Box>
  );
}