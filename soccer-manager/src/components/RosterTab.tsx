import { useMemo, useRef } from 'react'
import Papa from 'papaparse'
import RosterPanel from './RosterPanel'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'
import { Box, Button, styled } from '@mui/material'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%) !important',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '90%', maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => fileRef.current?.click()}>Import CSV</Button>
          <Button variant="contained" color="primary" onClick={exportRosterCsv}>Export CSV</Button>

          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              if (fileRef.current) fileRef.current.value = '';
            }}
            ref={fileRef}
          />

        <Button disabled={!canSend} variant="contained" color="secondary" onClick={sendToLineup}>Send to Lineup</Button>
      </Box>
      <RosterPanel />
    </Box>
  )
}