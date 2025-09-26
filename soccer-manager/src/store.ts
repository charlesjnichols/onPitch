import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MatchState, Player, SubEvent, TacticsSlot } from "./types";
import { uid } from "./utils/uid";
import { formatClock } from "./utils/time";

export const formationLayouts = {
  "4-3-3": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    lcb: { gridArea: "lcb", order: 3 },
    rcb: { gridArea: "rcb", order: 4 },
    rb: { gridArea: "rb", order: 5 },
    lcm: { gridArea: "lcm", order: 6 },
    cm: { gridArea: "cm", order: 7 },
    rcm: { gridArea: "rcm", order: 8 },
    lw: { gridArea: "lw", order: 9 },
    rw: { gridArea: "rw", order: 10 },
    st: { gridArea: "st", order: 11 },
  },
  "4-4-2": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    lcb: { gridArea: "lcb", order: 3 },
    rcb: { gridArea: "rcb", order: 4 },
    rb: { gridArea: "rb", order: 5 },
    lw: { gridArea: "lw", order: 6 },
    cm1: { gridArea: "cm1", order: 7 },
    cm2: { gridArea: "cm2", order: 8 },
    rw: { gridArea: "rw", order: 9 },
    st1: { gridArea: "st1", order: 10 },
    st2: { gridArea: "st2", order: 11 },
  },
  "3-5-2": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    cb: { gridArea: "cb", order: 3 },
    rb: { gridArea: "rb", order: 4 },
    cdm: { gridArea: "cdm", order: 5 },
    lcm: { gridArea: "lcm", order: 6 },
    cm1: { gridArea: "cm1", order: 7 },
    cm2: { gridArea: "cm2", order: 8 },
    rcm: { gridArea: "rcm", order: 9 },
    st1: { gridArea: "st1", order: 10 },
    st2: { gridArea: "st2", order: 11 },
  },
  "4-4-2 (Diamond)": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    lcb: { gridArea: "lcb", order: 3 },
    rcb: { gridArea: "rcb", order: 4 },
    rb: { gridArea: "rb", order: 5 },
    cdm: { gridArea: "cdm", order: 6 },
    lw: { gridArea: "lw", order: 7 },
    rw: { gridArea: "rw", order: 8 },
    cam: { gridArea: "cam", order: 9 },
    st1: { gridArea: "st1", order: 10 },
    st2: { gridArea: "st2", order: 11 },
  },
  "4-3-1 (9)": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    lcb: { gridArea: "lcb", order: 3 },
    rcb: { gridArea: "rcb", order: 4 },
    rb: { gridArea: "rb", order: 5 },
    cdm: { gridArea: "cdm", order: 6 },
    lw: { gridArea: "lw", order: 7 },
    rw: { gridArea: "rw", order: 8 },
    st1: { gridArea: "st1", order: 9 },
  },
  "3-2-3 (9)": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    cb: { gridArea: "cb", order: 3 },
    rb: { gridArea: "rb", order: 4 },
    cm1: { gridArea: "cm1", order: 5 },
    cm2: { gridArea: "cm2", order: 6 },
    lw: { gridArea: "lw", order: 7 },
    rw: { gridArea: "rw", order: 8 },
    st1: { gridArea: "st1", order: 9 },
  },
  "3-1-3-1 (9)": {
    gk: { gridArea: "gk", order: 1 },
    lb: { gridArea: "lb", order: 2 },
    cb: { gridArea: "cb", order: 3 },
    rb: { gridArea: "rb", order: 4 },
    cdm: { gridArea: "cdm", order: 5 },
    lw: { gridArea: "lw", order: 6 },
    rw: { gridArea: "rw", order: 7 },
    cm: { gridArea: "cm", order: 8 },
    st1: { gridArea: "st1", order: 9 },
  },
};

export type FormationId = keyof typeof formationLayouts;

export const FORMATION_LAYOUTS = formationLayouts as Record<
  FormationId,
  Record<string, { gridArea: string; order: number }>
>;

const createTacticsForFormation = (formation: FormationId): TacticsSlot[] => {
  const layout = FORMATION_LAYOUTS[formation];
  if (!layout) return [];

  return Object.entries(layout).map(([id, pos]) => ({
    id,
    gridArea: pos.gridArea,
    playerId: undefined,
  }));
};

interface SubstitutionRequest {
  inId: string;
  outId?: string;
}

interface ClockState {
  isRunning: boolean;
  startedAtSec?: number;
  accumulatedSec: number;
}

