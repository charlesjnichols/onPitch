import { useAppStore } from '../store'
import { getLogs } from '../utils/logger'

export default function DebugExport() {
  const exportDebug = () => {
    const s = useAppStore.getState()
    const snapshot = {
      roster: s.roster,
      subs: s.subs,
      tactics: s.tactics,
      clock: s.clock,
      config: s.config,
    }
    const payload = {
      snapshot,
      logs: getLogs(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      time: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'debug.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={exportDebug}>Export Debug</button>
  )
}