import Papa from 'papaparse'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'

async function unregisterServiceWorkerAndClearCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      for (const reg of regs) await reg.unregister()
    }
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map(n => caches.delete(n)))
    }
    alert('Service worker unregistered and caches cleared. Reloading...')
    location.reload()
  } catch {
    alert('Failed to unregister SW or clear caches')
  }
}

export default function CSVExport() {
  const roster = useAppStore(s => s.roster)
  const subs = useAppStore(s => s.subs)
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs)

  function download(filename: string, text: string) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportMinutes = () => {
    const rows = roster.map(p => ({
      id: p.id,
      number: p.number ?? '',
      name: p.name,
      minutes: formatClock(getLiveMinutesMs(p.id)),
      ms: Math.round(getLiveMinutesMs(p.id)),
      onField: p.isOnField ? 'yes' : 'no',
      positions: p.positionTags.join('|'),
    }))
    const csv = Papa.unparse(rows)
    download('minutes.csv', csv)
  }

  const exportSubs = () => {
    const rows = subs.map(s => ({
      id: s.id,
      timestamp: new Date(s.timestampMs).toISOString(),
      playerInId: s.playerInId,
      playerOutId: s.playerOutId ?? '',
      note: s.note ?? '',
    }))
    const csv = Papa.unparse(rows)
    download('subs.csv', csv)
  }

  return (
    <div className="flex gap-2">
      <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={exportMinutes}>Export Minutes CSV</button>
      <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={exportSubs}>Export Subs CSV</button>
      <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={unregisterServiceWorkerAndClearCaches}>SW: Unregister & Clear Cache</button>
    </div>
  )
}