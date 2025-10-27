/**
 * Things Hook
 *
 * Operations on entities (things) in the 6-dimension ontology.
 * Things represent all nouns: users, agents, content, products, courses, etc.
 *
 * @example
 * ```tsx
 * import { useThing, useThings } from '@/hooks/ontology/useThing';
 *
 * function CourseList() {
 *   const { things: courses, loading } = useThings({ type: 'course' });
 *   const { get, create } = useThing();
 *
 *   return (
 *     <div>
 *       {courses?.map(c => <CourseCard key={c._id} course={c} />)}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from '../useEffectRunner';
import { useIsProviderAvailable } from './useProvider';

/**
 * Base Thing entity (all 66+ types)
 */
export interface Thing {
  _id: Id<'entities'>;
  _creationTime: number;
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Input for creating a new thing
 */
export interface CreateThingInput {
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
}

/**
 * Input for updating a thing
 */
export interface UpdateThingInput {
  name?: string;
  properties?: Record<string, any>;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
}

/**
 * Filters for querying things
 */
export interface ThingFilter {
  type?: string;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * Hook for thing operations (get, list, create, update, delete)
 *
 * @returns Thing CRUD operations and state
 *
 * @example
 * ```tsx
 * const { get, create, update, remove, loading } = useThing();
 *
 * const handleCreate = async () => {
 *   const newCourse = await create({
 *     type: 'course',
 *     name: 'Introduction to React',
 *     properties: {
 *       description: 'Learn React basics',
 *       duration: '4 weeks'
 *     }
 *   });
 * };
 * ```
 */
export function useThing() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();

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
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.things.get(id);
        return null as unknown as Thing;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Create a new thing
   */
  const create = useCallback(
    async (
      input: CreateThingInput,
      options?: {
        onSuccess?: (thing: Thing) => void;
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
        // return yield* provider.things.create(input);
        return null as unknown as Thing;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Update an existing thing
   */
  const update = useCallback(
    async (
      id: Id<'entities'>,
      input: UpdateThingInput,
      options?: {
        onSuccess?: (thing: Thing) => void;
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
        // return yield* provider.things.update(id, input);
        return null as unknown as Thing;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
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
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.things.delete(id);
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  return {
    get,
    create,
    update,
    remove,
    loading,
    error,
  };
}

/**
 * Hook for listing things with filtering
 *
 * @param filter - Optional filters (type, status, search)
 * @returns Things array and loading/error state
 *
 * @example
 * ```tsx
 * const { things: courses, loading } = useThings({
 *   type: 'course',
 *   status: 'published'
 * });
 *
 * if (loading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     {things?.map(t => <ThingCard key={t._id} thing={t} />)}
 *   </div>
 * );
 * ```
 */
export function useThings(filter?: ThingFilter) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [things, setThings] = useState<Thing[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setThings([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.things.list(filter);
      return [] as Thing[];
    });

    run(program, {
      onSuccess: (data) => setThings(data),
    });
  }, [isProviderAvailable, filter?.type, filter?.status, run]);

  return {
    things,
    loading,
    error,
  };
}

/**
 * Hook for getting a thing and related data
 *
 * @param id - Thing ID
 * @returns Thing with loading/error state
 *
 * @example
 * ```tsx
 * const { thing: course, loading } = useThingDetail(courseId);
 *
 * if (!course) return <NotFound />;
 * return <CourseDetail course={course} />;
 * ```
 */
export function useThingDetail(id?: Id<'entities'>) {
  const { get } = useThing();
  const [thing, setThing] = useState<Thing | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setThing(null);
      return;
    }

    setLoading(true);
    get(id, {
      onSuccess: (data) => {
        setThing(data);
        setLoading(false);
      },
      onError: () => {
        setThing(null);
        setLoading(false);
      },
    });
  }, [id, get]);

  return {
    thing,
    loading,
  };
}

/**
 * Hook for things of a specific type
 *
 * @param type - Thing type (e.g., 'course', 'ai_clone', 'blog_post')
 * @param filter - Additional filters
 * @returns Typed things array
 *
 * @example
 * ```tsx
 * const { things: courses } = useThingsByType('course');
 * const { things: agents } = useThingsByType('ai_clone');
 * ```
 */
export function useThingsByType<T extends string>(
  type: T,
  filter?: Omit<ThingFilter, 'type'>
) {
  return useThings({
    ...filter,
    type,
  });
}

/**
 * Hook for searching things by name/property
 *
 * @param query - Search query
 * @param type - Optional thing type to filter by
 * @returns Matching things
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const { things: results } = useThingSearch(query, 'course');
 *
 * return (
 *   <div>
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *     />
 *     {results.map(r => <ThingCard key={r._id} thing={r} />)}
 *   </div>
 * );
 * ```
 */
export function useThingSearch(query: string, type?: string) {
  return useThings({
    search: query,
    type,
  });
}

/**
 * Hook for published/active things (for public display)
 *
 * @param type - Thing type filter
 * @returns Published things
 *
 * @example
 * ```tsx
 * const { things: publishedCourses } = usePublishedThings('course');
 * ```
 */
export function usePublishedThings(type?: string) {
  return useThings({
    type,
    status: 'published',
  });
}

/**
 * Hook for user-owned things (by current user)
 *
 * @param type - Optional thing type filter
 * @returns User's things
 *
 * @example
 * ```tsx
 * const { things: myCourses } = useMyThings('course');
 * ```
 */
export function useMyThings(type?: string) {
  // In real implementation, this would query by connection
  // (things where current user has 'owns' connection)
  return useThings({
    type,
  });
}
