import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../store'
import { formatClock } from '../utils/time'
import SubSheet from './SubSheet'
import { playerEligibleForSlot, getEligibleTagsForSlot } from '../utils/positions'

interface DragState {
  kind: 'bench' | 'slot'
  id: string
  startX: number
  startY: number
  currentX: number
  currentY: number
  ghostEl: HTMLDivElement
}

function useRafUpdater(callback: () => void) {
  const rafRef = useRef<number | null>(null)
  const scheduledRef = useRef(false)
  const request = () => {
    if (scheduledRef.current) return
    scheduledRef.current = true
    rafRef.current = requestAnimationFrame(() => {
      scheduledRef.current = false
      callback()
    })
  }
  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])
  return request
}

function distanceSq(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

function BenchItem({ id, name, number, onLongPress }: { id: string, name: string, number?: number, onLongPress: (benchId: string) => void }) {
  const itemRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = itemRef.current!
    if (!el) return
    let pressTimer: number | null = null
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      pressTimer = window.setTimeout(() => onLongPress(id), 350)
    }
    const clear = () => {
      if (pressTimer != null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', clear)
    el.addEventListener('pointercancel', clear)
    el.addEventListener('pointerleave', clear)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', clear)
      el.removeEventListener('pointercancel', clear)
      el.removeEventListener('pointerleave', clear)
    }
  }, [id, onLongPress])

  return (
    <div ref={itemRef} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-3 text-sm min-h-11 touch-manipulation cursor-pointer focus:outline focus:outline-2 focus:outline-emerald-500/70" aria-label={`Bench ${number ? `#${number} ` : ''}${name}`}>
      {number ? `#${number} ` : ''}{name}
    </div>
  )
}

