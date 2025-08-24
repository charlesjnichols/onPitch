import { useState } from 'react'
import { useAppStore } from '../store'
import type { PositionTag, Player } from '../types'
import { ALL_POSITIONS } from '../utils/positions'

function PlayerRow({ player }: { player: Player }) {
  const updatePlayer = useAppStore(s => s.updatePlayer)
  const removePlayer = useAppStore(s => s.removePlayer)
  const toggleStarter = useAppStore(s => s.toggleStarter)

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="flex items-center gap-3">
        <input
          className="w-14 bg-neutral-800/60 rounded px-2 py-1 text-sm"
          placeholder="#"
          value={player.number ?? ''}
          onChange={(e) => updatePlayer(player.id, { number: Number(e.target.value || 0) || undefined })}
        />
        <input
          className="w-40 bg-neutral-800/60 rounded px-2 py-1 text-sm"
          placeholder="Name"
          value={player.name}
          onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
        />
        <select
          multiple
          className="bg-neutral-800/60 rounded px-2 py-1 text-sm"
          value={player.positionTags}
          onChange={(e) => {
            const opts = Array.from(e.target.selectedOptions).map(o => o.value as PositionTag)
            updatePlayer(player.id, { positionTags: opts })
          }}
        >
          {ALL_POSITIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`text-xs px-2 py-1 rounded border ${player.isOnField ? 'bg-emerald-600/20 border-emerald-600' : 'bg-neutral-800 border-neutral-700'}`}
          onClick={() => toggleStarter(player.id, !player.isOnField)}
        >{player.isOnField ? 'On Field' : 'Bench'}</button>
        <button className="text-xs px-2 py-1 rounded border border-red-700 bg-red-700/20" onClick={() => removePlayer(player.id)}>Remove</button>
      </div>
    </div>
  )
}

export default function RosterPanel() {
  const roster = useAppStore(s => s.roster)
  const addPlayer = useAppStore(s => s.addPlayer)
  const [name, setName] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-neutral-800/60 rounded px-3 py-2 text-sm"
          placeholder="Add player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="px-3 py-2 text-sm rounded border border-neutral-700 bg-neutral-800"
          onClick={() => {
            if (!name.trim()) return
            addPlayer({ name: name.trim(), positionTags: [], isOnField: false })
            setName('')
          }}
        >Add</button>
      </div>

      <div className="grid gap-2">
        {roster.length === 0 && (
          <div className="text-sm text-neutral-400">No players yet. Add some to build your roster.</div>
        )}
        {roster.map(p => (
          <PlayerRow key={p.id} player={p} />
        ))}
      </div>
    </div>
  )
}