/**
 * Events Hook
 *
 * Operations on events (actions and state changes over time)
 * in the 6-dimension ontology. Complete audit trail.
 *
 * @example
 * ```tsx
 * import { useEvent, useEvents } from '@/hooks/ontology/useEvent';
 *
 * function ActivityFeed() {
 *   const { events: recentEvents } = useEvents({ limit: 20 });
 *   const { record } = useEvent();
 *
 *   const handleCourseComplete = async (courseId) => {
 *     await record({
 *       type: 'course_completed',
 *       targetId: courseId,
 *       metadata: { completedAt: Date.now() }
 *     });
 *   };
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from '../useEffectRunner';
import { useIsProviderAvailable } from './useProvider';

/**
 * Event types (67+ types including inference and blockchain)
 */
export type EventType =
  // Core entity events
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'entity_published'
  | 'entity_archived'
  // Content events
  | 'blog_post_published'
  | 'blog_post_commented'
  | 'content_viewed'
  | 'content_shared'
  // User actions
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'user_profile_updated'
  // Course events
  | 'course_created'
  | 'course_enrolled'
  | 'course_started'
  | 'course_completed'
  | 'lesson_completed'
  // Token events
  | 'tokens_purchased'
  | 'tokens_transferred'
  | 'tokens_staked'
  // Transaction events
  | 'payment_received'
  | 'payment_failed'
  | 'refund_issued'
  // Inference events
  | 'inference_request'
  | 'inference_completed'
  | 'inference_failed'
  | 'inference_quota_exceeded'
  // Blockchain events
  | 'nft_minted'
  | 'nft_transferred'
  | 'tokens_bridged'
  // Community events
  | 'comment_created'
  | 'reaction_added'
  | 'member_joined'
  | 'member_left'
  | string; // Allow custom event types

/**
 * Event entity
 */
export interface Event {
  _id: Id<'events'>;
  _creationTime: number;
  type: EventType;
  actorId?: Id<'entities'>;
  targetId?: Id<'entities'>;
  timestamp: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt?: number;
}

/**
 * Input for recording a new event
 */
export interface RecordEventInput {
  type: EventType;
  actorId?: Id<'entities'>;
  targetId?: Id<'entities'>;
  metadata?: Record<string, any>;
}

/**
 * Filters for querying events
 */
export interface EventFilter {
  type?: EventType;
  actorId?: Id<'entities'>;
  targetId?: Id<'entities'>;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

/**
 * Hook for event operations (record, query)
 *
 * @returns Event operations and state
 *
 * @example
 * ```tsx
 * const { record, loading, error } = useEvent();
 *
 * const handleCourseEnroll = async (courseId) => {
 *   await record({
 *     type: 'course_enrolled',
 *     targetId: courseId,
 *     metadata: { enrolledAt: Date.now() }
 *   });
 * };
 * ```
 */
export function useEvent() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();

  /**
   * Record a new event
   */
  const record = useCallback(
    async (
      input: RecordEventInput,
      options?: {
        onSuccess?: (event: Event) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.events.record(input);
        return null as unknown as Event;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  return {
    record,
    loading,
    error,
  };
}

/**
 * Hook for listing/querying events
 *
 * @param filter - Event filters
 * @returns Events array and state
 *
 * @example
 * ```tsx
 * // Get recent activity
 * const { events: recent } = useEvents({ limit: 20 });
 *
 * // Get events for specific entity
 * const { events } = useEvents({ targetId: courseId });
 *
 * // Get events by actor (audit trail)
 * const { events } = useEvents({ actorId: userId });
 * ```
 */
export function useEvents(filter?: EventFilter) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setEvents([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.events.list(filter);
      return [] as Event[];
    });

    run(program, {
      onSuccess: (data) => setEvents(data),
    });
  }, [isProviderAvailable, filter?.type, filter?.actorId, filter?.targetId, run]);

  return {
    events,
    loading,
    error,
  };
}

/**
 * Hook for activity feed (recent events)
 *
 * @param limit - Number of events to fetch
 * @returns Recent events in chronological order
 *
 * @example
 * ```tsx
 * const { events: feed } = useActivityFeed(50);
 *
 * return (
 *   <div>
 *     {feed.map(event => (
 *       <EventCard key={event._id} event={event} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useActivityFeed(limit = 20) {
  return useEvents({
    limit,
    offset: 0,
  });
}

/**
 * Hook for entity audit trail (all events for an entity)
 *
 * @param targetId - Entity ID to audit
 * @returns All events for that entity
 *
 * @example
 * ```tsx
 * const { events: auditTrail } = useAuditTrail(courseId);
 * // Shows all changes, views, etc. for the course
 * ```
 */
export function useAuditTrail(targetId?: Id<'entities'>) {
  return useEvents({
    targetId,
    limit: 100,
  });
}

/**
 * Hook for user's action history
 *
 * @param userId - User ID
 * @returns All events performed by that user
 *
 * @example
 * ```tsx
 * const { events: history } = useUserHistory(userId);
 * // Shows everything this user has done
 * ```
 */
export function useUserHistory(userId?: Id<'entities'>) {
  return useEvents({
    actorId: userId,
    limit: 100,
  });
}

/**
 * Hook for events of a specific type
 *
 * @param type - Event type to filter
 * @param limit - Number of events
 * @returns Events of that type
 *
 * @example
 * ```tsx
 * const { events: enrollments } = useEventsByType('course_enrolled', 50);
 * ```
 */
export function useEventsByType(type: EventType, limit = 20) {
  return useEvents({
    type,
    limit,
  });
}

/**
 * Hook for counting events (e.g., views, enrollments)
 *
 * @param type - Event type to count
 * @returns Count of events
 *
 * @example
 * ```tsx
 * const viewCount = useEventCount('content_viewed');
 * ```
 */
export function useEventCount(type: EventType): number {
  const { events } = useEventsByType(type, 1000);
  return events.length;
}

/**
 * Hook for timeline events (events within date range)
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Events in that time range
 *
 * @example
 * ```tsx
 * const start = new Date(2024, 0, 1).getTime();
 * const end = new Date(2024, 0, 31).getTime();
 * const { events: monthlyEvents } = useTimeline(start, end);
 * ```
 */
export function useTimeline(startTime: number, endTime: number) {
  return useEvents({
    startTime,
    endTime,
    limit: 1000,
  });
}

/**
 * Hook for real-time event streaming
 *
 * Subscribes to new events and updates feed in real-time
 *
 * @param filter - Event filters
 * @param onNewEvent - Callback when new event arrives
 * @returns Events array and subscription state
 *
 * @example
 * ```tsx
 * const { events, isSubscribed } = useEventStream(
 *   { type: 'course_completed' },
 *   (event) => toast.success(`${event.actorId} completed a course!`)
 * );
 * ```
 */
export function useEventStream(
  filter?: EventFilter,
  onNewEvent?: (event: Event) => void
) {
  const { events, loading, error } = useEvents(filter);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (onNewEvent) {
      // TODO: Implement with actual DataProvider WebSocket subscription
      // const unsubscribe = provider.events.subscribe(filter, onNewEvent);
      setIsSubscribed(true);

      // Cleanup
      // return () => {
      //   unsubscribe();
      //   setIsSubscribed(false);
      // };
    }
  }, [filter, onNewEvent]);

  return {
    events,
    loading,
    error,
    isSubscribed,
  };
}
