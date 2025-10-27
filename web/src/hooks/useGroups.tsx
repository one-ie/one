/**
 * useGroups - React hooks for Groups dimension
 *
 * NOTE: Groups are managed at the backend level through the 'things' dimension
 * with type: 'group'. The DataProvider interface does not expose a separate
 * groups operations object. Group functionality is implemented through:
 * - Things operations (create, read, update, delete group entities)
 * - Connections operations (manage group hierarchies via parent_of relationships)
 * - Events operations (track group activities)
 *
 * This file is kept as a reference for future group hook implementations
 * when the DataProvider interface is extended with dedicated group operations.
 */

// This file is deprecated. Groups are managed through the things dimension.
