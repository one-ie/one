/**
 * Toast Notification Component (Interactive)
 * Success, error, info notifications with auto-dismiss
 * Requires client:load hydration
 */

'use client';

import { useEffect, useState } from 'react';
import { atom, computed } from 'nanostores';
import { useStore } from '@nanostores/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Toast state
const $toasts = atom<Toast[]>([]);

// Toast actions
export const toastActions = {
  show: (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, duration: 3000, ...toast };
    $toasts.set([...$toasts.get(), newToast]);

    // Auto-dismiss
    const duration = newToast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        toastActions.dismiss(id);
      }, duration);
    }

    return id;
  },

  success: (title: string, description?: string) => {
    toastActions.show({ type: 'success', title, description });
  },

  error: (title: string, description?: string) => {
    toastActions.show({ type: 'error', title, description });
  },

  info: (title: string, description?: string) => {
    toastActions.show({ type: 'info', title, description });
  },

  warning: (title: string, description?: string) => {
    toastActions.show({ type: 'warning', title, description });
  },

  dismiss: (id: string) => {
    $toasts.set($toasts.get().filter((t) => t.id !== id));
  },

  dismissAll: () => {
    $toasts.set([]);
  },
};

// Toast icon components
const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return (
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Single toast component
const ToastItem = ({ toast }: { toast: Toast }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      toastActions.dismiss(toast.id);
    }, 200);
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  };

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-200 ${
        bgColors[toast.type]
      } ${
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex w-full items-start gap-3 p-4">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast container component
export function Toaster() {
  const toasts = useStore($toasts);

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:right-4 sm:top-4 sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