export interface AppStore extends MatchState {
  getFormattedLiveMinutes(id: string): any;
  addPlayer: (p: Omit<Player, "id"> & { id?: string }) => void;
  updatePlayer: (id: string, patch: Partial<Omit<Player, "id">>) => void;
  removePlayer: (id: string) => void;
  toggleStarter: (id: string, isOnField: boolean) => void;

  // clock
  startClock: () => void;
  pauseClock: () => void;
  resetClock: () => void;
  setClock: (newTimeInSeconds: number) => void;
  makeSub: (inId: string, outId?: string) => void;
  assignPlayerToSlot: (slotId: string, playerId?: string) => void;
  moveSlot: (slotId: string, x: number, y: number) => void;
  swapSlotPlayers: (slotAId: string, slotBId: string) => void;
  benchPlayer: (playerId: string) => void;
  setFormation: (formation: FormationId) => void;
  placePlayerInSlot: (slotId: string, playerId: string) => void;
  benchPlayerFromSlot: (slotId: string) => void;
  swapSlots: (slotAId: string, slotBId: string) => void;
  subBenchForSlot: (benchPlayerId: string, slotId: string) => void;
  getLiveMinutesSec: (playerId: string) => number;
  resetMatchState: () => void;
  resetRoster: () => void;
  substitutionQueue: SubstitutionRequest[];
  enqueueSub: (sub: SubstitutionRequest) => void;
  cancelSub: (sub: SubstitutionRequest) => void;
  performSubs: () => void;
  subClock: ClockState;
  gameClock: ClockState;
  resetSubClock: () => void;
  setConfig: (patch: Partial<MatchState["config"]>) => void;
  recordShot: (playerId: string) => void;
  decrementShot: (playerId: string) => void;
  recordPass: (playerId: string) => void;
  decrementPass: (playerId: string) => void;
  recordSave: (playerId: string) => void;
  decrementSave: (playerId: string) => void;
}

