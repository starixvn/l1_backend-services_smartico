/**
 * SignalR Service
 * Manages SignalR connection for real-time updates.
 */

import * as signalR from '@microsoft/signalr';

/**
 * SignalR event handlers type.
 */
export type SignalREventHandler<T = unknown> = (data: T) => void;

/**
 * SignalR event types from backend.
 */
export interface SignalREvents {
  // Mission events
  'mission-progress': { missionId: number; progress: number; currentValue: number };
  'mission-complete': { missionId: number; reward: number };
  'mission-claimed': { missionId: number; reward: number };

  // Achievement events
  'achievement-unlocked': {
    achievementId: number;
    name: string;
    points: number;
    rarity: string;
  };

  // Level events
  'level-up': { newLevel: number; xpEarned: number };
  'xp-gained': { amount: number; currentXP: number; nextLevelXP: number };

  // Bonus events
  'bonus-available': { bonusId: number; name: string; value: number };
  'bonus-claimed': { bonusId: number; reward: number };

  // Leaderboard events
  'leaderboard-update': { userId: string; rank: number; points: number };

  // Tournament events
  'tournament-rank-update': { tournamentId: number; rank: number; points: number };
  'tournament-started': { tournamentId: number; name: string };
  'tournament-ended': { tournamentId: number; winnerId: string };

  // Jackpot events
  'jackpot-update': { templateId: number; amount: number };
  'jackpot-winner': { username: string; amount: number };

  // Mini game events
  'mini-game-result': { gameId: number; prizeId: number; prizeValue: number };

  // Generic progress event
  'progress-update': { type: string; data: unknown };
}

/**
 * SignalR connection state.
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

/**
 * SignalR service class.
 */
export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: Map<string, Set<SignalREventHandler>> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private stateChangeListeners: Set<(state: ConnectionState) => void> = new Set();

  /**
   * Initialize SignalR connection.
   */
  async connect(userId: string): Promise<void> {
    if (this.connection && this.connectionState === 'connected') {
      console.log('SignalR already connected');
      return;
    }

    const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5227/hubs/progress';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?userId=${userId}`, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then stop
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            return null; // Stop reconnecting
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up connection event handlers
    this.connection.onclose((error) => {
      console.log('SignalR connection closed', error);
      this.updateConnectionState('disconnected');
      this.reconnectAttempts = 0;
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error);
      this.updateConnectionState('reconnecting');
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId);
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;
    });

    // Register all event handlers
    this.registerEventHandlers();

    // Start connection
    try {
      this.updateConnectionState('connecting');
      await this.connection.start();
      this.updateConnectionState('connected');
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Failed to connect to SignalR', error);
      this.updateConnectionState('failed');
      throw error;
    }
  }

  /**
   * Disconnect from SignalR.
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.updateConnectionState('disconnected');
    }
  }

  /**
   * Subscribe to an event.
   */
  on<K extends keyof SignalREvents>(
    event: K,
    handler: SignalREventHandler<SignalREvents[K]>
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as SignalREventHandler);
  }

  /**
   * Unsubscribe from an event.
   */
  off<K extends keyof SignalREvents>(
    event: K,
    handler: SignalREventHandler<SignalREvents[K]>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as SignalREventHandler);
    }
  }

  /**
   * Listen for connection state changes.
   */
  onStateChange(listener: (state: ConnectionState) => void): void {
    this.stateChangeListeners.add(listener);
  }

  /**
   * Remove connection state change listener.
   */
  offStateChange(listener: (state: ConnectionState) => void): void {
    this.stateChangeListeners.delete(listener);
  }

  /**
   * Get current connection state.
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Update connection state and notify listeners.
   */
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.stateChangeListeners.forEach((listener) => listener(state));
  }

  /**
   * Register all event handlers with SignalR connection.
   */
  private registerEventHandlers(): void {
    if (!this.connection) return;

    // Register handlers for all possible events
    const eventNames = [
      'mission-progress',
      'mission-complete',
      'mission-claimed',
      'achievement-unlocked',
      'level-up',
      'xp-gained',
      'bonus-available',
      'bonus-claimed',
      'leaderboard-update',
      'tournament-rank-update',
      'tournament-started',
      'tournament-ended',
      'jackpot-update',
      'jackpot-winner',
      'mini-game-result',
      'progress-update',
    ];

    eventNames.forEach((event) => {
      this.connection!.on(event, (data) => {
        console.log(`SignalR event: ${event}`, data);
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      });
    });
  }

  /**
   * Invoke a server method (for future use).
   */
  async invoke<T = void>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.connection || this.connectionState !== 'connected') {
      throw new Error('SignalR connection not established');
    }
    return this.connection.invoke<T>(methodName, ...args);
  }
}

/**
 * Singleton instance of SignalR service.
 */
export const signalrService = new SignalRService();
