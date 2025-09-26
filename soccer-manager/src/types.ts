import type { FormationId } from "./store";

export type PositionTag =
  | 'GK' | 'LB' | 'RB' | 'CB' | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM'
  | 'LW' | 'RW' | 'CF' | 'ST';

export interface Player {
  id: string;
  name: string;
  number?: number;
  positionTags: PositionTag[];
  isOnField: boolean;
  minutesPlayedSec: number;
}

export interface SubEvent {
  id: string;
  timestampMs: number;
  playerOutId?: string;
  playerInId: string;
  note?: string;
}

export interface MatchConfig {
  maxOnField: number; // default 11
  rotationIntervalMinutes: number; // banner reminder
  matchTimeMinutes: number;
}

export interface MatchClockState {
  isRunning: boolean;
  // Epoch ms when the clock last started (for background-safe tracking)
  startedAtSec?: number;
  // Total accumulated ms while paused
  accumulatedSec: number;
}

export interface TacticsSlot {
  id: string;
  x: number; // 0..1 from left
  y: number; // 0..1 from top
  playerId?: string;
}

export interface MatchState {
  roster: Player[];
  subs: SubEvent[];
  tactics: TacticsSlot[];
  formation: FormationId;
  clock: MatchClockState;
  config: MatchConfig;
}