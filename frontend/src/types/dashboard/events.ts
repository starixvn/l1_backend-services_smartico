/**
 * SignalR event types for real-time dashboard updates.
 * These events are broadcast via the existing /hubs/progress hub.
 */

import type { Achievement, UserCounters } from './data';

/**
 * Level-up event payload
 */
export interface LevelUpEvent {
  newLevel: number;
  xpGained: number;
  rewards?: {
    coins?: number;
    gems?: number;
    diamonds?: number;
  };
}

/**
 * Mission progress update event payload
 */
export interface MissionProgressEvent {
  missionId: number;
  progress: number; // Percentage (0-100)
  currentValue: number;
  targetValue: number;
}

/**
 * Mission completion event payload
 */
export interface MissionCompleteEvent {
  missionId: number;
  rewardPoints: number;
  xpEarned?: number;
}

/**
 * Achievement earned event payload
 */
export interface AchievementEarnedEvent {
  achievement: Achievement;
}

/**
 * Bonus claimed event payload
 */
export interface BonusClaimedEvent {
  bonusId: number;
  value: number;
  type: 'deposit' | 'cashback' | 'free-spins' | 'loyalty';
}

/**
 * Jackpot update event payload
 */
export interface JackpotUpdateEvent {
  jackpotId: number;
  newPrizePool: number;
  tier?: 'mega' | 'mini' | 'major' | 'minor';
}

/**
 * Jackpot won event payload
 */
export interface JackpotWonEvent {
  jackpotId: number;
  username: string; // Anonymized
  amount: number;
  tier: 'mega' | 'mini' | 'major' | 'minor';
}

/**
 * Tournament rank change event payload
 */
export interface TournamentRankChangeEvent {
  tournamentId: number;
  newRank: number;
  totalParticipants: number;
}

/**
 * Counter update event payload
 */
export interface CounterUpdateEvent {
  counters: Partial<UserCounters>;
}

/**
 * Badge earned event payload
 */
export interface BadgeEarnedEvent {
  badgeId: number;
  badgeName: string;
  iconUrl?: string;
}

/**
 * Union type for all SignalR events
 */
export type SignalREvent =
  | { type: 'level-up'; data: LevelUpEvent }
  | { type: 'mission-progress'; data: MissionProgressEvent }
  | { type: 'mission-complete'; data: MissionCompleteEvent }
  | { type: 'achievement-earned'; data: AchievementEarnedEvent }
  | { type: 'bonus-claimed'; data: BonusClaimedEvent }
  | { type: 'jackpot-update'; data: JackpotUpdateEvent }
  | { type: 'jackpot-won'; data: JackpotWonEvent }
  | { type: 'tournament-rank-change'; data: TournamentRankChangeEvent }
  | { type: 'counter-update'; data: CounterUpdateEvent }
  | { type: 'badge-earned'; data: BadgeEarnedEvent };

/**
 * SignalR event handler type
 */
export type SignalREventHandler = (event: SignalREvent) => void;
