import { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DemoPlayground } from './DemoPlayground';
import { DEMO_BACKEND_URL } from '@/config/demo';

export interface Group {
  _id: string;
  name: string;
  type: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization';
  parentGroupId?: string;
  description?: string;
  settings?: {
    visibility?: 'public' | 'private';
    joinPolicy?: 'open' | 'invite_only' | 'approval_required';
    plan?: 'starter' | 'pro' | 'enterprise';
  };
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

interface GroupsDemoProps {
  initialGroups: Group[];
  isStandaloneMode: boolean;
  groupId?: string;
}

interface FormData {
  name: string;
  type: Group['type'];
  parentGroupId: string;
  description: string;
  plan: 'starter' | 'pro' | 'enterprise';
  visibility: 'public' | 'private';
}

const GROUP_TYPE_ICONS: Record<Group['type'], string> = {
  friend_circle: '👥',
  business: '🏢',
  community: '👫',
  dao: '⚡',
  government: '🏛️',
  organization: '🏭',
};

const GROUP_TYPE_COLORS: Record<Group['type'], string> = {
  friend_circle: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
  business: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  community: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  dao: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  government: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  organization: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
};

export function GroupsDemo({ initialGroups, isStandaloneMode, groupId }: GroupsDemoProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'organization',
    parentGroupId: '',
    description: '',
    plan: 'starter',
    visibility: 'private',
  });

  const getSubgroups = useCallback((parentId?: string) => {
    return groups.filter((g) => g.parentGroupId === parentId);
  }, [groups]);

  const toggleExpanded = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`${DEMO_BACKEND_URL}/http/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          parentGroupId: formData.parentGroupId || undefined,
          settings: {
            plan: formData.plan,
            visibility: formData.visibility,
          },
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      const result = await response.json();

      const newGroup: Group = {
        _id: result.data._id,
        name: formData.name,
        type: formData.type,
        parentGroupId: formData.parentGroupId || undefined,
        description: formData.description,
        settings: {
          plan: formData.plan,
          visibility: formData.visibility,
        },
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setGroups((prev) => [...prev, newGroup]);
      setStatusMessage({ type: 'success', text: 'Group created successfully!' });
      setFormData({
        name: '',
        type: 'organization',
        parentGroupId: '',
        description: '',
        plan: 'starter',
        visibility: 'private',
      });

      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${DEMO_BACKEND_URL}/http/groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      setGroups((prev) => prev.filter((g) => g._id !== id));
      setStatusMessage({ type: 'success', text: 'Group deleted successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const renderGroupTree = (parentId?: string, depth = 0) => {
    const subgroups = getSubgroups(parentId);

    return (
      <div style={{ marginLeft: `${depth * 16}px` }} className="space-y-2">
        {subgroups.map((group) => {
          const hasChildren = groups.some((g) => g.parentGroupId === group._id);
          const isExpanded = expandedGroups.has(group._id);

          return (
            <div key={group._id}>
              <div
                className={`p-4 rounded-lg border-2 ${GROUP_TYPE_COLORS[group.type]} flex items-center justify-between hover:shadow-md transition`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpanded(group._id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {!hasChildren && <div className="w-6" />}

                  <div className="flex items-center gap-2">
                    <span className="text-xl">{GROUP_TYPE_ICONS[group.type]}</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {group.type.replace(/_/g, ' ')} • {group.settings?.plan || 'starter'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteGroup(group._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {hasChildren && isExpanded && renderGroupTree(group._id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const formSection = (
    <form onSubmit={handleCreateGroup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Group Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Engineering Team"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Group Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Group['type'] })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="organization">Organization</option>
          <option value="business">Business</option>
          <option value="community">Community</option>
          <option value="dao">DAO</option>
          <option value="government">Government</option>
          <option value="friend_circle">Friend Circle</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Parent Group (optional)
        </label>
        <select
          value={formData.parentGroupId}
          onChange={(e) => setFormData({ ...formData, parentGroupId: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None (Top-level group)</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Plan
        </label>
        <select
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Visibility
        </label>
        <select
          value={formData.visibility}
          onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What is this group about?"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );

  const dataSection = (
    <div className="space-y-4">
      {groups.length > 0 ? (
        <div>
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Total groups: <span className="font-semibold text-slate-900 dark:text-white">{groups.length}</span>
            </p>
          </div>
          {renderGroupTree()}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No groups created yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Use the form on the left to create your first group
          </p>
        </div>
      )}
    </div>
  );

  return (
    <DemoPlayground
      title="Interactive Groups Playground"
      formSection={formSection}
      dataSection={dataSection}
      isLoading={loading}
      isSyncing={syncing}
      statusMessage={statusMessage}
      loadingSkeletonCount={3}
    />
  );
}
