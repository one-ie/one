/**
 * Demo infrastructure hooks and utilities
 *
 * Central export point for all demo-related hooks and utilities.
 * These hooks provide backend-agnostic data fetching, mutations,
 * and state management for demo pages.
 */

// Connection management
export {
  useBackendConnection,
  getConnectionState,
  checkBackendHealth,
  initializeBackendConnection,
  cleanupBackendConnection,
  $connectionState,
  type ConnectionStatus,
  type ConnectionState,
} from './useBackendConnection';

// Data fetching
export {
  useDemoData,
  fetchDemoBatch,
  prefetchDemoData,
  invalidateDemoCache,
  clearDemoCache,
  clearDemoCacheForResource,
  type ResourceType,
  type DemoDataOptions,
  type DemoDataResult,
} from './useDemoData';

// Mutations
export {
  useDemoCreateMutation,
  useDemoUpdateMutation,
  useDemoDeleteMutation,
  useDemoCustomMutation,
  type MutationMethod,
  type DemoMutationOptions,
  type DemoMutationResult,
} from './useDemoMutation';

// Filters
export {
  useDemoFilters,
  getDemoFilters,
  initializeDemoFilters,
  $demoFilters,
  type ThingType,
  type ThingStatus,
  type ViewMode,
  type DemoFilters,
  type FilterState,
} from './useDemoFilters';

// Utilities
export {
  useDebounce,
  debounce,
  createDebounce,
} from './useDebounce';
