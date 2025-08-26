import { create } from "zustand";
import {
  persist,
  createJSONStorage,
} from "zustand/middleware";
import type { MatchState, Player, SubEvent, TacticsSlot } from "./types";
import { uid } from "./utils/uid";
import { formatClock } from './utils/time'; // Import formatClock

const formationLayouts = {
  "4-3-3": {
    gk: { x: 0.15, y: 0.5 },
    lb: { x: 0.3, y: 0.2 },
    lcb: { x: 0.3, y: 0.4 },
    rcb: { x: 0.3, y: 0.6 },
    rb: { x: 0.3, y: 0.8 },
    lcm: { x: 0.5, y: 0.2 },
    cm: { x: 0.5, y: 0.5 },
    rcm: { x: 0.5, y: 0.8 },
    lw: { x: 0.7, y: 0.25 },
    st: { x: 0.8, y: 0.5 },
    rw: { x: 0.7, y: 0.75 },
  },
  "4-4-2": {
    gk: { x: 0.15, y: 0.5 },
    lb: { x: 0.3, y: 0.2 },
    lcb: { x: 0.3, y: 0.4 },
    rcb: { x: 0.3, y: 0.6 },
    rb: { x: 0.3, y: 0.8 },
    lw: { x: 0.5, y: 0.2 },
    cm1: { x: 0.5, y: 0.4 },
    cm2: { x: 0.5, y: 0.6 },
    rw: { x: 0.5, y: 0.8 },
    st1: { x: 0.7, y: 0.35 },
    st2: { x: 0.7, y: 0.65 },
  },
  "3-5-2": {
    gk: { x: 0.15, y: 0.5 },
    lb: { x: 0.3, y: 0.3 },
    cb: { x: 0.3, y: 0.5 },
    rb: { x: 0.3, y: 0.7 },
    cdm: { x: 0.45, y: 0.5 },
    lcm: { x: 0.6, y: 0.2 },
    cm1: { x: 0.6, y: 0.38 },
    cm2: { x: 0.6, y: 0.62 },
    rcm: { x: 0.6, y: 0.8 },
    st1: { x: 0.8, y: 0.35 },
    st2: { x: 0.8, y: 0.65 },
  },
  "4-4-2 (Diamond)": {
    gk: { x: 0.15, y: 0.5 },
    lb: { x: 0.3, y: 0.2 },
    lcb: { x: 0.3, y: 0.4 },
    rcb: { x: 0.3, y: 0.6 },
    rb: { x: 0.3, y: 0.8 },
    cdm: { x: 0.45, y: 0.5 },
    lw: { x: 0.55, y: 0.2 },
    rw: { x: 0.55, y: 0.8 },
    cam: { x: 0.65, y: 0.5 },
    st1: { x: 0.8, y: 0.35 },
    st2: { x: 0.8, y: 0.65 },
  },
};

export type FormationId = keyof typeof formationLayouts;

export const FORMATION_LAYOUTS = formationLayouts as Record<
  FormationId,
  Record<string, { x: number; y: number }>
>;

// this function creates the initial tactics array based on the formation
const createTacticsForFormation = (formation: FormationId): TacticsSlot[] => {
  const layout = FORMATION_LAYOUTS[formation];
  if (!layout) return [];

  return Object.entries(layout).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    playerId: undefined,
  }));
};

export interface AppStore extends MatchState {
  getFormattedLiveMinutes(id: string): any;
  // roster
  addPlayer: (
    p: Omit<Player, "id"> & { id?: string }
  ) => void;
  updatePlayer: (id: string, patch: Partial<Omit<Player, "id">>) => void;
  removePlayer: (id: string) => void;
  toggleStarter: (id: string, isOnField: boolean) => void;

  // clock
  startClock: () => void;
  pauseClock: () => void;
  resetClock: () => void;

  // subs
  makeSub: (inId: string, outId?: string) => void;

