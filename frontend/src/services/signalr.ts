import * as signalR from '@microsoft/signalr';
import type { Mission, Badge } from '../types';
import type { Bonus } from '../types/bonus';
import type { MiniGame, MiniGamePrize } from '../types/minigame';
import type { JackpotWinner, JackPotTemperature } from '../types/jackpot';

const HUB_URL = 'http://localhost:5227/hubs/progress';

export type ProgressUpdateHandler = (mission: Mission) => void;
export type MissionCompletedHandler = (mission: Mission) => void;
export type BadgeEarnedHandler = (badge: Badge) => void;
export type BonusIssuedHandler = (bonus: Bonus) => void;
export type BonusClaimedHandler = (bonus: Bonus) => void;
export type BonusExpiredHandler = (data: { bonusId: string }) => void;
export type MiniGamePlayedHandler = (game: MiniGame) => void;
export type MiniGamePrizeWonHandler = (data: { game: MiniGame; prize: MiniGamePrize }) => void;
export type MiniGameJackpotWonHandler = (data: { userId: string; game: MiniGame; jackpotAmount: number }) => void;

// Jackpot event handlers
export type JackpotPoolUpdatedHandler = (data: {
  templateId: number;
  currentPotJp: number;
  currentPotUser: number;
  registrationCount: number;
  timestamp: number;
}) => void;

export type JackpotTemperatureChangedHandler = (data: {
  templateId: number;
  temperature: JackPotTemperature;
  currentPot: number;
  timestamp: number;
}) => void;

export type JackpotExplodedHandler = (data: {
  templateId: number;
  jackpotName: string;
  finalPot: number;
  winnerCount: number;
  timestamp: number;
}) => void;

export type JackpotWinnerAnnouncedHandler = (data: {
  templateId: number;
  jackpotName: string;
  winner: JackpotWinner;
  timestamp: number;
}) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async connect(userId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?userId=${userId}`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
          return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection event handlers
    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
    });

    this.connection.onclose((error) => {
      console.error('SignalR connection closed:', error);
    });

    try {
      await this.connection.start();
      console.log('✅ SignalR connected successfully');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error disconnecting SignalR:', error);
      }
      this.connection = null;
    }
  }

  onMissionProgressUpdated(handler: ProgressUpdateHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('MissionProgressUpdated', (mission: Mission) => {
      console.log('📊 Mission progress updated:', mission);
      handler(mission);
    });
  }

  onMissionCompleted(handler: MissionCompletedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('MissionCompleted', (mission: Mission) => {
      console.log('🎉 Mission completed:', mission);
      handler(mission);
    });
  }

  onBadgeEarned(handler: BadgeEarnedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('BadgeEarned', (badge: Badge) => {
      console.log('🏆 Badge earned:', badge);
      handler(badge);
    });
  }

  onBonusIssued(handler: BonusIssuedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('BonusIssued', (bonus: Bonus) => {
      console.log('🎁 Bonus issued:', bonus);
      handler(bonus);
    });
  }

  onBonusClaimed(handler: BonusClaimedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('BonusClaimed', (bonus: Bonus) => {
      console.log('✅ Bonus claimed:', bonus);
      handler(bonus);
    });
  }

  onBonusExpired(handler: BonusExpiredHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('BonusExpired', (data: { bonusId: string }) => {
      console.log('⏰ Bonus expired:', data);
      handler(data);
    });
  }

  onMiniGamePlayed(handler: MiniGamePlayedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('MiniGamePlayed', (game: MiniGame) => {
      console.log('🎮 Mini game played:', game);
      handler(game);
    });
  }

  onMiniGamePrizeWon(handler: MiniGamePrizeWonHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('MiniGamePrizeWon', (data: { game: MiniGame; prize: MiniGamePrize }) => {
      console.log('🏆 Mini game prize won:', data);
      handler(data);
    });
  }

  onMiniGameJackpotWon(handler: MiniGameJackpotWonHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('MiniGameJackpotWon', (data: { userId: string; game: MiniGame; jackpotAmount: number }) => {
      console.log('💰 JACKPOT WON!', data);
      handler(data);
    });
  }

  // ========== JACKPOT EVENTS ==========

  onJackpotPoolUpdated(handler: JackpotPoolUpdatedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('JackpotPoolUpdated', (data: {
      templateId: number;
      currentPotJp: number;
      currentPotUser: number;
      registrationCount: number;
      timestamp: number;
    }) => {
      console.log('🎰 Jackpot pool updated:', data);
      handler(data);
    });
  }

  onJackpotTemperatureChanged(handler: JackpotTemperatureChangedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('JackpotTemperatureChanged', (data: {
      templateId: number;
      temperature: JackPotTemperature;
      currentPot: number;
      timestamp: number;
    }) => {
      console.log('🌡️ Jackpot temperature changed:', data);
      handler(data);
    });
  }

  onJackpotExploded(handler: JackpotExplodedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('JackpotExploded', (data: {
      templateId: number;
      jackpotName: string;
      finalPot: number;
      winnerCount: number;
      timestamp: number;
    }) => {
      console.log('💥 JACKPOT EXPLODED!', data);
      handler(data);
    });
  }

  onJackpotWinnerAnnounced(handler: JackpotWinnerAnnouncedHandler): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('JackpotWinnerAnnounced', (data: {
      templateId: number;
      jackpotName: string;
      winner: JackpotWinner;
      timestamp: number;
    }) => {
      console.log('🏆 Jackpot winner announced:', data);
      handler(data);
    });
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();

