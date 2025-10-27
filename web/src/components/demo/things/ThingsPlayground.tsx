import { useState, useMemo, useCallback } from 'react';
import { Search, Grid3x3, List, Plus, Trash2, Eye, EyeOff, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getDemoApiClient } from '@/lib/demo-api';

interface Thing {
  _id: string;
  type: string;
  name: string;
  status: 'draft' | 'active' | 'published' | 'archived';
  properties: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

interface ThingsPlaygroundProps {
  initialThings: Thing[];
  groupId: string;
}

// Color coding for thing types
const thingTypeColors: Record<string, string> = {
  creator: 'bg-blue-100 text-blue-700',
  ai_clone: 'bg-purple-100 text-purple-700',
  course: 'bg-green-100 text-green-700',
  blog_post: 'bg-orange-100 text-orange-700',
  token: 'bg-yellow-100 text-yellow-700',
  community: 'bg-pink-100 text-pink-700',
  default: 'bg-slate-100 text-slate-700',
};

// Status colors
const statusColors: Record<string, string> = {
  draft: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  active: 'bg-blue-50 border-blue-200 text-blue-700',
  published: 'bg-green-50 border-green-200 text-green-700',
  archived: 'bg-gray-50 border-gray-200 text-gray-700',
};

export default function ThingsPlayground({ initialThings, groupId }: ThingsPlaygroundProps) {
  const [things, setThings] = useState<Thing[]>(initialThings);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'name'>('created');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedThing, setExpandedThing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'course',
    description: '',
    status: 'draft' as const,
  });

  // Get unique types from things
  const uniqueTypes = useMemo(() => {
    const types = new Set(things.map(t => t.type));
    return Array.from(types).sort();
  }, [things]);

  // Filter and search things
  const filteredThings = useMemo(() => {
    let result = [...things];

    if (searchQuery) {
      result = result.filter(thing =>
        thing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      result = result.filter(thing => thing.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(thing => thing.status === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt - a.createdAt;
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [things, searchQuery, selectedType, selectedStatus, sortBy]);

  // Create new thing
  const handleCreateThing = useCallback(async () => {
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    setIsLoading(true);
    try {
      const client = getDemoApiClient();
      const newThing = {
        _id: `thing_${Date.now()}`,
        type: formData.type,
        name: formData.name,
        status: formData.status,
        properties: {
          description: formData.description || undefined,
          createdBy: 'demo_user',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setThings(prev => [newThing, ...prev]);
      setFormData({
        name: '',
        type: 'course',
        description: '',
        status: 'draft',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create thing:', error);
      alert('Failed to create thing');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Delete thing
  const handleDeleteThing = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this thing?')) {
      setThings(prev => prev.filter(t => t._id !== id));
      setExpandedThing(null);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6 border-b border-blue-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Interactive Things Playground</h2>
        <p className="text-slate-600 mb-6">
          Explore, filter, and manage entities. Try creating new things, searching by name, and switching between grid and list views.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types ({uniqueTypes.length})</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created' | 'updated' | 'name')}
            className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Sort: Newest First</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="name">Sort: A-Z</option>
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            Showing {filteredThings.length} of {things.length} things
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex gap-2 border border-slate-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Button */}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Thing
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-4">Create New Thing</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="md:col-span-1"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="course">Course</option>
              <option value="creator">Creator</option>
              <option value="blog_post">Blog Post</option>
              <option value="token">Token</option>
              <option value="community">Community</option>
              <option value="video">Video</option>
              <option value="ai_clone">AI Clone</option>
            </select>
            <Input
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="md:col-span-1"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleCreateThing}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-6">
          {filteredThings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No things found matching your criteria</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Thing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThings.map(thing => (
                <div
                  key={thing._id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition bg-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 break-words">{thing.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${thingTypeColors[thing.type] || thingTypeColors.default}`}>
                          {thing.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[thing.status]}`}>
                          {thing.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedThing(expandedThing === thing._id ? null : thing._id)}
                      className="text-slate-400 hover:text-slate-600 transition"
                    >
                      {expandedThing === thing._id ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Properties Preview */}
                  {thing.properties.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {thing.properties.description}
                    </p>
                  )}

                  {/* Expanded Properties */}
                  {expandedThing === thing._id && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg text-sm">
                      <pre className="text-xs font-mono text-slate-700 overflow-x-auto max-h-48">
                        {JSON.stringify(thing.properties, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
                    <span>
                      Created {new Date(thing.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteThing(thing._id)}
                      className="text-red-600 hover:text-red-700 transition p-2"
                      title="Delete thing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6">
          {filteredThings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No things found matching your criteria</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Thing
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredThings.map(thing => (
                <div
                  key={thing._id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{thing.name}</h4>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${thingTypeColors[thing.type] || thingTypeColors.default}`}>
                          {thing.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[thing.status]}`}>
                          {thing.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(thing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedThing(expandedThing === thing._id ? null : thing._id)}
                        className="text-slate-400 hover:text-slate-600 transition p-2"
                      >
                        {expandedThing === thing._id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteThing(thing._id)}
                        className="text-red-600 hover:text-red-700 transition p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Properties */}
                  {expandedThing === thing._id && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900 mb-2">Properties:</p>
                      <pre className="text-xs font-mono text-slate-700 overflow-x-auto max-h-48">
                        {JSON.stringify(thing.properties, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <p>
          Real-time updates enabled. Try creating, filtering, and searching things to see the playground in action.
        </p>
      </div>
    </div>
  );
}