  // tactics
  assignPlayerToSlot: (slotId: string, playerId?: string) => void;
  moveSlot: (slotId: string, x: number, y: number) => void;
  swapSlotPlayers: (slotAId: string, slotBId: string) => void;
  benchPlayer: (playerId: string) => void;

  // formation + wrappers
  setFormation: (formation: FormationId) => void;
  placePlayerInSlot: (slotId: string, playerId: string) => void;
  benchPlayerFromSlot: (slotId: string) => void;
  swapSlots: (slotAId: string, slotBId: string) => void;
  subBenchForSlot: (benchPlayerId: string, slotId: string) => void;

  // helpers
  getLiveMinutesSec: (playerId: string) => number;
  resetMatchState: () => void;
  resetRoster: () => void;
}

const initialState: MatchState = {
  roster: [],
  subs: [],
  tactics: [], // empty array
  formation: "4-3-3",
  clock: { isRunning: false, accumulatedSec: 0 },
  config: { maxOnField: 11, rotationIntervalMinutes: 10 },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPlayer: (p) =>
        set((s) => {
          const id = p.id ?? uid();
          const player: Player = {
            id,
            name: p.name,
            number: p.number,
            positionTags: p.positionTags ?? [],
            isOnField: p.isOnField ?? false,
            minutesPlayedSec: 0,
          };
          return { roster: [...s.roster, player] };
        }),

      updatePlayer: (id, patch) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === id ? { ...pl, ...patch } : pl
          ),
        })),

      removePlayer: (id) =>
        set((s) => ({
          roster: s.roster.filter((pl) => pl.id !== id),
          tactics: s.tactics.map((slot) =>
            slot.playerId === id ? { ...slot, playerId: undefined } : slot
          ),
        })),

      toggleStarter: (id, isOnField) =>
        set((s) => {
          const currentOn = s.roster.filter((p) => p.isOnField).length;
          if (isOnField && currentOn >= s.config.maxOnField) {
            // Provide feedback (e.g., using a notification system)
            console.warn(
              "Cannot add player: Maximum number of players on the field reached."
            );
            return s; // or return s, { ...s, error: "Too many players on field" }
          }
          return {
            roster: s.roster.map((pl) =>
              pl.id === id ? { ...pl, isOnField } : pl
            ),
          };
        }),

      startClock: () =>
        set((s) =>
          s.clock.isRunning
            ? s
            : {
                clock: {
                  ...s.clock,
                  isRunning: true,
                  startedAtSec: Date.now() / 1000,
                },
              }
        ),

      pauseClock: () =>
        set((s) => {
          if (!s.clock.isRunning || s.clock.startedAtSec == null) return s;
          const now = Date.now() / 1000;
          const elapsed = now - s.clock.startedAtSec;
          // accumulate for all on-field players
          const roster = s.roster.map((pl) =>
            pl.isOnField
              ? { ...pl, minutesPlayedSec: pl.minutesPlayedSec + elapsed }
              : pl
          );
          return {
            roster,
            clock: {
              isRunning: false,
              startedAtSec: undefined,
              accumulatedSec: s.clock.accumulatedSec + elapsed,
            },
          };
        }),

      resetClock: () =>
        set((s) => ({
          roster: s.roster.map((player) => ({
            ...player,
            minutesPlayedSec: 0,
          })),
          clock: {
            isRunning: false,
            startedAtSec: undefined,
            accumulatedSec: 0,
          },
        })),

      makeSub: (inId, outId) =>
        set((s) => {
          const now = Date.now() / 1000;
          let roster = s.roster;
          // On substitution, freeze current on-field elapsed for everyone
          if (s.clock.isRunning && s.clock.startedAtSec) {
            const elapsed = now - s.clock.startedAtSec;
            roster = roster.map((pl) =>
              pl.isOnField
                ? { ...pl, minutesPlayedSec: pl.minutesPlayedSec + elapsed }
                : pl
            );
          }
          // handle out
          if (outId) {
            roster = roster.map((pl) =>
              pl.id === outId ? { ...pl, isOnField: false } : pl
            );
          }
          // handle in
          roster = roster.map((pl) =>
            pl.id === inId ? { ...pl, isOnField: true } : pl
          );

          const onFieldCount = roster.filter((p) => p.isOnField).length;
          if (onFieldCount > s.config.maxOnField) {
            // enforce: if too many, revert the last in
            roster = roster.map((pl) =>
              pl.id === inId ? { ...pl, isOnField: false } : pl
            );
            console.warn(
              "Cannot sub player: Maximum number of players on the field reached."
            );
            return s;
          }

          const sub: SubEvent = {
            id: uid(),
            timestampMs: now * 1000,
            playerInId: inId,
            playerOutId: outId,
          };
          return {
            roster,
            subs: [...s.subs, sub],
            // restart clock anchor
            clock: {
              ...s.clock,
              startedAtSec: s.clock.isRunning ? now : s.clock.startedAtSec,
            },
            tactics: s.tactics.map((slot) => {
              if (slot.playerId === outId) {
                return { ...slot, playerId: inId };
              } else if (slot.playerId === inId) {
                return { ...slot, playerId: undefined };
              } else {
                return slot;
              }
            }),
          };
        }),

      assignPlayerToSlot: (slotId, playerId) =>
        set((s) => {
          // Clear existing occurrence of this player from any slot, and set on target slot
          const tactics = s.tactics.map((slot) => ({ ...slot }));
          if (playerId) {
            for (const slot of tactics) {
              if (slot.playerId === playerId) slot.playerId = undefined;
            }
          }
          const idx = tactics.findIndex((sl) => sl.id === slotId);
          if (idx >= 0) tactics[idx].playerId = playerId;
          return { tactics };
        }),

      moveSlot: (slotId, x, y) =>
        set((s) => ({
          tactics: s.tactics.map((slot) =>
            slot.id === slotId ? { ...slot, x, y } : slot
          ),
        })),

      swapSlotPlayers: (slotAId, slotBId) =>
        set((s) => {
          const tactics = s.tactics.map((slot) => ({ ...slot }));
          const a = tactics.find((sl) => sl.id === slotAId);
          const b = tactics.find((sl) => sl.id === slotBId);
          if (!a || !b) return s;
          const tmp = a.playerId;
          a.playerId = b.playerId;
          b.playerId = tmp;
          return { tactics };
        }),

      benchPlayer: (playerId) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId ? { ...pl, isOnField: false } : pl
          ),
          tactics: s.tactics.map((slot) =>
            slot.playerId === playerId ? { ...slot, playerId: undefined } : slot
          ),
        })),

      setFormation: (formation) =>
        set((s) => {
          const tactics = createTacticsForFormation(formation);
          return {
            formation,
            tactics,
            roster: s.roster.map((p) => ({ ...p, isOnField: false })),
          };
        }),

      placePlayerInSlot: (slotId, playerId) =>
        set((s) => {
          const current = s.tactics.find((t) => t.id === slotId);
          const prevPlayerId = current?.playerId;
          const result: any = {};
          // assign slot
          const tactics = s.tactics.map((t) =>
            t.id === slotId
              ? { ...t, playerId }
              : t.playerId === playerId
              ? { ...t, playerId: undefined }
              : t
          );
          result.tactics = tactics;
          // perform sub semantics to update onField flags and minutes
          const now = Date.now() / 1000;
          let roster = s.roster;
          if (s.clock.isRunning && s.clock.startedAtSec) {
            const elapsed = now - s.clock.startedAtSec;
            roster = roster.map((pl) =>
              pl.isOnField
                ? { ...pl, minutesPlayedSec: pl.minutesPlayedSec + elapsed }
                : pl
            );
          }
          if (prevPlayerId) {
            roster = roster.map((pl) =>
              pl.id === prevPlayerId ? { ...pl, isOnField: false } : pl
            );
          }
          roster = roster.map((pl) =>
            pl.id === playerId ? { ...pl, isOnField: true } : pl
          );
          if (roster.filter((p) => p.isOnField).length > s.config.maxOnField) {
            roster = roster.map((pl) =>
              pl.id === playerId ? { ...pl, isOnField: false } : pl
            );
            console.warn(
              "Cannot place player: Maximum number of players on the field reached."
            );
            return s;
          }
          result.roster = roster;
          result.clock = {
            ...s.clock,
            startedAtSec: s.clock.isRunning ? now : s.clock.startedAtSec,
          };
          return result;
        }),

      benchPlayerFromSlot: (slotId) => {
        set((s) => {
          const slot = s.tactics.find((t) => t.id === slotId);
          if (!slot?.playerId) return s;
          const playerId = slot.playerId;
          get().benchPlayer(playerId);
          return get();
        });
      },

      swapSlots: (slotAId, slotBId) =>
        set((s) => {
          const tactics = s.tactics.map((slot) => ({ ...slot }));
          const a = tactics.find((sl) => sl.id === slotAId);
          const b = tactics.find((sl) => sl.id === slotBId);
          if (!a || !b) return s;
          const tmp = a.playerId;
          a.playerId = b.playerId;
          b.playerId = tmp;
          return { tactics };
        }),

      subBenchForSlot: (benchPlayerId, slotId) =>
        set((s) => {
          const prev = s.tactics.find((t) => t.id === slotId)?.playerId;
          const now = Date.now() / 1000;
          let roster = s.roster;
          if (s.clock.isRunning && s.clock.startedAtSec) {
            const elapsed = now - s.clock.startedAtSec;
            roster = roster.map((pl) =>
              pl.isOnField
                ? { ...pl, minutesPlayedSec: pl.minutesPlayedSec + elapsed }
                : pl
            );
          }
          if (prev) {
            roster = roster.map((pl) =>
              pl.id === prev ? { ...pl, isOnField: false } : pl
            );
          }
          roster = roster.map((pl) =>
            pl.id === benchPlayerId ? { ...pl, isOnField: true } : pl
          );
          if (roster.filter((p) => p.isOnField).length > s.config.maxOnField) {
            roster = roster.map((pl) =>
              pl.id === benchPlayerId ? { ...pl, isOnField: false } : pl
            );
          }
          const tactics = s.tactics.map((t) =>
            t.id === slotId
              ? { ...t, playerId: benchPlayerId }
              : t.playerId === benchPlayerId
              ? { ...t, playerId: undefined }
              : t
          );
          const sub: SubEvent = {
            id: uid(),
            timestampMs: now * 1000,
            playerInId: benchPlayerId,
            playerOutId: prev,
          };
          return {
            roster,
            tactics,
            subs: [...s.subs, sub],
            clock: {
              ...s.clock,
              startedAtSec: s.clock.isRunning ? now : s.clock.startedAtSec,
            },
          };
        }),

      getLiveMinutesSec: (playerId) => {
        const s = get();
        const pl = s.roster.find((p) => p.id === playerId);
        if (!pl) return 0;
        const base = pl.minutesPlayedSec;
        if (s.clock.isRunning && s.clock.startedAtSec && pl.isOnField) {
          return base + (Date.now() / 1000 - s.clock.startedAtSec);
        }
        return base;
      },

      getFormattedLiveMinutes: (playerId: string) => { // new
        const totalSeconds = get().getLiveMinutesSec(playerId);
        return formatClock(Math.floor(totalSeconds));
      },

      resetRoster: () => {
        set({ roster: [] });
      },

      resetMatchState: () =>
        set((s) => ({
          ...initialState,
          roster: s.roster.map((player) => ({
            ...player,
            minutesPlayedSec: 0,
            isOnField: false,
          })),
        })),
    }),
    {
      name: "soccer-manager",
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
      onRehydrateStorage: () => {
        // After rehydration, initialize tactics based on the persisted formation
        return (state, error) => {
          if (error) {
            console.error("An error occurred during rehydration:", error);
          } else if (state) {
            state.setFormation(state.formation);
          }
        };
      },
    }
  )
);
