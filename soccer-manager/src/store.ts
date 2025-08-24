import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MatchState, Player, SubEvent, TacticsSlot, FormationId } from './types'
import { uid } from './utils/uid'

const DEFAULT_TACTICS: TacticsSlot[] = [
  // simple 4-3-3 layout on a 100% pitch
  { id: 'gk', x: 0.08, y: 0.5 },
  { id: 'lb', x: 0.25, y: 0.2 },
  { id: 'lcb', x: 0.25, y: 0.4 },
  { id: 'rcb', x: 0.25, y: 0.6 },
  { id: 'rb', x: 0.25, y: 0.8 },
  { id: 'lcm', x: 0.5, y: 0.3 },
  { id: 'cm', x: 0.5, y: 0.5 },
  { id: 'rcm', x: 0.5, y: 0.7 },
  { id: 'lw', x: 0.78, y: 0.25 },
  { id: 'st', x: 0.82, y: 0.5 },
  { id: 'rw', x: 0.78, y: 0.75 },
]

const FORMATION_LAYOUTS: Record<FormationId, Record<string, { x: number, y: number }>> = {
  '4-3-3': {
    gk: { x: 0.08, y: 0.50 },
    lb: { x: 0.25, y: 0.20 },
    lcb: { x: 0.25, y: 0.40 },
    rcb: { x: 0.25, y: 0.60 },
    rb: { x: 0.25, y: 0.80 },
    lcm: { x: 0.50, y: 0.30 },
    cm: { x: 0.50, y: 0.50 },
    rcm: { x: 0.50, y: 0.70 },
    lw: { x: 0.78, y: 0.25 },
    st: { x: 0.82, y: 0.50 },
    rw: { x: 0.78, y: 0.75 },
  },
  '4-4-2': {
    gk: { x: 0.08, y: 0.50 },
    lb: { x: 0.25, y: 0.20 },
    lcb: { x: 0.25, y: 0.40 },
    rcb: { x: 0.25, y: 0.60 },
    rb: { x: 0.25, y: 0.80 },
    lcm: { x: 0.52, y: 0.28 }, // LM approx
    cm: { x: 0.52, y: 0.50 },  // CM
    rcm: { x: 0.52, y: 0.72 }, // RM approx
    lw: { x: 0.75, y: 0.35 },  // LF
    st: { x: 0.80, y: 0.50 },  // CF
    rw: { x: 0.75, y: 0.65 },  // RF
  },
  '3-5-2': {
    gk: { x: 0.08, y: 0.50 },
    lb: { x: 0.25, y: 0.30 },  // LCB approx
    lcb: { x: 0.25, y: 0.50 }, // CB
    rcb: { x: 0.25, y: 0.70 }, // RCB
    rb: { x: 0.40, y: 0.50 },  // CDM-ish anchor
    lcm: { x: 0.55, y: 0.30 }, // LCM
    cm: { x: 0.55, y: 0.50 },  // CM
    rcm: { x: 0.55, y: 0.70 }, // RCM
    lw: { x: 0.70, y: 0.35 },  // ST1
    st: { x: 0.78, y: 0.50 },  // ST2
    rw: { x: 0.70, y: 0.65 },  // ST1 mirror
  },
}

export interface AppStore extends MatchState {
  // roster
  addPlayer: (p: Omit<Player, 'id' | 'minutesPlayedMs'> & { id?: string }) => void
  updatePlayer: (id: string, patch: Partial<Omit<Player, 'id'>>) => void
  removePlayer: (id: string) => void
  toggleStarter: (id: string, isOnField: boolean) => void

  // clock
  startClock: () => void
  pauseClock: () => void
  resetClock: () => void

  // subs
  makeSub: (inId: string, outId?: string, note?: string) => void

  // tactics
  assignPlayerToSlot: (slotId: string, playerId?: string) => void
  moveSlot: (slotId: string, x: number, y: number) => void
  swapSlotPlayers: (slotAId: string, slotBId: string) => void
  benchPlayer: (playerId: string) => void

  // formation + wrappers
  setFormation: (formation: FormationId) => void
  placePlayerInSlot: (slotId: string, playerId: string) => void
  benchPlayerFromSlot: (slotId: string) => void
  swapSlots: (slotAId: string, slotBId: string) => void
  subBenchForSlot: (benchPlayerId: string, slotId: string) => void

  // helpers
  getLiveMinutesMs: (playerId: string) => number
  resetForNewGame: () => void
}

