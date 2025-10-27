/**
 * useBackendConnection - Monitor and manage backend connectivity
 *
 * Tracks connection status to Convex backend with automatic reconnection,
 * latency measurement, and state persistence.
 *
 * @example
 * ```tsx
 * const { status, latency, reconnect } = useBackendConnection();
 *
 * return (
 *   <div>
 *     Status: {status} ({latency}ms)
 *     {status === 'disconnected' && (
 *       <button onClick={reconnect}>Reconnect</button>
 *     )}
 *   </div>
 * );
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { atom } from 'nanostores';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  latency: number;
  lastChecked: number;
  errorMessage?: string;
  reconnectAttempts: number;
}

const BACKEND_URL = 'https://veracious-marlin-319.convex.cloud';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

// Nanostores for global connection state
export const $connectionState = atom<ConnectionState>({
  status: 'connecting',
  latency: 0,
  lastChecked: Date.now(),
  reconnectAttempts: 0,
});

// Track health check in progress
let healthCheckInProgress = false;
let healthCheckTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * Perform health check to backend
 * Returns latency in milliseconds or null if failed
 */
async function performHealthCheck(): Promise<number | null> {
  try {
    const startTime = performance.now();

    // Use a simple HEAD request to /healthz endpoint (if available)
    // or make a minimal request to check connectivity
    const response = await fetch(`${BACKEND_URL}/healthz`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const latency = Math.round(performance.now() - startTime);
    return latency;
  } catch (error) {
    // If HEAD fails, try a GET with minimal payload
    try {
      const startTime = performance.now();

      const response = await fetch(`${BACKEND_URL}/.well-known/cloudflare`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      const latency = Math.round(performance.now() - startTime);
      return latency;
    } catch {
      return null;
    }
  }
}

/**
 * Update connection state
 */
function updateConnectionState(updates: Partial<ConnectionState>) {
  const current = $connectionState.get();
  $connectionState.set({
    ...current,
    ...updates,
    lastChecked: Date.now(),
  });
}

/**
 * Handle reconnection with exponential backoff
 */
function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);

  const current = $connectionState.get();
  if (current.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    updateConnectionState({
      status: 'error',
      errorMessage: 'Max reconnection attempts reached',
    });
    return;
  }

  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, current.reconnectAttempts);

  reconnectTimer = setTimeout(() => {
    performHealthCheckWithUpdate();
  }, delay);
}

/**
 * Perform health check and update state
 */
async function performHealthCheckWithUpdate() {
  if (healthCheckInProgress) return;

  healthCheckInProgress = true;
  updateConnectionState({ status: 'connecting' });

  try {
    const latency = await performHealthCheck();

    if (latency !== null) {
      updateConnectionState({
        status: 'connected',
        latency,
        reconnectAttempts: 0,
        errorMessage: undefined,
      });
    } else {
      const current = $connectionState.get();
      updateConnectionState({
        status: 'disconnected',
        latency: 0,
        reconnectAttempts: current.reconnectAttempts + 1,
        errorMessage: 'Failed to reach backend',
      });

      // Schedule automatic reconnect
      scheduleReconnect();
    }
  } catch (error) {
    const current = $connectionState.get();
    updateConnectionState({
      status: 'error',
      latency: 0,
      reconnectAttempts: current.reconnectAttempts + 1,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    // Schedule automatic reconnect
    scheduleReconnect();
  } finally {
    healthCheckInProgress = false;
  }
}

/**
 * Start periodic health checks
 */
function startHealthChecks() {
  if (healthCheckTimer) return;

  // Initial check
  performHealthCheckWithUpdate();

  // Schedule periodic checks
  healthCheckTimer = setInterval(() => {
    performHealthCheckWithUpdate();
  }, HEALTH_CHECK_INTERVAL);
}

/**
 * Stop periodic health checks
 */
function stopHealthChecks() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * React hook for backend connection
 */
export function useBackendConnection() {
  const [state, setState] = useState<ConnectionState>($connectionState.get());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = $connectionState.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Start health checks when component mounts
    startHealthChecks();

    return () => {
      // Stop health checks when component unmounts
      stopHealthChecks();
    };
  }, []);

  const reconnect = useCallback(async () => {
    updateConnectionState({ reconnectAttempts: 0 });
    await performHealthCheckWithUpdate();
  }, []);

  const reset = useCallback(() => {
    stopHealthChecks();
    $connectionState.set({
      status: 'connecting',
      latency: 0,
      lastChecked: Date.now(),
      reconnectAttempts: 0,
    });
    startHealthChecks();
  }, []);

  return {
    ...state,
    reconnect,
    reset,
    isConnected: state.status === 'connected',
    isDisconnected: state.status === 'disconnected',
    isError: state.status === 'error',
  };
}

/**
 * Get connection state without subscribing to updates
 * Useful for one-time checks
 */
export function getConnectionState(): ConnectionState {
  return $connectionState.get();
}

/**
 * Manually trigger health check
 */
export async function checkBackendHealth(): Promise<number | null> {
  return performHealthCheck();
}

/**
 * Initialize backend connection monitoring
 * Call once at app startup
 */
export function initializeBackendConnection() {
  startHealthChecks();
}

/**
 * Cleanup backend connection monitoring
 * Call when app is shutting down
 */
export function cleanupBackendConnection() {
  stopHealthChecks();
}
