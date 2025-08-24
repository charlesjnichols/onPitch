export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getTotalElapsedMs(isRunning: boolean, startedAtMs: number | undefined, accumulatedMs: number): number {
  if (isRunning && startedAtMs) return accumulatedMs + (Date.now() - startedAtMs)
  return accumulatedMs
}