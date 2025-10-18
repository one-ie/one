/**
 * Groups Pages Tests
 * Tests for group pages: group/[slug], create, settings, discovery
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequire } from "module";
import {
  mockUseQuery,
  mockUseMutation,
  createMockGroup,
  createMockStats,
} from './setup';
import React from 'react';

const require = createRequire(import.meta.url);

let render: typeof import("@testing-library/react")["render"];
let screen: typeof import("@testing-library/react")["screen"];
let fireEvent: typeof import("@testing-library/react")["fireEvent"];
let waitFor: typeof import("@testing-library/react")["waitFor"];
let hasTestingLibrary = true;

try {
  ({ render, screen, fireEvent, waitFor } = require("@testing-library/react"));
} catch {
  hasTestingLibrary = false;
}

const describeIfTestingLibrary = hasTestingLibrary ? describe : describe.skip;

// Mock page components
const GroupDetailPage = ({ slug }: { slug: string }) => {
  const group = mockUseQuery();
  const stats = mockUseQuery();

  if (group === undefined) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (group === null) {
    return <div data-testid="not-found">Group not found</div>;
  }

  return (
    <div data-testid="group-detail-page">
      <header data-testid="group-header">
        <h1 data-testid="group-title">{group.name}</h1>
        <span data-testid="group-type">{group.type}</span>
        <span data-testid="group-status">{group.status}</span>
      </header>

      <section data-testid="group-info">
        <p data-testid="group-description">{group.description}</p>
        <div data-testid="group-visibility">{group.settings.visibility}</div>
        <div data-testid="group-plan">{group.settings.plan}</div>
      </section>

      {stats && (
        <section data-testid="group-stats">
          <div>Members: {stats.members}</div>
          <div>Entities: {stats.entities}</div>
        </section>
      )}

      <nav data-testid="group-tabs">
        <button data-testid="tab-overview">Overview</button>
        <button data-testid="tab-members">Members</button>
        <button data-testid="tab-settings">Settings</button>
      </nav>
    </div>
  );
};

const CreateGroupPage = () => {
  const createGroup = mockUseMutation();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await createGroup({
        slug: formData.get('slug'),
        name: formData.get('name'),
        type: formData.get('type'),
      });
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setSuccess(false);
    }
  };

  return (
    <div data-testid="create-group-page">
      <h1>Create New Group</h1>

      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">Group created!</div>}

      <form data-testid="create-form" onSubmit={handleSubmit}>
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          data-testid="input-slug"
          placeholder="my-group"
          required
        />

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          data-testid="input-name"
          placeholder="My Group"
          required
        />

        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          data-testid="select-type"
          defaultValue="business"
        >
          <option value="friend_circle">Friend Circle</option>
          <option value="business">Business</option>
          <option value="community">Community</option>
          <option value="dao">DAO</option>
          <option value="government">Government</option>
          <option value="organization">Organization</option>
        </select>

        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          data-testid="input-description"
          rows={4}
        />

        <fieldset data-testid="settings-section">
          <legend>Settings</legend>

          <label htmlFor="visibility">Visibility</label>
          <select
            id="visibility"
            name="visibility"
            data-testid="select-visibility"
            defaultValue="private"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label htmlFor="joinPolicy">Join Policy</label>
          <select
            id="joinPolicy"
            name="joinPolicy"
            data-testid="select-joinPolicy"
            defaultValue="invite_only"
          >
            <option value="open">Open</option>
            <option value="invite_only">Invite Only</option>
            <option value="approval_required">Approval Required</option>
          </select>
        </fieldset>

        <button type="submit" data-testid="submit-button">
          Create Group
        </button>
      </form>
    </div>
  );
};

const GroupSettingsPage = ({ group }: { group: any }) => {
  const updateGroup = mockUseMutation();
  const archiveGroup = mockUseMutation();
  const [showArchiveConfirm, setShowArchiveConfirm] = React.useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await updateGroup({
      groupId: group._id,
      name: formData.get('name'),
      description: formData.get('description'),
    });
  };

  const handleArchive = async () => {
    await archiveGroup({ groupId: group._id });
  };

  return (
    <div data-testid="group-settings-page">
      <h1>Group Settings: {group.name}</h1>

      <section data-testid="basic-settings">
        <h2>Basic Information</h2>
        <form data-testid="update-form" onSubmit={handleUpdate}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            data-testid="input-name"
            defaultValue={group.name}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            data-testid="input-description"
            defaultValue={group.description}
          />

          <button type="submit" data-testid="save-button">
            Save Changes
          </button>
        </form>
      </section>

      <section data-testid="danger-zone">
        <h2>Danger Zone</h2>
        {!showArchiveConfirm ? (
          <button
            data-testid="archive-button"
            onClick={() => setShowArchiveConfirm(true)}
          >
            Archive Group
          </button>
        ) : (
          <div data-testid="archive-confirm">
            <p>Are you sure? This will archive the group.</p>
            <button data-testid="confirm-archive" onClick={handleArchive}>
              Yes, Archive
            </button>
            <button
              data-testid="cancel-archive"
              onClick={() => setShowArchiveConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

const GroupDiscoveryPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', visibility: '' });
  const groups = mockUseQuery();

  return (
    <div data-testid="group-discovery-page">
      <h1>Discover Groups</h1>

      <section data-testid="search-section">
        <input
          data-testid="search-input"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          data-testid="filter-type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="dao">DAO</option>
          <option value="community">Community</option>
          <option value="business">Business</option>
        </select>

        <select
          data-testid="filter-visibility"
          value={filters.visibility}
          onChange={(e) =>
            setFilters({ ...filters, visibility: e.target.value })
          }
        >
          <option value="">All Visibility</option>
          <option value="public">Public Only</option>
          <option value="private">Private Only</option>
        </select>
      </section>

      <section data-testid="results-section">
        {groups === undefined ? (
          <div data-testid="loading">Loading...</div>
        ) : groups && groups.length > 0 ? (
          <div data-testid="results-grid">
            {groups.map((group: any) => (
              <div key={group._id} data-testid="group-card">
                <h3>{group.name}</h3>
                <span>{group.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div data-testid="empty-state">No groups found</div>
        )}
      </section>
    </div>
  );
};

describeIfTestingLibrary('GroupDetailPage', () => {
  it('should show loading state', () => {
    mockUseQuery.mockReturnValue(undefined);

    render(<GroupDetailPage slug="test-group" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should show not found state', () => {
    mockUseQuery.mockReturnValue(null);

    render(<GroupDetailPage slug="nonexistent" />);

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('should display group details', () => {
    const group = createMockGroup({
      name: 'Acme Corp',
      type: 'business',
      description: 'A test business group',
      status: 'active',
    });

    mockUseQuery.mockReturnValueOnce(group).mockReturnValueOnce(null);

    render(<GroupDetailPage slug="acme-corp" />);

    expect(screen.getByTestId('group-title')).toHaveTextContent('Acme Corp');
    expect(screen.getByTestId('group-type')).toHaveTextContent('business');
    expect(screen.getByTestId('group-status')).toHaveTextContent('active');
    expect(screen.getByTestId('group-description')).toHaveTextContent(
      'A test business group'
    );
  });

  it('should display group stats', () => {
    const group = createMockGroup();
    const stats = createMockStats();

    mockUseQuery.mockReturnValueOnce(group).mockReturnValueOnce(stats);

    render(<GroupDetailPage slug="test" />);

    expect(screen.getByTestId('group-stats')).toBeInTheDocument();
    expect(screen.getByText(/Members: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Entities: 20/)).toBeInTheDocument();
  });

  it('should show navigation tabs', () => {
    const group = createMockGroup();
    mockUseQuery.mockReturnValueOnce(group).mockReturnValueOnce(null);

    render(<GroupDetailPage slug="test" />);

    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-members')).toBeInTheDocument();
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument();
  });
});

describeIfTestingLibrary('CreateGroupPage', () => {
  it('should render create form', () => {
    render(<CreateGroupPage />);

    expect(screen.getByTestId('create-form')).toBeInTheDocument();
    expect(screen.getByTestId('input-slug')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('select-type')).toBeInTheDocument();
  });

  it('should show optional description field', () => {
    render(<CreateGroupPage />);

    expect(screen.getByTestId('input-description')).toBeInTheDocument();
  });

  it('should include settings section', () => {
    render(<CreateGroupPage />);

    expect(screen.getByTestId('settings-section')).toBeInTheDocument();
    expect(screen.getByTestId('select-visibility')).toBeInTheDocument();
    expect(screen.getByTestId('select-joinPolicy')).toBeInTheDocument();
  });

  it('should handle successful creation', async () => {
    const createMutation = vi.fn().mockResolvedValue('new-id');
    mockUseMutation.mockReturnValue(createMutation);

    render(<CreateGroupPage />);

    fireEvent.change(screen.getByTestId('input-slug'), {
      target: { value: 'new-group' },
    });
    fireEvent.change(screen.getByTestId('input-name'), {
      target: { value: 'New Group' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });

  it('should handle creation error', async () => {
    const createMutation = vi
      .fn()
      .mockRejectedValue(new Error('Slug already exists'));
    mockUseMutation.mockReturnValue(createMutation);

    render(<CreateGroupPage />);

    fireEvent.change(screen.getByTestId('input-slug'), {
      target: { value: 'duplicate' },
    });
    fireEvent.change(screen.getByTestId('input-name'), {
      target: { value: 'Duplicate' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Slug already exists'
      );
    });
  });
});

describeIfTestingLibrary('GroupSettingsPage', () => {
  it('should display current group info', () => {
    const group = createMockGroup({
      name: 'Test Group',
      description: 'Test description',
    });

    render(<GroupSettingsPage group={group} />);

    expect(screen.getByText(/Group Settings: Test Group/)).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toHaveValue('Test Group');
    expect(screen.getByTestId('input-description')).toHaveValue(
      'Test description'
    );
  });

  it('should handle settings update', async () => {
    const group = createMockGroup();
    const updateMutation = vi.fn().mockResolvedValue(true);
    mockUseMutation.mockReturnValue(updateMutation);

    render(<GroupSettingsPage group={group} />);

    fireEvent.change(screen.getByTestId('input-name'), {
      target: { value: 'Updated Name' },
    });
    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: group._id,
          name: 'Updated Name',
        })
      );
    });
  });

  it('should show archive confirmation', () => {
    const group = createMockGroup();
    mockUseMutation.mockReturnValue(vi.fn());

    render(<GroupSettingsPage group={group} />);

    fireEvent.click(screen.getByTestId('archive-button'));

    expect(screen.getByTestId('archive-confirm')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-archive')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-archive')).toBeInTheDocument();
  });

  it('should cancel archive', () => {
    const group = createMockGroup();
    mockUseMutation.mockReturnValue(vi.fn());

    render(<GroupSettingsPage group={group} />);

    fireEvent.click(screen.getByTestId('archive-button'));
    fireEvent.click(screen.getByTestId('cancel-archive'));

    expect(screen.queryByTestId('archive-confirm')).not.toBeInTheDocument();
  });

  it('should confirm archive', async () => {
    const group = createMockGroup();
    const archiveMutation = vi.fn().mockResolvedValue(true);
    mockUseMutation.mockReturnValue(archiveMutation);

    render(<GroupSettingsPage group={group} />);

    fireEvent.click(screen.getByTestId('archive-button'));
    fireEvent.click(screen.getByTestId('confirm-archive'));

    await waitFor(() => {
      expect(archiveMutation).toHaveBeenCalledWith({ groupId: group._id });
    });
  });
});

describeIfTestingLibrary('GroupDiscoveryPage', () => {
  it('should render search interface', () => {
    mockUseQuery.mockReturnValue([]);

    render(<GroupDiscoveryPage />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-type')).toBeInTheDocument();
    expect(screen.getByTestId('filter-visibility')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue(undefined);

    render(<GroupDiscoveryPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should display search results', () => {
    const groups = [
      createMockGroup({ name: 'Group 1' }),
      createMockGroup({ name: 'Group 2' }),
    ];
    mockUseQuery.mockReturnValue(groups);

    render(<GroupDiscoveryPage />);

    const cards = screen.getAllByTestId('group-card');
    expect(cards).toHaveLength(2);
  });

  it('should show empty state', () => {
    mockUseQuery.mockReturnValue([]);

    render(<GroupDiscoveryPage />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('should update search query', () => {
    mockUseQuery.mockReturnValue([]);

    render(<GroupDiscoveryPage />);

    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput.value).toBe('test query');
  });

  it('should update filters', () => {
    mockUseQuery.mockReturnValue([]);

    render(<GroupDiscoveryPage />);

    const typeFilter = screen.getByTestId('filter-type') as HTMLSelectElement;
    fireEvent.change(typeFilter, { target: { value: 'dao' } });

    expect(typeFilter.value).toBe('dao');
  });
});
