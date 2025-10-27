/**
 * Demo stores - Global state management for demo pages
 *
 * Uses Nanostores for lightweight reactive state that's shared
 * across components without prop drilling.
 */

import { atom } from 'nanostores';

/**
 * Demo connection state (synchronized from useBackendConnection)
 * Available directly via $demoConnection atom
 */
export const $demoConnection = atom({
  status: 'connecting' as 'connecting' | 'connected' | 'disconnected' | 'error',
  latency: 0,
  lastChecked: Date.now(),
  reconnectAttempts: 0,
  errorMessage: undefined as string | undefined,
});

/**
 * Demo group selection
 * Tracks which group the user is currently viewing
 */
export const $demoGroup = atom<{
  id?: string;
  name?: string;
  type?: string;
} | null>(null);

/**
 * Demo view mode
 * Tracks how data should be displayed (list, grid, graph, table)
 */
export const $demoView = atom<'list' | 'grid' | 'graph' | 'table'>('list');

/**
 * Demo filters state
 * Synchronized with URL query parameters
 */
export const $demoDataFilters = atom({
  type: undefined as string | undefined,
  status: undefined as string | undefined,
  search: '',
  debouncedSearch: '',
  limit: 20,
  offset: 0,
});

/**
 * Demo data cache
 * Stores fetched data from API endpoints
 */
export const $demoData = atom<{
  groups: any[] | null;
  people: any[] | null;
  things: any[] | null;
  connections: any[] | null;
  events: any[] | null;
  knowledge: any[] | null;
}>({
  groups: null,
  people: null,
  things: null,
  connections: null,
  events: null,
  knowledge: null,
});

/**
 * Demo loading states
 * Tracks which resources are currently loading
 */
export const $demoLoading = atom({
  groups: false,
  people: false,
  things: false,
  connections: false,
  events: false,
  knowledge: false,
});

/**
 * Demo error states
 * Stores error messages for each resource
 */
export const $demoErrors = atom<{
  groups: Error | null;
  people: Error | null;
  things: Error | null;
  connections: Error | null;
  events: Error | null;
  knowledge: Error | null;
}>({
  groups: null,
  people: null,
  things: null,
  connections: null,
  events: null,
  knowledge: null,
});

/**
 * Demo UI state
 * Tracks UI-specific settings (expanded panels, selected items, etc.)
 */
export const $demoUI = atom({
  sidebarOpen: true,
  selectedThingId: undefined as string | undefined,
  selectedConnectionId: undefined as string | undefined,
  selectedEventId: undefined as string | undefined,
  expandedGroups: [] as string[],
  showFilters: false,
  showSearch: false,
});

/**
 * Demo statistics
 * Cached statistics for overview cards
 */
export const $demoStats = atom({
  totalThings: 0,
  totalConnections: 0,
  totalEvents: 0,
  thingsByType: {} as Record<string, number>,
  thingsByStatus: {} as Record<string, number>,
  eventsByType: {} as Record<string, number>,
  lastUpdated: Date.now(),
});

/**
 * Demo selection state
 * For bulk operations (multi-select)
 */
export const $demoSelection = atom({
  selectedThingIds: new Set<string>(),
  selectedConnectionIds: new Set<string>(),
  selectedEventIds: new Set<string>(),
});

// =============================================================================
// Store Actions / Helpers
// =============================================================================

/**
 * Update selected group
 */
export function setSelectedGroup(id?: string, name?: string, type?: string) {
  $demoGroup.set({ id, name, type });
}

/**
 * Clear selected group
 */
export function clearSelectedGroup() {
  $demoGroup.set(null);
}

/**
 * Set view mode
 */
export function setViewMode(mode: 'list' | 'grid' | 'graph' | 'table') {
  $demoView.set(mode);
}

/**
 * Update data for a resource
 */
export function updateDemoData<R extends keyof ReturnType<typeof $demoData.get>>(
  resource: R,
  data: any[]
) {
  const current = $demoData.get();
  $demoData.set({
    ...current,
    [resource]: data,
  });
}

/**
 * Clear data for a resource
 */