const initialState: MatchState = {
  roster: [],
  subs: [],
  tactics: DEFAULT_TACTICS,
  formation: '4-3-3',
  clock: { isRunning: false, accumulatedMs: 0 },
  config: { maxOnField: 11, rotationIntervalMinutes: 6 },
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPlayer: (p) => set((s) => {
        const id = p.id ?? uid()
        const player: Player = {
          id,
          name: p.name,
          number: p.number,
          positionTags: p.positionTags ?? [],
          isOnField: p.isOnField ?? false,
          minutesPlayedMs: 0,
        }
        return { roster: [...s.roster, player] }
      }),

      updatePlayer: (id, patch) => set((s) => ({
        roster: s.roster.map(pl => pl.id === id ? { ...pl, ...patch } : pl)
      })),

      removePlayer: (id) => set((s) => ({
        roster: s.roster.filter(pl => pl.id !== id),
        tactics: s.tactics.map(slot => slot.playerId === id ? { ...slot, playerId: undefined } : slot)
      })),

      toggleStarter: (id, isOnField) => set((s) => {
        if (isOnField) {
          const currentOn = s.roster.filter(p => p.isOnField).length
          if (currentOn >= s.config.maxOnField) return s
        }
        return {
          roster: s.roster.map(pl => pl.id === id ? { ...pl, isOnField } : pl)
        }
      }),

      startClock: () => set((s) => s.clock.isRunning ? s : ({
        clock: { ...s.clock, isRunning: true, startedAtMs: Date.now() }
      })),

      pauseClock: () => set((s) => {
        if (!s.clock.isRunning || s.clock.startedAtMs == null) return s
        const now = Date.now()
        const elapsed = now - s.clock.startedAtMs
        // accumulate for all on-field players
        const roster = s.roster.map(pl => pl.isOnField ? { ...pl, minutesPlayedMs: pl.minutesPlayedMs + elapsed } : pl)
        return {
          roster,
          clock: { isRunning: false, startedAtMs: undefined, accumulatedMs: s.clock.accumulatedMs + elapsed }
        }
      }),

      resetClock: () => set(() => ({
        clock: { isRunning: false, startedAtMs: undefined, accumulatedMs: 0 }
      })),

      makeSub: (inId, outId, note) => set((s) => {
        const now = Date.now()
        let roster = s.roster
        // On substitution, freeze current on-field elapsed for everyone
        if (s.clock.isRunning && s.clock.startedAtMs) {
          const elapsed = now - s.clock.startedAtMs
          roster = roster.map(pl => pl.isOnField ? { ...pl, minutesPlayedMs: pl.minutesPlayedMs + elapsed } : pl)
        }
        // handle out
        if (outId) {
          roster = roster.map(pl => pl.id === outId ? { ...pl, isOnField: false } : pl)
        }
        // handle in
        roster = roster.map(pl => pl.id === inId ? { ...pl, isOnField: true } : pl)

        const onFieldCount = roster.filter(p => p.isOnField).length
        if (onFieldCount > s.config.maxOnField) {
          // enforce: if too many, revert the last in
          roster = roster.map(pl => pl.id === inId ? { ...pl, isOnField: false } : pl)
        }

        const sub: SubEvent = { id: uid(), timestampMs: now, playerInId: inId, playerOutId: outId, note }
        return {
          roster,
          subs: [...s.subs, sub],
          // restart clock anchor
          clock: { ...s.clock, startedAtMs: s.clock.isRunning ? now : s.clock.startedAtMs }
        }
      }),

      assignPlayerToSlot: (slotId, playerId) => set((s) => {
        // Clear existing occurrence of this player from any slot, and set on target slot
        const tactics = s.tactics.map(slot => ({ ...slot }))
        if (playerId) {
          for (const slot of tactics) {
            if (slot.playerId === playerId) slot.playerId = undefined
          }
        }
        const idx = tactics.findIndex(sl => sl.id === slotId)
        if (idx >= 0) tactics[idx].playerId = playerId
        return { tactics }
      }),

      moveSlot: (slotId, x, y) => set((s) => ({
        tactics: s.tactics.map(slot => slot.id === slotId ? { ...slot, x, y } : slot)
      })),

      swapSlotPlayers: (slotAId, slotBId) => set((s) => {
        const tactics = s.tactics.map(slot => ({ ...slot }))
        const a = tactics.find(sl => sl.id === slotAId)
        const b = tactics.find(sl => sl.id === slotBId)
        if (!a || !b) return s
        const tmp = a.playerId
        a.playerId = b.playerId
        b.playerId = tmp
        return { tactics }
      }),

      benchPlayer: (playerId) => set((s) => ({
        roster: s.roster.map(pl => pl.id === playerId ? { ...pl, isOnField: false } : pl),
        tactics: s.tactics.map(slot => slot.playerId === playerId ? { ...slot, playerId: undefined } : slot)
      })),

      setFormation: (formation) => set((s) => {
        const layout = FORMATION_LAYOUTS[formation]
        const tactics = s.tactics.map(slot => {
          const pos = layout[slot.id] ?? { x: slot.x, y: slot.y }
          return { ...slot, x: pos.x, y: pos.y }
        })
        return { formation, tactics }
      }),

      placePlayerInSlot: (slotId, playerId) => set((s) => {
        const current = s.tactics.find(t => t.id === slotId)
        const prevPlayerId = current?.playerId
        const result: any = {}
        // assign slot
        const tactics = s.tactics.map(t => t.id === slotId ? { ...t, playerId } : (t.playerId === playerId ? { ...t, playerId: undefined } : t))
        result.tactics = tactics
        // perform sub semantics to update onField flags and minutes
        const now = Date.now()
        let roster = s.roster
        if (s.clock.isRunning && s.clock.startedAtMs) {
          const elapsed = now - s.clock.startedAtMs
          roster = roster.map(pl => pl.isOnField ? { ...pl, minutesPlayedMs: pl.minutesPlayedMs + elapsed } : pl)
        }
        if (prevPlayerId) {
          roster = roster.map(pl => pl.id === prevPlayerId ? { ...pl, isOnField: false } : pl)
        }
        roster = roster.map(pl => pl.id === playerId ? { ...pl, isOnField: true } : pl)
        if (roster.filter(p => p.isOnField).length > s.config.maxOnField) {
          roster = roster.map(pl => pl.id === playerId ? { ...pl, isOnField: false } : pl)
        }
        result.roster = roster
        result.clock = { ...s.clock, startedAtMs: s.clock.isRunning ? now : s.clock.startedAtMs }
        return result
      }),

      benchPlayerFromSlot: (slotId) => set((s) => {
        const slot = s.tactics.find(t => t.id === slotId)
        if (!slot?.playerId) return s
        const playerId = slot.playerId
        const tactics = s.tactics.map(t => t.id === slotId ? { ...t, playerId: undefined } : t)
        const roster = s.roster.map(pl => pl.id === playerId ? { ...pl, isOnField: false } : pl)
        return { tactics, roster }
      }),

      swapSlots: (slotAId, slotBId) => set((s) => {
        const tactics = s.tactics.map(slot => ({ ...slot }))
        const a = tactics.find(sl => sl.id === slotAId)
        const b = tactics.find(sl => sl.id === slotBId)
        if (!a || !b) return s
        const tmp = a.playerId
        a.playerId = b.playerId
        b.playerId = tmp
        return { tactics }
      }),

      subBenchForSlot: (benchPlayerId, slotId) => set((s) => {
        const prev = s.tactics.find(t => t.id === slotId)?.playerId
        const now = Date.now()
        let roster = s.roster
        if (s.clock.isRunning && s.clock.startedAtMs) {
          const elapsed = now - s.clock.startedAtMs
          roster = roster.map(pl => pl.isOnField ? { ...pl, minutesPlayedMs: pl.minutesPlayedMs + elapsed } : pl)
        }
        if (prev) {
          roster = roster.map(pl => pl.id === prev ? { ...pl, isOnField: false } : pl)
        }
        roster = roster.map(pl => pl.id === benchPlayerId ? { ...pl, isOnField: true } : pl)
        if (roster.filter(p => p.isOnField).length > s.config.maxOnField) {
          roster = roster.map(pl => pl.id === benchPlayerId ? { ...pl, isOnField: false } : pl)
        }
        const tactics = s.tactics.map(t => t.id === slotId ? { ...t, playerId: benchPlayerId } : (t.playerId === benchPlayerId ? { ...t, playerId: undefined } : t))
        const sub: SubEvent = { id: uid(), timestampMs: now, playerInId: benchPlayerId, playerOutId: prev }
        return { roster, tactics, subs: [...s.subs, sub], clock: { ...s.clock, startedAtMs: s.clock.isRunning ? now : s.clock.startedAtMs } }
      }),

      getLiveMinutesMs: (playerId) => {
        const s = get()
        const pl = s.roster.find(p => p.id === playerId)
        if (!pl) return 0
        const base = pl.minutesPlayedMs
        if (s.clock.isRunning && s.clock.startedAtMs && pl.isOnField) {
          return base + (Date.now() - s.clock.startedAtMs)
        }
        return base
      },

      resetForNewGame: () => set(() => ({
        ...initialState,
        // keep roster but reset minutes and on-field flags
        roster: [],
      })),
    }),
    {
      name: 'soccer-manager',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        roster: s.roster,
        subs: s.subs,
        tactics: s.tactics,
        formation: s.formation,
        clock: s.clock,
        config: s.config,
      }),
      version: 1,
    }
  )
)