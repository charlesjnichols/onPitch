import { useMemo, useRef } from 'react'
import Papa from 'papaparse'
import RosterPanel from './RosterPanel'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'

export default function RosterTab({ onSendToLineup }: { onSendToLineup?: () => void }) {
  const roster = useAppStore(s => s.roster)
  const updatePlayer = useAppStore(s => s.updatePlayer)
  const addPlayer = useAppStore(s => s.addPlayer)
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const exportRosterCsv = () => {
    const rows = roster.map(p => ({
      Name: p.name,
      Number: p.number ?? '',
      PreferredPos: (p.positionTags[0] ?? ''),
      OnField: p.isOnField ? 'yes' : 'no',
      Minutes: formatClock(getLiveMinutesMs(p.id)),
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roster.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const seen = new Set<string>()
        const rows = (res.data as any[])
        for (const r of rows) {
          const name = String(r.Name || r.name || '').trim()
          const number = r.Number ? Number(r.Number) : undefined
          const preferred = String(r.PreferredPos || r.preferredPos || '').trim()
          if (!name) continue
          const key = `${name}|${number ?? ''}`
          if (seen.has(key)) continue
          seen.add(key)
          addPlayer({ name, number, positionTags: preferred ? [preferred as any] : [], isOnField: false })
        }
        alert('Roster imported')
      }
    })
  }

  const canSend = useMemo(() => roster.length > 0, [roster.length])

  const sendToLineup = () => {
    // Ensure at most 11 on-field: pick first 11 currently marked on field, otherwise fill by least minutes
    const withMs = roster.map(p => ({ p, ms: getLiveMinutesMs(p.id) }))
    const desired = withMs.filter(x => x.p.isOnField).map(x => x.p)
    const remaining = withMs.filter(x => !x.p.isOnField).sort((a, b) => a.ms - b.ms).map(x => x.p)
    const target = [...desired, ...remaining].slice(0, 11)
    const targetIds = new Set(target.map(p => p.id))
    for (const pl of roster) {
      updatePlayer(pl.id, { isOnField: targetIds.has(pl.id) })
    }
    onSendToLineup?.()
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={exportRosterCsv}>Export CSV</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); if (fileRef.current) fileRef.current.value = '' }} />
          <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={() => fileRef.current?.click()}>Import CSV</button>
        </div>
        <button disabled={!canSend} className="px-3 py-2 rounded border border-emerald-700 bg-emerald-700/20 text-sm disabled:opacity-50" onClick={sendToLineup}>Send to Lineup</button>
      </div>
      <RosterPanel />
    </div>
  )
}