const initialState: MatchState = {
  roster: [],
  subs: [],
  tactics: [],
  formation: "4-3-3",
  clock: { isRunning: false, accumulatedSec: 0 },
  config: { maxOnField: 11, rotationIntervalMinutes: 10, matchTimeMinutes: 90 },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      substitutionQueue: [],
      subClock: { isRunning: false, accumulatedSec: 0 },
      gameClock: { isRunning: false, accumulatedSec: 0 },

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
            shots: 0,
            passes: 0,
            saves: 0,
          };
          return { roster: [...s.roster, player] };
        }),

      updatePlayer: (id, patch) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === id ? { ...pl, ...patch } : pl,
          ),
        })),

      removePlayer: (id) =>
        set((s) => ({
          roster: s.roster.filter((pl) => pl.id !== id),
          tactics: s.tactics.map((slot) =>
            slot.playerId === id ? { ...slot, playerId: undefined } : slot,
          ),
        })),

      toggleStarter: (id, isOnField) =>
        set((s) => {
          const currentOn = s.roster.filter((p) => p.isOnField).length;
          if (isOnField && currentOn >= s.config.maxOnField) {
            console.warn(
              "Cannot add player: Maximum number of players on the field reached.",
            );
            return s;
          }
          return {
            roster: s.roster.map((pl) =>
              pl.id === id ? { ...pl, isOnField } : pl,
            ),
          };
        }),

      recordShot: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId ? { ...pl, shots: pl.shots + 1 } : pl,
          ),
        })),

      decrementShot: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId
              ? { ...pl, shots: Math.max(0, pl.shots - 1) }
              : pl,
          ),
        })),

      recordPass: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId ? { ...pl, passes: pl.passes + 1 } : pl,
          ),
        })),

      decrementPass: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId
              ? { ...pl, passes: Math.max(0, pl.passes - 1) }
              : pl,
          ),
        })),

      recordSave: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId ? { ...pl, saves: pl.saves + 1 } : pl,
          ),
        })),

      decrementSave: (playerId: string) =>
        set((s) => ({
          roster: s.roster.map((pl) =>
            pl.id === playerId
              ? { ...pl, saves: Math.max(0, pl.saves - 1) }
              : pl,
          ),
        })),

      startClock: () =>
        set((s) => {
          const now = Date.now() / 1000;
          return s.clock.isRunning
            ? s
            : {
                clock: {
                  ...s.clock,
                  isRunning: true,
                  startedAtSec: now,
                },
                subClock: {
                  ...s.subClock,
                  isRunning: true,
                  startedAtSec: now,
                },
                gameClock: {
                  ...s.gameClock,
                  isRunning: true,
                  startedAtSec: now,
                },
              };
        }),

      pauseClock: () =>
        set((s) => {
          if (
            !s.clock.isRunning ||
            s.clock.startedAtSec == null ||
            s.subClock.startedAtSec == null ||
            s.gameClock.startedAtSec == null
          )
            return s;
          const now = Date.now() / 1000;
          const elapsed = now - s.clock.startedAtSec;
          const subElapsed = now - s.subClock.startedAtSec;
          return {
            clock: {
              ...s.clock,
              isRunning: false,
              startedAtSec: undefined,
              accumulatedSec: s.clock.accumulatedSec + elapsed,
            },
            subClock: {
              ...s.subClock,
              isRunning: false,
              startedAtSec: s.subClock.startedAtSec,
              accumulatedSec: s.subClock.accumulatedSec + subElapsed,
            },
            gameClock: {
              ...s.gameClock,
              isRunning: false,
              startedAtSec: s.gameClock.startedAtSec,
              accumulatedSec: s.gameClock.accumulatedSec + subElapsed,
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
          subClock: {
            isRunning: false,
            startedAtSec: undefined,
            accumulatedSec: 0,
          },
          gameClock: {
            isRunning: false,
            startedAtSec: undefined,
            accumulatedSec: 0,
          },
        })),
      setClock: (newTimeInSeconds) =>
        set(() => ({
          clock: {
            isRunning: false,
            startedAtSec: undefined,
            accumulatedSec: newTimeInSeconds,
          },
        })),

      resetSubClock: () =>
        set((s) => ({
          subClock: {
            isRunning: s.subClock.isRunning,
            startedAtSec: Date.now() / 1000,
            accumulatedSec: 0,
          },
        })),

      makeSub: (inId, outId) =>
        set((s) => {
          const now = Date.now() / 1000;
          let roster = s.roster;
          let newClockStartedAtSec = s.clock.startedAtSec; // Default to current

          // Step 1: Accumulate minutes for all players currently ON FIELD
          // This "snapshots" their time played up to this exact moment of substitution.
          if (s.clock.isRunning && s.clock.startedAtSec) {
            const elapsedSinceLastClockStart = now - s.clock.startedAtSec;
            roster = roster.map((pl) =>
              pl.isOnField
                ? {
                    ...pl,
                    minutesPlayedSec:
                      pl.minutesPlayedSec + elapsedSinceLastClockStart,
                  }
                : pl,
            );
            // If the clock is running, reset its 'startedAtSec' to 'now'
            // so all currently on-field players (including the new one) start fresh
            // for live calculation from this moment.
            newClockStartedAtSec = now;
          }

          // Step 2: Update the isOnField status for players involved in the sub
          if (outId) {
            roster = roster.map((pl) =>
              pl.id === outId ? { ...pl, isOnField: false } : pl,
            );
          }
          roster = roster.map((pl) =>
            pl.id === inId ? { ...pl, isOnField: true } : pl,
          );

          // Step 3: Enforce maxOnField rule
          const onFieldCount = roster.filter((p) => p.isOnField).length;
          if (onFieldCount > s.config.maxOnField) {
            // Revert the playerIn if it violates the maxOnField rule
            roster = roster.map((pl) =>
              pl.id === inId ? { ...pl, isOnField: false } : pl,
            );
            console.warn(
              "Cannot sub player: Maximum number of players on the field reached. Reverting substitution for player in.",
            );
            // If the sub is reverted, the clock startedAtSec should also revert
            // to what it was before this attempted sub, if it was running.
            // This case needs careful consideration: if the sub is invalid,
            // we should technically revert the `minutesPlayedSec` snapshot too.
            // For simplicity, we'll just prevent the `isOnField` change and `startedAtSec` update
            // if the `maxOnField` rule is violated.
            // Since we've already snapshot for *all* players, we need to undo this specific part.
            // A more robust solution might defer accumulation until after validation.
            // For now, let's just make sure the `startedAtSec` isn't updated.
            newClockStartedAtSec = s.clock.startedAtSec; // Revert startedAtSec
            return s; // Return current state without applying the invalid sub
          }

          // Step 4: Create the substitution event
          const sub: SubEvent = {
            id: uid(),
            timestampMs: now * 1000,
            playerInId: inId,
            playerOutId: outId,
          };

          // Step 5: Update tactics to reflect the player change in the formation
          const tactics = s.tactics.map((slot) => {
            // If the slot had the player who is going out, put the new player in.
            // If the slot had the player who is coming in (meaning they were already on field elsewhere),
            // clear that slot.
            if (slot.playerId === outId) {
              return { ...slot, playerId: inId };
            } else if (slot.playerId === inId) {
              // This handles cases where a player is swapped from one tactical slot to another
              // (e.g., inId was already in a slot, now it's moving to the outId's slot).
              // So we clear the original slot of inId.
              return { ...slot, playerId: undefined };
            } else {
              return slot;
            }
          });

          return {
            roster,
            subs: [...s.subs, sub],
            tactics,
            clock: {
              ...s.clock,
              startedAtSec: newClockStartedAtSec, // Use the potentially updated startedAtSec
            },
          };
        }),

      assignPlayerToSlot: (slotId, playerId) =>
        set((s) => {
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
            slot.id === slotId ? { ...slot, x, y } : slot,
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
            pl.id === playerId ? { ...pl, isOnField: false } : pl,
          ),
          tactics: s.tactics.map((slot) =>
            slot.playerId === playerId
              ? { ...slot, playerId: undefined }
              : slot,
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
          const tactics = s.tactics.map((t) =>
            t.id === slotId
              ? { ...t, playerId }
              : t.playerId === playerId
                ? { ...t, playerId: undefined }
                : t,
          );
          result.tactics = tactics;
          const now = Date.now() / 1000;
          let roster = s.roster;
          if (s.clock.isRunning && s.clock.startedAtSec) {
            const elapsed = now - s.clock.startedAtSec;
            roster = roster.map((pl) =>
              pl.isOnField
                ? { ...pl, minutesPlayedSec: pl.minutesPlayedSec + elapsed }
                : pl,
            );
          }
          if (prevPlayerId) {
            roster = roster.map((pl) =>
              pl.id === prevPlayerId ? { ...pl, isOnField: false } : pl,
            );
          }
          roster = roster.map((pl) =>
            pl.id === playerId ? { ...pl, isOnField: true } : pl,
          );
          if (roster.filter((p) => p.isOnField).length > s.config.maxOnField) {
            roster = roster.map((pl) =>
              pl.id === playerId ? { ...pl, isOnField: false } : pl,
            );
            console.warn(
              "Cannot place player: Maximum number of players on the field reached.",
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
                : pl,
            );
          }
          if (prev) {
            roster = roster.map((pl) =>
              pl.id === prev ? { ...pl, isOnField: false } : pl,
            );
          }
          roster = roster.map((pl) =>
            pl.id === benchPlayerId ? { ...pl, isOnField: true } : pl,
          );
          if (roster.filter((p) => p.isOnField).length > s.config.maxOnField) {
            roster = roster.map((pl) =>
              pl.id === benchPlayerId ? { ...pl, isOnField: false } : pl,
            );
          }
          const tactics = s.tactics.map((t) =>
            t.id === slotId
              ? { ...t, playerId: benchPlayerId }
              : t.playerId === benchPlayerId
                ? { ...t, playerId: undefined }
                : t,
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

      getFormattedLiveMinutes: (playerId: string) => {
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
            shots: 0,
            passes: 0,
            saves: 0,
          })),
          config: s.config,
        })),

      enqueueSub: (sub) =>
        set((state) => {
          const { inId, outId } = sub;
          let newQueue = [...state.substitutionQueue];

          // Cancel existing subs involving the incoming player
          newQueue = newQueue.filter(
            (existingSub) =>
              existingSub.inId !== inId && existingSub.outId !== inId,
          );

          if (outId) {
            // Cancel existing subs involving the outgoing player
            newQueue = newQueue.filter(
              (existingSub) =>
                existingSub.inId !== outId && existingSub.outId !== outId,
            );
          }

          return { substitutionQueue: [...newQueue, sub] };
        }),

      cancelSub: (subToRemove) =>
        set((state) => ({
          substitutionQueue: state.substitutionQueue.filter(
            (sub) => sub !== subToRemove,
          ),
        })),

      performSubs: () => {
        const { makeSub, substitutionQueue } = get();
        substitutionQueue.forEach((sub) => {
          makeSub(sub.inId, sub.outId);
        });
        set({ substitutionQueue: [] });
      },
      setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
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
    },
  ),
);
