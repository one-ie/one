'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, X, ChevronDown, Eye, Trash2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Connection {
  _id: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  createdAt: number;
  updatedAt?: number;
  fromThing?: {
    _id: string;
    name: string;
    type: string;
  };
  toThing?: {
    _id: string;
    name: string;
    type: string;
  };
}

interface ConnectionsDemoProps {
  connections: Connection[];
  isLoading?: boolean;
}

const RELATIONSHIP_TYPES = [
  'owns',
  'created_by',
  'clone_of',
  'trained_on',
  'powers',
  'authored',
  'generated_by',
  'published_to',
  'part_of',
  'references',
  'member_of',
  'following',
  'moderates',
  'participated_in',
  'manages',
  'reports_to',
  'collaborates_with',
  'holds_tokens',
  'staked_in',
  'earned_from',
  'purchased',
  'enrolled_in',
  'completed',
  'teaching',
  'transacted',
  'notified',
  'referred',
  'communicated',
  'delegated',
  'approved',
  'fulfilled',
];

const relationshipColors: Record<string, string> = {
  owns: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  created_by: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  member_of: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  following: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  transacted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  communicated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export function ConnectionsDemo({ connections = [], isLoading = false }: ConnectionsDemoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [strengthRange, setStrengthRange] = useState<[number, number]>([0, 1]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [sortBy, setSortBy] = useState<'created' | 'strength' | 'name'>('created');

  const filteredConnections = useMemo(() => {
    let filtered = connections;

    // Filter by relationship type
    if (selectedType) {
      filtered = filtered.filter(c => c.relationshipType === selectedType);
    }

    // Filter by search query (match from or to entity names)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          (c.fromThing?.name?.toLowerCase().includes(query) ?? false) ||
          (c.toThing?.name?.toLowerCase().includes(query) ?? false)
      );
    }

    // Filter by strength range
    filtered = filtered.filter(c => {
      const strength = c.strength ?? 1;
      return strength >= strengthRange[0] && strength <= strengthRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'strength':
          return (b.strength ?? 0) - (a.strength ?? 0);
        case 'name':
          return (a.fromThing?.name ?? '').localeCompare(b.fromThing?.name ?? '');
        case 'created':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [connections, selectedType, searchQuery, strengthRange, sortBy]);

  const getColor = (type: string) => {
    return relationshipColors[type] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search by entity name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Relationship Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Relationship Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="">All Types ({RELATIONSHIP_TYPES.length})</option>
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Strength Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Strength Range: {strengthRange[0].toFixed(1)} - {strengthRange[1].toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={strengthRange[0]}
            onChange={(e) => setStrengthRange([parseFloat(e.target.value), strengthRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={strengthRange[1]}
            onChange={(e) => setStrengthRange([strengthRange[0], parseFloat(e.target.value)])}
            className="w-full mt-2"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created' | 'strength' | 'name')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="created">Recently Created</option>
            <option value="strength">Strongest</option>
            <option value="name">By Name</option>
          </select>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery('');
            setSelectedType('');
            setStrengthRange([0, 1]);
            setSortBy('created');
          }}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Connections ({filteredConnections.length})
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Connection</DialogTitle>
              <DialogDescription>
                Link two entities with a relationship type and optional metadata.
              </DialogDescription>
            </DialogHeader>
            <CreateConnectionForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredConnections.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p className="mb-2">No connections found</p>
            <p className="text-sm">Adjust your filters or create a new connection</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    From
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    To
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Strength
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {filteredConnections.map(conn => (
                  <tr key={conn._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {conn.fromThing?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {conn.fromThing?.type}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColor(conn.relationshipType)}`}>
                        {conn.relationshipType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {conn.toThing?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {conn.toThing?.type}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                            style={{ width: `${((conn.strength ?? 1) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">
                          {(conn.strength ?? 1).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(conn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedConnection(conn)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <ConnectionDetails connection={selectedConnection} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <span className="font-semibold">Tip:</span> Click the eye icon to view connection details including metadata.
          Connections can store relationship-specific data like balance, progress, permissions, or protocol details.
        </p>
      </div>
    </div>
  );
}

function CreateConnectionForm() {
  const [fromEntity, setFromEntity] = useState('');
  const [toEntity, setToEntity] = useState('');
  const [relationType, setRelationType] = useState('owns');
  const [strength, setStrength] = useState('1');
  const [metadata, setMetadata] = useState('{}');

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          From Entity
        </label>
        <Input
          placeholder="Entity ID or name"
          value={fromEntity}
          onChange={(e) => setFromEntity(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          To Entity
        </label>
        <Input
          placeholder="Entity ID or name"
          value={toEntity}
          onChange={(e) => setToEntity(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Relationship Type
        </label>
        <select
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          {RELATIONSHIP_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Strength (0-1)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            className="flex-1"
          />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-12">
            {parseFloat(strength).toFixed(1)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Metadata (JSON)
        </label>
        <textarea
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
        />
      </div>

      <Button type="submit" className="w-full">
        Create Connection
      </Button>
    </form>
  );
}

function ConnectionDetails({ connection }: { connection: Connection | null }) {
  if (!connection) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Connection Details</h3>
      </div>

      {/* From Entity */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">From Entity</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium">Name:</span> {connection.fromThing?.name}</p>
          <p><span className="font-medium">Type:</span> {connection.fromThing?.type}</p>
          <p className="font-mono text-xs text-slate-500">{connection.fromEntityId}</p>
        </div>
      </div>

      {/* Relationship Type */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Relationship</h4>
        <div className="space-y-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${relationshipColors[connection.relationshipType] || 'bg-slate-100 text-slate-800'}`}>
            {connection.relationshipType}
          </span>
          {connection.strength && (
            <div className="pt-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Strength: {connection.strength.toFixed(2)}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                  style={{ width: `${connection.strength * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* To Entity */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">To Entity</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium">Name:</span> {connection.toThing?.name}</p>
          <p><span className="font-medium">Type:</span> {connection.toThing?.type}</p>
          <p className="font-mono text-xs text-slate-500">{connection.toEntityId}</p>
        </div>
      </div>

      {/* Temporal Validity */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Temporal Validity</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {connection.validFrom ? (
            <p><span className="font-medium">Valid From:</span> {new Date(connection.validFrom).toLocaleString()}</p>
          ) : (
            <p><span className="font-medium">Valid From:</span> Not set (active)</p>
          )}
          {connection.validTo ? (
            <p><span className="font-medium">Valid To:</span> {new Date(connection.validTo).toLocaleString()}</p>
          ) : (
            <p><span className="font-medium">Valid To:</span> Not set (ongoing)</p>
          )}
        </div>
      </div>

      {/* Metadata */}
      {connection.metadata && Object.keys(connection.metadata).length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Metadata</h4>
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
            <pre>{JSON.stringify(connection.metadata, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Timestamps</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium">Created:</span> {new Date(connection.createdAt).toLocaleString()}</p>
          {connection.updatedAt && (
            <p><span className="font-medium">Updated:</span> {new Date(connection.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
