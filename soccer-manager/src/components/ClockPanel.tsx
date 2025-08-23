import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store'
import { formatClock, getTotalElapsedMs } from '../utils/time'

export default function ClockPanel() {
  const { isRunning, startedAtMs, accumulatedMs } = useAppStore(s => s.clock)
  const startClock = useAppStore(s => s.startClock)
  const pauseClock = useAppStore(s => s.pauseClock)
  const resetClock = useAppStore(s => s.resetClock)
  const rotationIntervalMinutes = useAppStore(s => s.config.rotationIntervalMinutes)

  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [isRunning])

  const elapsedMs = useMemo(() => getTotalElapsedMs(isRunning, startedAtMs, accumulatedMs), [isRunning, startedAtMs, accumulatedMs, tick])

  const intervalMs = rotationIntervalMinutes * 60 * 1000
  
  const showRotation = isRunning && elapsedMs > 0 && (elapsedMs % intervalMs) < 1500

  return (
    <div className="space-y-3">
      {showRotation && (
        <div className="rounded-lg border border-amber-600 bg-amber-900/20 px-3 py-2 text-sm text-amber-300">
          Rotation time! Suggest swapping fresh legs.
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="text-4xl font-semibold tabular-nums">{formatClock(elapsedMs)}</div>
        <div className="ml-auto flex items-center gap-2">
          {!isRunning ? (
            <button className="px-3 py-2 rounded border border-emerald-700 bg-emerald-700/20" onClick={startClock}>Start</button>
          ) : (
            <button className="px-3 py-2 rounded border border-blue-700 bg-blue-700/20" onClick={pauseClock}>Pause</button>
          )}
          <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800" onClick={resetClock}>Reset</button>
        </div>
      </div>
      <div className="text-xs text-neutral-400">Rotation every {rotationIntervalMinutes} min</div>
    </div>
  )
}