import { useMemo, useState } from 'react'
import ClockPanel from './ClockPanel'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'
import SubSheet from './SubSheet'

export default function MatchTab() {
  const roster = useAppStore(s => s.roster)
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [benchId, setBenchId] = useState<string | undefined>(undefined)

  const stats = useMemo(() => {
    const msList = roster.map(p => getLiveMinutesMs(p.id))
    const avg = msList.length ? msList.reduce((a, b) => a + b, 0) / msList.length : 0
    const withMs = roster.map(p => ({ ...p, ms: getLiveMinutesMs(p.id) }))
    const onField = withMs.filter(p => p.isOnField).sort((a, b) => b.ms - a.ms)
    const bench = withMs.filter(p => !p.isOnField).sort((a, b) => a.ms - b.ms)
    return { avg, onField, bench }
  }, [roster, getLiveMinutesMs])

  const openSheet = (id: string) => { setBenchId(id); setSheetOpen(true) }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <ClockPanel />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 text-sm text-neutral-300">On Field</div>
          <div className="grid gap-2">
            {stats.onField.map(p => (
              <div key={p.id} className={`flex items-center justify-between rounded-md border p-2 ${p.ms < stats.avg ? 'border-amber-700 bg-amber-900/10' : 'border-neutral-800 bg-neutral-900/40'}`}>
                <div className="text-sm">{p.number ? `#${p.number} ` : ''}{p.name}</div>
                <div className={`text-xs tabular-nums ${p.ms < stats.avg ? 'text-amber-300' : 'text-neutral-400'}`}>{formatClock(p.ms)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 text-sm text-neutral-300">Bench</div>
          <div className="grid gap-2">
            {stats.bench.map(p => (
              <button key={p.id} className="flex items-center justify-between rounded-md border p-2 border-neutral-800 bg-neutral-900/40 text-left cursor-pointer touch-manipulation" onClick={() => openSheet(p.id)}>
                <div className="text-sm">{p.number ? `#${p.number} ` : ''}{p.name}</div>
                <div className="text-xs tabular-nums text-neutral-400">{formatClock(p.ms)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <SubSheet open={sheetOpen} benchPlayerId={benchId} onClose={() => setSheetOpen(false)} />
    </div>
  )
}