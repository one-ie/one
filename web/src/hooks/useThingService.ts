import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from './useEffectRunner';

/**
 * Type definitions for Thing operations
 * These match the backend ontology schema
 */
export type ThingType =
  | 'creator'
  | 'audience_member'
  | 'ai_clone'
  | 'course'
  | 'blog_post'
  | 'token'
  | 'product'
  // ... add all 66 thing types as needed
  | string;

export type ThingStatus = 'draft' | 'active' | 'published' | 'archived' | 'inactive';

export interface Thing {
  _id: Id<'entities'>;
  _creationTime: number;
  type: ThingType;
  name: string;
  properties: Record<string, any>;
  status?: ThingStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface CreateThingArgs {
  type: ThingType;
  name: string;
  properties: Record<string, any>;
  status?: ThingStatus;
  organizationId?: Id<'entities'>;
}

export interface UpdateThingArgs {
  id: Id<'entities'>;
  name?: string;
  properties?: Record<string, any>;
  status?: ThingStatus;
}

export interface ListThingsArgs {
  type?: ThingType;
  status?: ThingStatus;
  organizationId?: Id<'entities'>;
  limit?: number;
  offset?: number;
}

/**
 * Hook for accessing Thing-related services
 *
 * Provides type-safe access to CRUD operations on entities
 * following the 6-dimension ontology pattern.
 *
 * @example
 * ```tsx
 * const { list, create, update, loading } = useThingService();
 *
 * // List courses
 * useEffect(() => {
 *   list({ type: 'course', status: 'published' }, {
 *     onSuccess: (courses) => setCourses(courses)
 *   });
 * }, []);
 *
 * // Create a new course
 * const handleCreate = () => {
 *   create({
 *     type: 'course',
 *     name: 'My Course',
 *     properties: { description: '...' }
 *   }, {
 *     onSuccess: (id) => navigate(`/courses/${id}`)
 *   });
 * };
 * ```
 */
export function useThingService() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const [things, setThings] = useState<Thing[]>([]);

  /**
   * List things by type, status, or organization
   */
  const list = useCallback(
    async (
      args: ListThingsArgs,
      options?: {
        onSuccess?: (things: Thing[]) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      // This would call the backend via DataProvider
      // For now, this is a placeholder that shows the pattern
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.things.list(args);

        // Placeholder - in real implementation, this calls backend
        return [] as Thing[];
      });

      return run(program, {
        onSuccess: (result) => {
          setThings(result);
          options?.onSuccess?.(result);
        },
        onError: options?.onError,
      });
    },
    [run]
  );

  /**
   * Get a single thing by ID
   */
  const get = useCallback(
    async (
      id: Id<'entities'>,
      options?: {
        onSuccess?: (thing: Thing) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.things.get(id);

        return null as unknown as Thing;
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Create a new thing
   */
  const create = useCallback(
    async (
      args: CreateThingArgs,
      options?: {
        onSuccess?: (id: Id<'entities'>) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.things.create(args);

        return '' as Id<'entities'>;
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Update an existing thing
   */
  const update = useCallback(
    async (
      args: UpdateThingArgs,
      options?: {
        onSuccess?: (thing: Thing) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.things.update(args);

        return null as unknown as Thing;
      });

      return run(program, options);
    },
    [run]
  );

  /**
   * Delete (soft delete) a thing
   */
  const remove = useCallback(
    async (
      id: Id<'entities'>,
      options?: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      const program = Effect.gen(function* () {
        // TODO: Replace with actual DataProvider call
        // const dataProvider = yield* DataProvider;
        // return yield* dataProvider.things.delete(id);
      });

      return run(program, options);
    },
    [run]
  );

  return {
    list,
    get,
    create,
    update,
    remove,
    things,
    loading,
    error,
  };
}

/**
 * Hook for a specific thing type with type narrowing
 *
 * @example
 * ```tsx
 * const { things: courses, create } = useThingsByType('course');
 * ```
 */
export function useThingsByType<T extends ThingType>(type: T) {
  const service = useThingService();
  const [typedThings, setTypedThings] = useState<Thing[]>([]);

  useEffect(() => {
    service.list({ type }, {
      onSuccess: setTypedThings
    });
  }, [type]);

  return {
    ...service,
    things: typedThings,
  };
}
