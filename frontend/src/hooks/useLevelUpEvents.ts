/**
 * useLevelUpEvents Hook
 * T063: Custom hook for managing level-up events and celebrations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VelocityService } from '../services/velocityService';
import type { LevelUpEvent } from '../types/velocity';

/**
 * Return type for useLevelUpEvents hook.
 */
export interface UseLevelUpEventsReturn {
  /** Unacknowledged level-up events */
  events: LevelUpEvent[];
  /** Current event being displayed */
  currentEvent: LevelUpEvent | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Acknowledge the current event and move to next */
  acknowledgeCurrentEvent: () => Promise<void>;
  /** Dismiss current event without acknowledging */
  dismissCurrentEvent: () => void;
  /** Manually refetch events */
  refetch: () => Promise<void>;
  /** Whether there are pending events */
  hasPendingEvents: boolean;
}

/**
 * Options for useLevelUpEvents hook.
 */
export interface UseLevelUpEventsOptions {
  /** User ID to fetch events for */
  userId: string;
  /** Whether to enable automatic polling */
  enablePolling?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Whether to automatically show events */
  autoShow?: boolean;
}

/**
 * Custom hook for managing level-up events.
 *
 * @param options - Hook options
 * @returns Level-up events state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   currentEvent,
 *   acknowledgeCurrentEvent,
 *   hasPendingEvents,
 * } = useLevelUpEvents({ userId: 'demo-user' });
 *
 * if (currentEvent) {
 *   return <LevelUpCelebration event={currentEvent} onAcknowledge={acknowledgeCurrentEvent} />;
 * }
 * ```
 */
export function useLevelUpEvents(options: UseLevelUpEventsOptions): UseLevelUpEventsReturn {
  const {
    userId,
    enablePolling = true,
    pollingInterval = 30000, // 30 seconds
    autoShow = true,
  } = options;

  const [events, setEvents] = useState<LevelUpEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetches level-up events from the API.
   */
  const fetchEvents = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const events = await VelocityService.getLevelUpEvents(userId);

      if (!isMountedRef.current) return;

      // Filter to only unacknowledged events
      const unacknowledgedEvents = events.filter(e => !e.acknowledged);
      setEvents(unacknowledgedEvents);

      // Reset index if current index is out of bounds
      setCurrentEventIndex(prevIndex =>
        prevIndex >= unacknowledgedEvents.length ? 0 : prevIndex
      );
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch level-up events'));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  /**
   * Acknowledges the current event via API.
   */
  const acknowledgeCurrentEvent = useCallback(async () => {
    const currentEvent = events[currentEventIndex];
    if (!currentEvent || isAcknowledging) return;

    setIsAcknowledging(true);

    try {
      await VelocityService.acknowledgeLevelUp(currentEvent.id, userId);

      if (!isMountedRef.current) return;

      // Remove acknowledged event from list
      setEvents(prevEvents =>
        prevEvents.filter(e => e.id !== currentEvent.id)
      );

      // Adjust index if needed
      setCurrentEventIndex(prevIndex =>
        prevIndex >= events.length - 1 ? 0 : prevIndex
      );
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to acknowledge level-up'));
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsAcknowledging(false);
      }
    }
  }, [events, currentEventIndex, isAcknowledging, userId]);

  /**
   * Dismisses current event without acknowledging (moves to next).
   */
  const dismissCurrentEvent = useCallback(() => {
    setCurrentEventIndex(prevIndex =>
      prevIndex >= events.length - 1 ? 0 : prevIndex + 1
    );
  }, [events.length]);

  /**
   * Manual refetch function.
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchEvents();
  }, [fetchEvents]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    fetchEvents();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvents]);

  // Polling setup
  useEffect(() => {
    if (!enablePolling || !userId) return;

    pollingRef.current = setInterval(fetchEvents, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [enablePolling, pollingInterval, fetchEvents, userId]);

  // Derived state
  const currentEvent = autoShow && events.length > 0 ? events[currentEventIndex] ?? null : null;
  const hasPendingEvents = events.length > 0;

  return {
    events,
    currentEvent,
    isLoading,
    error,
    acknowledgeCurrentEvent,
    dismissCurrentEvent,
    refetch,
    hasPendingEvents,
  };
}
