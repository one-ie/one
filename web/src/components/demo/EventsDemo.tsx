import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, Clock, User, Package, Loader2, AlertCircle } from 'lucide-react';
import { DemoStats } from './DemoStats';

interface DemoEvent {
  _id: string;
  type: string;
  actorId?: string;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface EventStats {
  totalEvents: number;
  uniqueTypes: number;
  uniqueActors: number;
  uniqueTargets: number;
  eventsByType: Record<string, number>;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  // Lifecycle
  thing_created: 'bg-blue-100 text-blue-700 border-blue-200',
  thing_updated: 'bg-blue-100 text-blue-700 border-blue-200',
  thing_deleted: 'bg-blue-100 text-blue-700 border-blue-200',

  // User
  user_registered: 'bg-green-100 text-green-700 border-green-200',
  user_verified: 'bg-green-100 text-green-700 border-green-200',
  user_login: 'bg-green-100 text-green-700 border-green-200',
  user_logout: 'bg-green-100 text-green-700 border-green-200',
  profile_updated: 'bg-green-100 text-green-700 border-green-200',

  // Auth
  password_reset_requested: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  password_reset_completed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  email_verification_sent: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  email_verified: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  two_factor_enabled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  two_factor_disabled: 'bg-yellow-100 text-yellow-700 border-yellow-200',

  // Commerce
  tokens_purchased: 'bg-orange-100 text-orange-700 border-orange-200',
  token_minted: 'bg-orange-100 text-orange-700 border-orange-200',
  token_burned: 'bg-orange-100 text-orange-700 border-orange-200',
  tokens_transferred: 'bg-orange-100 text-orange-700 border-orange-200',

  // Course
  course_enrolled: 'bg-purple-100 text-purple-700 border-purple-200',
  lesson_completed: 'bg-purple-100 text-purple-700 border-purple-200',
  course_completed: 'bg-purple-100 text-purple-700 border-purple-200',
  certificate_earned: 'bg-purple-100 text-purple-700 border-purple-200',

  // Inference
  inference_request: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  inference_completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  inference_failed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  inference_quota_exceeded: 'bg-indigo-100 text-indigo-700 border-indigo-200',

  // Blockchain
  nft_minted: 'bg-red-100 text-red-700 border-red-200',
  nft_transferred: 'bg-red-100 text-red-700 border-red-200',
  contract_deployed: 'bg-red-100 text-red-700 border-red-200',
  tokens_bridged: 'bg-red-100 text-red-700 border-red-200',
};

/**
 * EventsDemo - Interactive event timeline playground
 *
 * Features:
 * - Real-time event timeline with filtering
 * - Filter by event type, actor, target
 * - Date range selection
 * - Search by metadata
 * - Event statistics
 * - Expandable event details with metadata
 * - Export capability
 */
export default function EventsDemo() {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<DemoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedType, setSelectedType] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [searchMetadata, setSearchMetadata] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    uniqueTypes: 0,
    uniqueActors: 0,
    uniqueTargets: 0,
    eventsByType: {},
  });

  // Fetch demo events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate mock events since we may not have a backend
        const mockEvents = generateMockEvents(50);
        setEvents(mockEvents);

        // Calculate stats
        const uniqueTypes = new Set(mockEvents.map(e => e.type)).size;
        const uniqueActors = new Set(mockEvents.map(e => e.actorId).filter(Boolean)).size;
        const uniqueTargets = new Set(mockEvents.map(e => e.targetId).filter(Boolean)).size;

        const eventsByType: Record<string, number> = {};
        mockEvents.forEach(e => {
          eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
        });

        setStats({
          totalEvents: mockEvents.length,
          uniqueTypes,
          uniqueActors,
          uniqueTargets,
          eventsByType,
        });

        setFilteredEvents(mockEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    if (selectedType) {
      filtered = filtered.filter(e => e.type === selectedType);
    }

    if (selectedActor) {
      filtered = filtered.filter(e =>
        e.actorId?.toLowerCase().includes(selectedActor.toLowerCase())
      );
    }

    if (selectedTarget) {
      filtered = filtered.filter(e =>
        e.targetId?.toLowerCase().includes(selectedTarget.toLowerCase())
      );
    }

    if (searchMetadata) {
      filtered = filtered.filter(e =>
        JSON.stringify(e.metadata || {})
          .toLowerCase()
          .includes(searchMetadata.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedType, selectedActor, selectedTarget, searchMetadata]);

  const handleExport = () => {
    const csv = [
      ['Type', 'Actor', 'Target', 'Timestamp', 'Metadata'],
      ...filteredEvents.map(e => [
        e.type,
        e.actorId || '',
        e.targetId || '',
        new Date(e.timestamp).toISOString(),
        JSON.stringify(e.metadata || {}),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${Date.now()}.csv`;
    a.click();
  };

  const uniqueEventTypes = Array.from(
    new Set(events.map(e => e.type))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <DemoStats
        stats={[
          {
            id: 'total-events',
            label: 'Total Events',
            value: stats.totalEvents,
            icon: <Clock className="w-4 h-4" />,
          },
          {
            id: 'unique-types',
            label: 'Event Types',
            value: stats.uniqueTypes,
            icon: <Filter className="w-4 h-4" />,
          },
          {
            id: 'unique-actors',
            label: 'Unique Actors',
            value: stats.uniqueActors,
            icon: <User className="w-4 h-4" />,
          },
          {
            id: 'unique-targets',
            label: 'Unique Targets',
            value: stats.uniqueTargets,
            icon: <Package className="w-4 h-4" />,
          },
        ]}
        animated
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </h3>
          {filteredEvents.length < events.length && (
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedActor('');
                setSelectedTarget('');
                setSearchMetadata('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All types</option>
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Actor (Search)
            </label>
            <input
              type="text"
              value={selectedActor}
              onChange={e => setSelectedActor(e.target.value)}
              placeholder="user_123..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Target Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target (Search)
            </label>
            <input
              type="text"
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              placeholder="token_456..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Metadata Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Metadata Search
            </label>
            <input
              type="text"
              value={searchMetadata}
              onChange={e => setSearchMetadata(e.target.value)}
              placeholder="amount, status..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={filteredEvents.length === 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedType || selectedActor || selectedTarget || searchMetadata) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filteredEvents.length}</span> of{' '}
              <span className="font-semibold">{events.length}</span> events
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error loading events</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Events Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Event Timeline</h3>
          <p className="text-sm text-slate-600 mt-1">
            {loading ? 'Loading events...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No events found matching your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
            {filteredEvents.map((event, index) => (
              <div key={event._id} className="p-4 hover:bg-slate-50 transition">
                <div
                  onClick={() =>
                    setExpandedEventId(
                      expandedEventId === event._id ? null : event._id
                    )
                  }
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Timeline dot */}
                    <div className="pt-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${
                              EVENT_TYPE_COLORS[event.type] ||
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {event.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600 space-y-1">
                        {event.actorId && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Actor:</span>
                            <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {event.actorId}
                            </code>
                          </div>
                        )}
                        {event.targetId && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Target:</span>
                            <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {event.targetId}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand button */}
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                        expandedEventId === event._id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded details */}
                {expandedEventId === event._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Timestamp
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                          Metadata
                        </p>
                        <pre className="text-xs bg-slate-900 text-white rounded p-3 overflow-x-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Event ID
                      </p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {event._id}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Demo Data:</span> This timeline shows sample events
          to demonstrate filtering, searching, and metadata exploration. Connect to a real
          backend to see live event data.
        </p>
      </div>
    </div>
  );
}

/**
 * Generate mock events for demonstration
 */
function generateMockEvents(count: number): DemoEvent[] {
  const eventTypes = [
    'user_registered',
    'user_login',
    'thing_created',
    'thing_updated',
    'course_enrolled',
    'tokens_purchased',
    'password_reset_requested',
    'email_verified',
    'inference_request',
    'inference_completed',
  ];

  const actors = [
    'user_001',
    'user_002',
    'user_003',
    'creator_001',
    'org_admin',
  ];

  const targets = [
    'course_101',
    'course_102',
    'token_001',
    'lesson_001',
    'certificate_001',
    'agent_001',
  ];

  const metadataExamples = [
    { amount: 100, currency: 'USD' },
    { status: 'completed', duration: 3600 },
    { email: 'user@example.com', verified: true },
    { course_title: 'Advanced Python', lessons: 12 },
    { inference_cost: 0.50, tokens_used: 2048 },
  ];

  const events: DemoEvent[] = [];

  for (let i = 0; i < count; i++) {
    events.push({
      _id: `evt_${Date.now()}_${i}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      actorId: actors[Math.floor(Math.random() * actors.length)],
      targetId: targets[Math.floor(Math.random() * targets.length)],
      timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
      metadata:
        metadataExamples[
          Math.floor(Math.random() * metadataExamples.length)
        ],
    });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}
