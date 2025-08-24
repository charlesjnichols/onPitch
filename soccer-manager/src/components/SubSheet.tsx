import { useState, useMemo } from 'react'
import BottomSheet from './BottomSheet'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'

export default function SubSheet({ open, benchPlayerId, onClose }: { open: boolean, benchPlayerId?: string, onClose: () => void }) {
  const roster = useAppStore(s => s.roster)
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs)
  const makeSub = useAppStore(s => s.makeSub)
  const [note, setNote] = useState('')

  const candidates = useMemo(() => roster.filter(p => p.isOnField)
    .map(p => ({ p, ms: getLiveMinutesMs(p.id) }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 5), [roster, getLiveMinutesMs])

  return (
    <BottomSheet open={open && !!benchPlayerId} onClose={onClose} title="Sub for">
      <div className="grid gap-2">
        {candidates.length === 0 && <div className="text-sm text-neutral-500">No on-field players</div>}
        {candidates.map(({ p, ms }) => (
          <button key={p.id} className="text-left px-3 py-3 rounded border border-neutral-700 bg-neutral-800 cursor-pointer touch-manipulation" onClick={() => { if (!benchPlayerId) return; makeSub(benchPlayerId, p.id, note || undefined); onClose(); setNote('') }}>
            <div className="flex items-center justify-between">
              <div className="text-sm">{p.number ? `#${p.number} ` : ''}{p.name}</div>
              <div className="text-xs text-neutral-400">{formatClock(ms)}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        <input className="w-full bg-neutral-800/60 rounded px-3 py-2 text-sm" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </BottomSheet>
  )
}