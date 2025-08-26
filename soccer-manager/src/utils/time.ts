export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getTotalElapsedSec(isRunning: boolean, startedAtSec: number | undefined, accumulatedSec: number): number {
  if (isRunning && startedAtSec) return accumulatedSec + ((Date.now() /1000) - startedAtSec)
  return accumulatedSec
}