export default function PointerTacticsBoard() {
  const tactics = useAppStore(s => s.tactics)
  const roster = useAppStore(s => s.roster)
  const assignPlayerToSlot = useAppStore(s => s.assignPlayerToSlot)
  const swapSlotPlayers = useAppStore(s => s.swapSlotPlayers)
  const benchPlayer = useAppStore(s => s.benchPlayer)
  const makeSub = useAppStore(s => s.makeSub)
  const getLiveMinutesMs = useAppStore(s => s.getLiveMinutesMs)
  const formation = useAppStore(s => s.formation)
  const setFormation = useAppStore(s => s.setFormation)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iP(ad|hone|od)/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    if (isIOS && isSafari) {
      // HTML5 DnD is unreliable on iOS Safari; pointer-based drag is enabled
      console.warn('[SubTracker] iOS Safari detected — using Pointer Events drag (no HTML5 DnD).')
    }
  }, [])

  const benchPlayers = useMemo(() => roster.filter(p => !p.isOnField), [roster])

  const pitchRef = useRef<HTMLDivElement | null>(null)
  const benchRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetBenchId, setSheetBenchId] = useState<string | undefined>(undefined)
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined)

  const schedule = useRafUpdater(() => {
    const ds = dragRef.current
    if (!ds) return
    const el = ds.ghostEl
    const dx = ds.currentX - ds.startX
    const dy = ds.currentY - ds.startY
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
  })

  const startDrag = (kind: 'bench' | 'slot', id: string, clientX: number, clientY: number, content: string) => {
    const ghost = document.createElement('div')
    ghost.className = 'pointer-events-none fixed left-0 top-0 z-50'
    const token = document.createElement('div')
    token.className = 'w-12 h-12 rounded-full border flex items-center justify-center text-xs bg-emerald-700/30 border-emerald-600 will-change-transform'
    token.textContent = content
    ghost.appendChild(token)
    document.body.appendChild(ghost)
    ghost.style.transform = `translate3d(${clientX - 24}px, ${clientY - 24}px, 0)`
    dragRef.current = { kind, id, startX: clientX, startY: clientY, currentX: clientX, currentY: clientY, ghostEl: ghost }
  }

  const endDrag = () => {
    const ds = dragRef.current
    if (!ds) return
    ds.ghostEl.remove()
    dragRef.current = null
  }

  useEffect(() => {
    const pitch = pitchRef.current
    if (!pitch) return

    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLElement)) return
      const target = e.target.closest('[data-draggable]') as HTMLElement | null
      if (!target) return
      const type = target.getAttribute('data-type') as 'bench' | 'slot'
      const id = String(target.getAttribute('data-id') || '')
      const label = String(target.getAttribute('data-label') || '')
      target.setPointerCapture(e.pointerId)
      startDrag(type, id, e.clientX, e.clientY, label)
      e.preventDefault()
    }

    const onPointerMove = (e: PointerEvent) => {
      const ds = dragRef.current
      if (!ds) return
      ds.currentX = e.clientX
      ds.currentY = e.clientY
      schedule()
    }

    const onPointerUp = (_e: PointerEvent) => {
      const ds = dragRef.current
      if (!ds) return

      const pitchRect = pitch.getBoundingClientRect()
      const benchRect = benchRef.current?.getBoundingClientRect()

      if (ds.kind === 'bench') {
        // drop to nearest slot
        let bestSlotId: string | undefined
        let bestD = Number.POSITIVE_INFINITY
        for (const slot of tactics) {
          const sx = pitchRect.left + slot.x * pitchRect.width
          const sy = pitchRect.top + slot.y * pitchRect.height
          const d = distanceSq(ds.currentX, ds.currentY, sx, sy)
          if (d < bestD) { bestD = d; bestSlotId = slot.id }
        }
        if (bestSlotId) {
          const prevPlayerId = tactics.find(t => t.id === bestSlotId)?.playerId
          assignPlayerToSlot(bestSlotId, ds.id)
          if (prevPlayerId && prevPlayerId !== ds.id) {
            makeSub(ds.id, prevPlayerId)
          } else {
            makeSub(ds.id, undefined)
          }
        }
      } else if (ds.kind === 'slot') {
        // slot to slot swap or slot to bench
        let overBench = false
        if (benchRect) {
          overBench = ds.currentX >= benchRect.left && ds.currentX <= benchRect.right && ds.currentY >= benchRect.top && ds.currentY <= benchRect.bottom
        }
        if (overBench) {
          const slotId = ds.id
          const slot = tactics.find(t => t.id === slotId)
          if (slot?.playerId) {
            benchPlayer(slot.playerId)
            assignPlayerToSlot(slotId, undefined)
          }
        } else {
          let bestSlotId: string | undefined
          let bestD = Number.POSITIVE_INFINITY
          for (const slot of tactics) {
            const sx = pitchRect.left + slot.x * pitchRect.width
            const sy = pitchRect.top + slot.y * pitchRect.height
            const d = distanceSq(ds.currentX, ds.currentY, sx, sy)
            if (d < bestD) { bestD = d; bestSlotId = slot.id }
          }
          if (bestSlotId && bestSlotId !== ds.id) {
            swapSlotPlayers(ds.id, bestSlotId)
          }
        }
      }

      endDrag()
    }

    pitch.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      pitch.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [tactics, assignPlayerToSlot, swapSlotPlayers, benchPlayer, makeSub, schedule])

  const onLongPressBench = (benchId: string) => {
    setSheetBenchId(benchId)
    setSheetOpen(true)
  }

  const eligibleBenchForSelected = useMemo(() => {
    if (!selectedSlotId) return benchPlayers
    return benchPlayers.filter(p => playerEligibleForSlot(p, selectedSlotId))
  }, [benchPlayers, selectedSlotId])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-300">Formation</div>
          <select className="bg-neutral-800/60 rounded px-2 py-1 text-sm" value={formation} onChange={(e) => setFormation(e.target.value as any)}>
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="3-5-2">3-5-2</option>
          </select>
        </div>
        <div ref={pitchRef} className="rounded-xl border border-neutral-800 bg-gradient-to-b from-emerald-950/60 to-neutral-950 relative touch-none select-none" style={{ aspectRatio: '2 / 3' }}>
          <div className="absolute inset-3 border border-emerald-900/60 rounded-lg" />
          <div className="absolute left-1/2 top-3 bottom-3 border-l border-emerald-900/60" />
          <div className="absolute left-3 right-3 top-1/4 h-24 border border-emerald-900/60 rounded-md" />
          <div className="absolute left-3 right-3 bottom-1/4 h-24 border border-emerald-900/60 rounded-md" />

          {tactics.map(slot => {
            const player = roster.find(p => p.id === slot.playerId)
            const aria = player ? `${slot.id.toUpperCase()} — ${formatClock(getLiveMinutesMs(player.id))} played` : `${slot.id.toUpperCase()} — empty`
            const isSelected = selectedSlotId === slot.id
            const eligibleTags = getEligibleTagsForSlot(slot.id)
            return (
              <div key={slot.id} className="absolute" style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={aria}
                  data-draggable
                  data-type="slot"
                  data-id={slot.id}
                  data-label={slot.id.toUpperCase()}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none focus:outline focus:outline-2 focus:outline-emerald-500/70 rounded-full ${isSelected ? 'ring-2 ring-emerald-500/80' : ''}`}
                  style={{ left: 0, top: 0 }}
                  onClick={() => setSelectedSlotId(isSelected ? undefined : slot.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedSlotId(isSelected ? undefined : slot.id) }}
                >
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs ${player ? 'bg-emerald-700/30 border-emerald-600' : 'bg-neutral-800/80 border-neutral-700'}`}>
                    {slot.id.toUpperCase()}
                  </div>
                  {!player && eligibleTags.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-12 mt-1 text-[10px] text-neutral-400 whitespace-nowrap">
                      Eligible: {eligibleTags.join('/')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm text-neutral-300">Bench{selectedSlotId ? ` — Eligible for ${selectedSlotId.toUpperCase()}` : ''}</div>
        <div ref={benchRef} className="grid gap-2">
          {eligibleBenchForSelected.length === 0 && <div className="text-xs text-neutral-500">No bench players</div>}
          {eligibleBenchForSelected.map(p => (
            <div
              key={p.id}
              data-draggable
              data-type="bench"
              data-id={p.id}
              data-label={p.number ? `#${p.number}` : p.name}
              aria-label={`Bench — ${p.name}`}
              className="[&>*]:pointer-events-none"
              onClick={() => {
                if (!selectedSlotId) return
                const prevPlayerId = tactics.find(t => t.id === selectedSlotId)?.playerId
                assignPlayerToSlot(selectedSlotId, p.id)
                if (prevPlayerId && prevPlayerId !== p.id) {
                  makeSub(p.id, prevPlayerId)
                } else {
                  makeSub(p.id, undefined)
                }
                setSelectedSlotId(undefined)
              }}
            >
              <BenchItem id={p.id} name={p.name} number={p.number} onLongPress={() => onLongPressBench(p.id)} />
            </div>
          ))}
        </div>
        {selectedSlotId && (
          <div className="mt-3 grid gap-2">
            <div className="text-xs text-neutral-400">Tap a bench player to assign to {selectedSlotId.toUpperCase()}.</div>
          </div>
        )}
      </div>

      <SubSheet open={sheetOpen} benchPlayerId={sheetBenchId} onClose={() => setSheetOpen(false)} />
    </div>
  )
}