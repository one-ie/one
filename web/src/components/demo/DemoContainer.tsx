import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export interface DemoContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backendUrl?: string;
  showConnectionStatus?: boolean;
  className?: string;
}

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected';
  latency: number;
}

/**
 * DemoContainer - Wrapper component for demo pages with connection status
 *
 * Features:
 * - Connection status badge (connecting/connected/disconnected)
 * - Backend URL display
 * - Latency indicator with color coding
 * - Error boundary support
 * - Dark/light mode support
 * - Responsive design
 *
 * @example
 * ```tsx
 * <DemoContainer title="Groups Demo" backendUrl="https://api.one.ie">
 *   <DemoPlayground />
 * </DemoContainer>
 * ```
 */
export function DemoContainer({
  children,
  title,
  description,
  backendUrl = 'https://veracious-marlin-319.convex.cloud',
  showConnectionStatus = true,
  className = '',
}: DemoContainerProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connecting',
    latency: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check backend connectivity
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus(prev => ({
        ...prev,
        status: 'connecting',
      }));

      try {
        const startTime = performance.now();
        await fetch(backendUrl, {
          method: 'HEAD',
          mode: 'no-cors',
        });
        const latency = Math.round(performance.now() - startTime);

        setConnectionStatus({
          status: 'connected',
          latency,
        });
      } catch {
        setConnectionStatus({
          status: 'disconnected',
          latency: 0,
        });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
    window.location.reload();
  };

  const statusColor =
    connectionStatus.status === 'connected'
      ? 'bg-green-50 border-green-200 text-green-700'
      : connectionStatus.status === 'connecting'
        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
        : 'bg-red-50 border-red-200 text-red-700';

  const statusIcon =
    connectionStatus.status === 'connected' ? (
      <Wifi className="w-4 h-4" />
    ) : connectionStatus.status === 'connecting' ? (
      <RefreshCw className="w-4 h-4 animate-spin" />
    ) : (
      <WifiOff className="w-4 h-4" />
    );

  const statusText =
    connectionStatus.status === 'connected'
      ? `Connected (${connectionStatus.latency}ms)`
      : connectionStatus.status === 'connecting'
        ? 'Connecting...'
        : 'Disconnected';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
              )}
            </div>

            {showConnectionStatus && (
              <div className="flex items-center gap-4">
                {/* Connection Status Badge */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusColor}`}
                >
                  {statusIcon}
                  <span className="text-xs font-semibold">{statusText}</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh page"
                  title="Refresh demo data"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Backend URL Display */}
          {showConnectionStatus && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backend: <span className="font-mono text-slate-700 dark:text-slate-300">{backendUrl}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectionStatus.status === 'disconnected' && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                Backend Connection Failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                Unable to connect to the backend. Some features may not work. Please check your connection and
                try again.
              </p>
            </div>
          </div>
        )}

        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            These demos showcase the ONE Platform's 6-dimension ontology. Connect to a real backend to see
            live data in action.
          </p>
        </div>
      </div>
    </div>
  );
}