export function clearDemoData<R extends keyof ReturnType<typeof $demoData.get>>(resource: R) {
  const current = $demoData.get();
  $demoData.set({
    ...current,
    [resource]: null,
  });
}

/**
 * Set loading state for a resource
 */
export function setDemoLoading<R extends keyof ReturnType<typeof $demoLoading.get>>(
  resource: R,
  loading: boolean
) {
  const current = $demoLoading.get();
  $demoLoading.set({
    ...current,
    [resource]: loading,
  });
}

/**
 * Set error for a resource
 */
export function setDemoError<R extends keyof ReturnType<typeof $demoErrors.get>>(
  resource: R,
  error: Error | null
) {
  const current = $demoErrors.get();
  $demoErrors.set({
    ...current,
    [resource]: error,
  });
}

/**
 * Update UI state
 */
export function updateDemoUI(updates: Partial<ReturnType<typeof $demoUI.get>>) {
  const current = $demoUI.get();
  $demoUI.set({
    ...current,
    ...updates,
  });
}

/**
 * Toggle sidebar
 */
export function toggleSidebar() {
  const current = $demoUI.get();
  $demoUI.set({
    ...current,
    sidebarOpen: !current.sidebarOpen,
  });
}

/**
 * Select thing
 */
export function selectThing(id?: string) {
  const current = $demoUI.get();
  $demoUI.set({
    ...current,
    selectedThingId: id,
  });
}

/**
 * Select connection
 */
export function selectConnection(id?: string) {
  const current = $demoUI.get();
  $demoUI.set({
    ...current,
    selectedConnectionId: id,
  });
}

/**
 * Select event
 */
export function selectEvent(id?: string) {
  const current = $demoUI.get();
  $demoUI.set({
    ...current,
    selectedEventId: id,
  });
}

/**
 * Toggle group expansion
 */
export function toggleGroupExpansion(groupId: string) {
  const current = $demoUI.get();
  const expanded = new Set(current.expandedGroups);

  if (expanded.has(groupId)) {
    expanded.delete(groupId);
  } else {
    expanded.add(groupId);
  }

  $demoUI.set({
    ...current,
    expandedGroups: Array.from(expanded),
  });
}

/**
 * Update statistics
 */
export function updateDemoStats(updates: Partial<ReturnType<typeof $demoStats.get>>) {
  const current = $demoStats.get();
  $demoStats.set({
    ...current,
    ...updates,
    lastUpdated: Date.now(),
  });
}

/**
 * Toggle thing selection
 */
export function toggleThingSelection(id: string) {
  const current = $demoSelection.get();
  const selected = new Set(current.selectedThingIds);

  if (selected.has(id)) {
    selected.delete(id);
  } else {
    selected.add(id);
  }

  $demoSelection.set({
    ...current,
    selectedThingIds: selected,
  });
}

/**
 * Clear all selections
 */
export function clearAllSelections() {
  $demoSelection.set({
    selectedThingIds: new Set(),
    selectedConnectionIds: new Set(),
    selectedEventIds: new Set(),
  });
}

/**
 * Reset all demo state
 */
export function resetAllDemoState() {
  $demoConnection.set({
    status: 'connecting',
    latency: 0,
    lastChecked: Date.now(),
    reconnectAttempts: 0,
    errorMessage: undefined,
  });

  $demoGroup.set(null);
  $demoView.set('list');

  $demoData.set({
    groups: null,
    people: null,
    things: null,
    connections: null,
    events: null,
    knowledge: null,
  });

  $demoLoading.set({
    groups: false,
    people: false,
    things: false,
    connections: false,
    events: false,
    knowledge: false,
  });

  $demoErrors.set({
    groups: null,
    people: null,
    things: null,
    connections: null,
    events: null,
    knowledge: null,
  });

  $demoUI.set({
    sidebarOpen: true,
    selectedThingId: undefined,
    selectedConnectionId: undefined,
    selectedEventId: undefined,
    expandedGroups: [],
    showFilters: false,
    showSearch: false,
  });

  clearAllSelections();
}
