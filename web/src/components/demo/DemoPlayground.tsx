import { useState } from 'react';
import { ChevronRight, Loader2, Grid3x3, List, Check, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface DemoPlaygroundProps {
  /** Title for the playground section */
  title?: string;

  /** Form section content */
  formSection: React.ReactNode;

  /** Data display content */
  dataSection: React.ReactNode;

  /** Current view mode */
  viewMode?: 'list' | 'grid';

  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'list' | 'grid') => void;

  /** Whether data is loading */
  isLoading?: boolean;

  /** Whether a real-time sync is in progress */
  isSyncing?: boolean;

  /** Loading skeleton count for data section */
  loadingSkeletonCount?: number;

  /** Status message to display */
  statusMessage?: {
    type: 'success' | 'error' | 'info';
    text: string;
  } | null;

  /** Additional CSS className */
  className?: string;
}

/**
 * DemoPlayground - Interactive playground for demo data manipulation
 *
 * Features:
 * - Form section (create/edit operations)
 * - Data display section (list/grid toggle)
 * - Real-time sync indicator
 * - Loading states with skeletons
 * - Status messages
 * - Responsive layout
 * - Dark/light mode support
 *
 * @example
 * ```tsx
 * <DemoPlayground
 *   title="Groups Playground"
 *   formSection={<CreateGroupForm />}
 *   dataSection={<GroupsList groups={groups} />}
 *   viewMode={view}
 *   onViewModeChange={setView}
 *   isLoading={loading}
 *   isSyncing={syncing}
 * />
 * ```
 */
export function DemoPlayground({
  title = 'Interactive Playground',
  formSection,
  dataSection,
  viewMode = 'list',
  onViewModeChange,
  isLoading = false,
  isSyncing = false,
  loadingSkeletonCount = 3,
  statusMessage = null,
  className = '',
}: DemoPlaygroundProps) {
  const [isFormExpanded, setIsFormExpanded] = useState(true);

  const statusColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  };

  const statusIcons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Loader2 className="w-5 h-5 animate-spin" />,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Title */}
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            statusColors[statusMessage.type]
          }`}
        >
          {statusIcons[statusMessage.type]}
          <div>
            <p className="text-sm font-medium">{statusMessage.text}</p>
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section (Left Column) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* Form Header */}
            <button
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className="w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <h4 className="font-semibold text-slate-900 dark:text-white">Actions</h4>
              <ChevronRight
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                  isFormExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Form Content */}
            {isFormExpanded && (
              <div className="p-6 border-b border-dashed border-slate-200 dark:border-slate-700">
                {formSection}
              </div>
            )}

            {/* Form Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Use this form to create, update, or delete items
            </div>
          </div>
        </div>

        {/* Data Section (Right Column) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* Data Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">Data View</h4>
                {isSyncing && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Syncing...
                  </div>
                )}
              </div>

              {/* View Toggle */}
              {onViewModeChange && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded transition ${
                      viewMode === 'list'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded transition ${
                      viewMode === 'grid'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="Grid view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Data Content */}
            <div className="p-6 min-h-96">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: loadingSkeletonCount }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                dataSection
              )}
            </div>

            {/* Data Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              {viewMode === 'list' ? 'List view' : 'Grid view'} - Real-time updates enabled
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Tip:</span> Changes in the form section will be reflected in the data
          view in real-time. Try creating, updating, or deleting items to see the playground in action.
        </p>
      </div>
    </div>
  );
}
