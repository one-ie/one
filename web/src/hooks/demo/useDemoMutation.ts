/**
 * useDemoMutation - Create, update, or delete entities via HTTP API
 *
 * Provides React Query mutation hooks for demo operations with automatic
 * cache invalidation, optimistic updates, and error handling.
 *
 * @example
 * ```tsx
 * const { mutate: createThing, loading } = useDemoMutation('POST', 'things', {
 *   onSuccess: (data) => {
 *     toast.success('Thing created!');
 *     router.push(`/things/${data._id}`);
 *   }
 * });
 *
 * async function handleCreate() {
 *   await createThing({
 *     type: 'course',
 *     name: 'My Course',
 *     properties: { description: '...' }
 *   });
 * }
 * ```
 */

import { useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ResourceType } from './useDemoData';
import { clearDemoCacheForResource } from './useDemoData';

export type MutationMethod = 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export interface DemoMutationOptions<T> {
  onSuccess?: (data: T) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
  onMutate?: (data: any) => Promise<void> | void;
  onSettled?: () => Promise<void> | void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export interface DemoMutationResult<T, Input> {
  mutate: (data: Input) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

const API_BASE_URL = '/http';

/**
 * Generic mutation function for HTTP API calls
 */
async function performMutation<T>(
  method: MutationMethod,
  resource: ResourceType,
  payload: any,
  id?: string
): Promise<T> {
  const url = id ? `${API_BASE_URL}/${resource}/${id}` : `${API_BASE_URL}/${resource}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: method !== 'DELETE' ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (method === 'DELETE') {
      return { _id: id } as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error(`Mutation failed: ${String(error)}`);
  }
}

/**
 * Hook for creating entities (POST)
 */
export function useDemoCreateMutation<T extends { _id: string }>(
  resource: ResourceType,
  options?: DemoMutationOptions<T>
): DemoMutationResult<T, Omit<T, '_id'>> {
  const queryClient = useQueryClient();
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = `${resource} created successfully`,
    errorMessage: customErrorMessage,
  } = options || {};

  const mutation = useReactMutation({
    mutationFn: async (payload: Omit<T, '_id'>) => {
      await options?.onMutate?.(payload);
      return performMutation<T>('POST', resource, payload);
    },
    onSuccess: async (data) => {
      // Invalidate cache
      clearDemoCacheForResource(resource);

      // Show toast
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Call callback
      await options?.onSuccess?.(data);

      // Trigger callback
      await options?.onSettled?.();
    },
    onError: async (error: Error) => {
      if (showErrorToast) {
        toast.error(customErrorMessage || error.message);
      }

      await options?.onError?.(error);
      await options?.onSettled?.();
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}

/**
 * Hook for updating entities (PATCH)
 */
export function useDemoUpdateMutation<T extends { _id: string }>(
  resource: ResourceType,
  options?: DemoMutationOptions<T>
): DemoMutationResult<T, Partial<T> & { _id: string }> {
  const queryClient = useQueryClient();
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = `${resource} updated successfully`,
    errorMessage: customErrorMessage,
  } = options || {};

  const mutation = useReactMutation({
    mutationFn: async (payload: Partial<T> & { _id: string }) => {
      const { _id, ...updates } = payload;

      await options?.onMutate?.(payload);

      // Optimistic update
      queryClient.setQueryData(['demo', resource, _id], (old: T | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return performMutation<T>('PATCH', resource, updates, _id);
    },
    onSuccess: async (data) => {
      // Invalidate cache
      clearDemoCacheForResource(resource);

      // Show toast
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Call callback
      await options?.onSuccess?.(data);

      // Trigger callback
      await options?.onSettled?.();
    },
    onError: async (error: Error) => {
      // Invalidate to fetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['demo', resource],
      });

      if (showErrorToast) {
        toast.error(customErrorMessage || error.message);
      }

      await options?.onError?.(error);
      await options?.onSettled?.();
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}

/**
 * Hook for deleting entities (DELETE)
 */
export function useDemoDeleteMutation<T extends { _id: string }>(
  resource: ResourceType,
  options?: DemoMutationOptions<T>
): DemoMutationResult<T, string> {
  const queryClient = useQueryClient();
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = `${resource} deleted successfully`,
    errorMessage: customErrorMessage,
  } = options || {};

  const mutation = useReactMutation({
    mutationFn: async (id: string) => {
      await options?.onMutate?.(id);

      // Optimistic delete
      queryClient.removeQueries({
        queryKey: ['demo', resource, id],
      });

      return performMutation<T>('DELETE', resource, null, id);
    },
    onSuccess: async (data) => {
      // Invalidate cache
      clearDemoCacheForResource(resource);

      // Show toast
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Call callback
      await options?.onSuccess?.(data);

      // Trigger callback
      await options?.onSettled?.();
    },
    onError: async (error: Error) => {
      // Invalidate to fetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['demo', resource],
      });

      if (showErrorToast) {
        toast.error(customErrorMessage || error.message);
      }

      await options?.onError?.(error);
      await options?.onSettled?.();
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}

/**
 * Hook for custom mutations (POST/PUT with custom logic)
 */
export function useDemoCustomMutation<T, Input = any>(
  method: MutationMethod,
  resource: ResourceType,
  options?: DemoMutationOptions<T>
): DemoMutationResult<T, Input> {
  const queryClient = useQueryClient();
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation successful',
    errorMessage: customErrorMessage,
  } = options || {};

  const mutation = useReactMutation({
    mutationFn: async (payload: Input) => {
      await options?.onMutate?.(payload);
      return performMutation<T>(method, resource, payload);
    },
    onSuccess: async (data) => {
      // Invalidate cache
      clearDemoCacheForResource(resource);

      // Show toast
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Call callback
      await options?.onSuccess?.(data);

      // Trigger callback
      await options?.onSettled?.();
    },
    onError: async (error: Error) => {
      if (showErrorToast) {
        toast.error(customErrorMessage || error.message);
      }

      await options?.onError?.(error);
      await options?.onSettled?.();
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}
