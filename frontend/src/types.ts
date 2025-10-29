// Type definitions matching backend C# models

export enum AchievementType {
  Mission = 1,
  Badge = 2,
}

export enum AchievementStatus {
  Available = 0,
  Active = 1,
  Completed = 2,
  Expired = 3,
  Locked = 4,
  Claimed = 5,
}

export interface MissionTask {
  id: string;
  description: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  isCompleted: boolean;
  order: number;
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  type: AchievementType;
  status: AchievementStatus;
  progress: number;
  tasks: MissionTask[];
  rewardAmount?: number;
  rewardCurrency?: string;
  expiresAt?: string;
  isRecurring: boolean;
  completionCount: number;
  category?: string;
  relatedGames: string[];
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  type: AchievementType;
  status: AchievementStatus;
  progress: number;
  isEarned: boolean;
  earnedAt?: string;
  category?: string;
  completionCriteria?: string;
}

export interface MissionOptInResult {
  success: boolean;
  message: string;
  mission?: Mission;
  errorCode?: string;
}

export interface MissionClaimResult {
  success: boolean;
  message: string;
  rewardAmount?: number;
  rewardCurrency?: string;
  mission?: Mission;
  errorCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

