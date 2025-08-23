import { DndContext, useSensor, useSensors, PointerSensor, rectIntersection } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import { useAppStore } from '../store'

function SlotToken({ id, x, y, label, playerId }: { id: string, x: number, y: number, label: string, playerId?: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    left: `${x * 100}%`,
    top: `${y * 100}%`,
  } as React.CSSProperties
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs ${playerId ? 'bg-emerald-700/30 border-emerald-600' : 'bg-neutral-800/80 border-neutral-700'}`}>
        {label}
      </div>
    </div>
  )
}

function BenchItem({ id, name, number }: { id: string, name: string, number?: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
  const style = { transform: transform ? CSS.Translate.toString(transform) : undefined }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-2 text-sm" style={style}>
      {number ? `#${number} ` : ''}{name}
    </div>
  )
}

export default function TacticsBoard() {
  const { tactics, roster } = useAppStore(s => ({ tactics: s.tactics, roster: s.roster }))
  const assignPlayerToSlot = useAppStore(s => s.assignPlayerToSlot)
  const swapSlotPlayers = useAppStore(s => s.swapSlotPlayers)
  const benchPlayer = useAppStore(s => s.benchPlayer)
  const makeSub = useAppStore(s => s.makeSub)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const isBenchPlayer = activeId.startsWith('bench:')
    const isSlot = overId.startsWith('slot:')

    if (isBenchPlayer && isSlot) {
      const playerId = activeId.replace('bench:', '')
      const slotId = overId.replace('slot:', '')
      const prevPlayerId = tactics.find(t => t.id === slotId)?.playerId
      assignPlayerToSlot(slotId, playerId)
      if (prevPlayerId && prevPlayerId !== playerId) {
        makeSub(playerId, prevPlayerId)
      } else {
        makeSub(playerId, undefined)
      }
      return
    }

    if (activeId.startsWith('slot:') && isSlot) {
      const a = activeId.replace('slot:', '')
      const b = overId.replace('slot:', '')
      if (a !== b) swapSlotPlayers(a, b)
      return
    }

    if (activeId.startsWith('slot:') && overId === 'bench') {
      const slotId = activeId.replace('slot:', '')
      const slot = tactics.find(t => t.id === slotId)
      if (slot?.playerId) {
        benchPlayer(slot.playerId)
        assignPlayerToSlot(slotId, undefined)
      }
      return
    }
  }

  const benchPlayers = useMemo(() => roster.filter(p => !p.isOnField), [roster])

  // Register bench droppable
  const { setNodeRef: setBenchRef } = useDroppable({ id: 'bench' })

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-neutral-800 bg-gradient-to-b from-emerald-950/60 to-neutral-950 relative" style={{ aspectRatio: '2 / 3' }}>
          {/* pitch lines */}
          <div className="absolute inset-3 border border-emerald-900/60 rounded-lg" />
          <div className="absolute left-1/2 top-3 bottom-3 border-l border-emerald-900/60" />
          <div className="absolute left-3 right-3 top-1/4 h-24 border border-emerald-900/60 rounded-md" />
          <div className="absolute left-3 right-3 bottom-1/4 h-24 border border-emerald-900/60 rounded-md" />

          {tactics.map(slot => {
            const { setNodeRef } = useDroppable({ id: `slot:${slot.id}` })
            return (
              <div key={slot.id} ref={setNodeRef} className="absolute" style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <SlotToken id={`slot:${slot.id}`} x={slot.x} y={slot.y} label={slot.id.toUpperCase()} playerId={slot.playerId} />
              </div>
            )
          })}
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-300">Bench</div>
          <div ref={setBenchRef} className="grid gap-2">
            {benchPlayers.length === 0 && <div className="text-xs text-neutral-500">No bench players</div>}
            {benchPlayers.map(p => (
              <BenchItem key={p.id} id={`bench:${p.id}`} name={p.name} number={p.number} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  )
}