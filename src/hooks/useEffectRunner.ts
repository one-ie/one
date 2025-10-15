import { useCallback, useState } from 'react';
import { Effect, Exit } from 'effect';

/**
 * Hook for running Effect programs in React components
 *
 * Provides loading states, error handling, and success callbacks
 * for Effect.ts service calls.
 *
 * @example
 * ```tsx
 * const { run, loading, error } = useEffectRunner();
 *
 * const handleClick = () => {
 *   const program = Effect.gen(function* () {
 *     const service = yield* SomeService;
 *     return yield* service.doSomething();
 *   });
 *
 *   run(program, {
 *     onSuccess: (result) => console.log('Success:', result),
 *     onError: (err) => console.error('Failed:', err)
 *   });
 * };
 * ```
 */
export function useEffectRunner<E = unknown, A = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);
  const [data, setData] = useState<A | null>(null);

  const run = useCallback(
    async (
      program: Effect.Effect<A, E, never>,
      options?: {
        onSuccess?: (result: A) => void;
        onError?: (error: E) => void;
        onFinally?: () => void;
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const exit = await Effect.runPromiseExit(program);

        if (Exit.isSuccess(exit)) {
          const result = exit.value;
          setData(result);
          options?.onSuccess?.(result);
        } else {
          const cause = exit.cause;
          // Extract the error from the cause
          const err = cause._tag === 'Fail' ? cause.error : (cause as unknown as E);
          setError(err);
          options?.onError?.(err);
        }
      } catch (err) {
        setError(err as E);
        options?.onError?.(err as E);
      } finally {
        setLoading(false);
        options?.onFinally?.();
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    run,
    reset,
    loading,
    error,
    data,
  };
}

/**
 * Simplified hook for running Effect programs with automatic error handling
 *
 * @example
 * ```tsx
 * const execute = useEffectAction();
 *
 * execute(
 *   Effect.gen(function* () {
 *     const service = yield* SomeService;
 *     return yield* service.doSomething();
 *   }),
 *   {
 *     onSuccess: (result) => toast.success('Done!'),
 *     onError: (err) => toast.error(err.message)
 *   }
 * );
 * ```
 */
export function useEffectAction<E = unknown, A = unknown>() {
  const { run } = useEffectRunner<E, A>();

  return useCallback(
    (
      program: Effect.Effect<A, E, never>,
      options?: {
        onSuccess?: (result: A) => void;
        onError?: (error: E) => void;
      }
    ) => {
      return run(program, options);
    },
    [run]
  );
}
