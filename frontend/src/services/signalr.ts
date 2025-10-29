import * as signalR from '@microsoft/signalr';
import type { Mission, Badge } from '../types';

const HUB_URL = 'http://localhost:5227/hubs/progress';

export type ProgressUpdateHandler = (mission: Mission) => void;
export type MissionCompletedHandler = (mission: Mission) => void;
export type BadgeEarnedHandler = (badge: Badge) => void;

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

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();

