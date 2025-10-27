# Component Specifications - ONE Platform

**Version:** 1.0.0
**Created:** 2025-10-25
**Status:** Test-Driven Component Design
**Purpose:** Enable frontend implementation that passes backend tests

## Component Architecture

### Component Hierarchy

```
Pages (Astro .astro files)
├── features/ (Feature-specific components)
│   ├── groups/
│   │   ├── GroupCard.tsx
│   │   ├── GroupList.tsx
│   │   ├── GroupHierarchy.tsx
│   │   ├── GroupDialog.tsx
│   │   └── GroupSelector.tsx
│   ├── things/
│   │   ├── ThingCard.tsx
│   │   ├── ThingList.tsx
│   │   ├── ThingFilter.tsx
│   │   ├── ThingDialog.tsx
│   │   └── ThingDetails.tsx
│   ├── connections/
│   │   ├── ConnectionGraph.tsx
│   │   ├── ConnectionList.tsx
│   │   └── ConnectionCard.tsx
│   ├── events/
│   │   ├── EventTimeline.tsx
│   │   └── EventCard.tsx
│   └── knowledge/
│       ├── KnowledgeSearch.tsx
│       └── KnowledgeCard.tsx
└── ui/ (shadcn/ui base components)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    └── ... (50+ components)
```

## 1. GroupCard

**Purpose:** Display a single group with metadata

**Props:**
```typescript
interface GroupCardProps {
  group: {
    _id: string;
    slug: string;
    name: string;
    type: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization';
    parentGroupId?: string;
    description?: string;
    status: 'active' | 'archived';
    settings: {
      visibility: 'public' | 'private';
      plan?: 'starter' | 'pro' | 'enterprise';
    };
  };
  onEdit?: (group: GroupCardProps['group']) => void;
  onDelete?: (groupId: string) => void;
  showHierarchy?: boolean;
}
```

**Component Structure:**
```tsx
export function GroupCard({ group, onEdit, onDelete, showHierarchy }: GroupCardProps) {
  return (
    <Card className="p-4">
      <CardHeader>
        {showHierarchy && <HierarchyIndicator parentGroupId={group.parentGroupId} />}
        <CardTitle>{group.name}</CardTitle>
        <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
          {group.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{group.description}</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{group.type}</Badge>
          <Badge variant="outline">{group.settings.visibility}</Badge>
          {group.settings.plan && (
            <Badge variant="outline">{group.settings.plan}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(group)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(group._id)}>
            Archive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

**Accessibility:**
- Card has `role="article"`
- Buttons have clear labels
- Status badge has `aria-label`

**States:**
- Default: Normal display
- Hover: Slight elevation
- Focus: Ring outline
- Loading: Skeleton content

## 2. GroupHierarchy

**Purpose:** Display hierarchical group structure with tree view

**Props:**
```typescript
interface GroupHierarchyProps {
  groups: Array<GroupCardProps['group']>;
  onSelect?: (groupId: string) => void;
  selectedGroupId?: string;
}
```

**Component Structure:**
```tsx
export function GroupHierarchy({ groups, onSelect, selectedGroupId }: GroupHierarchyProps) {
  const groupTree = buildTree(groups); // Helper to create tree structure

  return (
    <div className="space-y-2">
      {groupTree.map((group) => (
        <GroupTreeNode
          key={group._id}
          group={group}
          level={0}
          onSelect={onSelect}
          isSelected={selectedGroupId === group._id}
        />
      ))}
    </div>
  );
}

function GroupTreeNode({ group, level, onSelect, isSelected }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{ paddingLeft: `${level * 24}px` }}>
      <button
        onClick={() => onSelect?.(group._id)}
        className={cn(
          "flex items-center gap-2 w-full p-2 rounded hover:bg-accent",
          isSelected && "bg-accent"
        )}
      >
        {group.children?.length > 0 && (
          <ChevronRight
            className={cn("transition-transform", isExpanded && "rotate-90")}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          />
        )}
        <span>{group.name}</span>
      </button>
      {isExpanded && group.children?.map((child) => (
        <GroupTreeNode
          key={child._id}
          group={child}
          level={level + 1}
          onSelect={onSelect}
          isSelected={selectedGroupId === child._id}
        />
      ))}
    </div>
  );
}
```

**Accessibility:**
- Tree structure with `role="tree"`
- Nodes have `role="treeitem"`
- Arrow keys for navigation
- Expand/collapse with Enter/Space

## 3. GroupDialog

**Purpose:** Create or edit group with full form

**Props:**
```typescript
interface GroupDialogProps {
  mode: 'create' | 'edit';
  group?: GroupCardProps['group'];
  onSave: (data: GroupFormData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

interface GroupFormData {
  name: string;
  slug: string;
  type: string;
  parentGroupId?: string;
  description?: string;
  settings: {
    visibility: 'public' | 'private';
    joinPolicy: 'open' | 'invite_only' | 'approval_required';
    plan?: 'starter' | 'pro' | 'enterprise';
  };
}
```

**Component Structure:**
```tsx
export function GroupDialog({ mode, group, onSave, onCancel, isOpen }: GroupDialogProps) {
  const [formData, setFormData] = useState<GroupFormData>(
    group || getDefaultFormData()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Group' : 'Edit Group'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Acme Corporation"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug * (URL identifier)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="acme-corp"
              required
              pattern="[a-z0-9-]+"
              aria-invalid={!!errors.slug}
              aria-describedby="slug-preview"
            />
            <p id="slug-preview" className="text-xs text-muted-foreground">
              one.ie/groups/{formData.slug || '...'}
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friend_circle">Friend Circle</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="dao">DAO</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parent Group (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="parentGroupId">Parent Group (optional)</Label>
            <GroupSelector
              value={formData.parentGroupId}
              onChange={(value) => setFormData({ ...formData, parentGroupId: value })}
              excludeGroupId={group?._id} // Can't be parent of itself
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <Label>Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.settings.visibility}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      settings: { ...formData.settings, visibility: value }
                    })
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinPolicy">Join Policy</Label>
                <Select
                  value={formData.settings.joinPolicy}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      settings: { ...formData.settings, joinPolicy: value }
                    })
                  }
                >
                  <SelectTrigger id="joinPolicy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                    <SelectItem value="approval_required">Approval Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Error */}
          {errors.form && (
            <Alert variant="destructive">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Create Group' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Validation Rules:**
```typescript
function validateForm(data: GroupFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.slug = 'Slug is required';
  }
  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
  }

  if (!data.type) {
    errors.type = 'Type is required';
  }

  return errors;
}
```

**Accessibility:**
- Form has `aria-labelledby`
- Fields associated with labels
- Validation errors announced
- Focus management (trap in dialog)

## 4. ThingCard

**Purpose:** Display a single thing with type-specific icon and metadata

**Props:**
```typescript
interface ThingCardProps {
  thing: {
    _id: string;
    groupId: string;
    type: string; // One of 66 types
    name: string;
    status: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
    properties: Record<string, any>;
    createdAt: number;
    updatedAt: number;
  };
  onEdit?: (thing: ThingCardProps['thing']) => void;
  onDelete?: (thingId: string) => void;
}
```

**Component Structure:**
```tsx
export function ThingCard({ thing, onEdit, onDelete }: ThingCardProps) {
  const Icon = getIconForType(thing.type); // Helper function

  return (
    <Card className="p-4">
      <CardHeader className="flex flex-row items-center gap-3">
        <Icon className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <CardTitle className="text-base">{thing.name}</CardTitle>
          <p className="text-xs text-muted-foreground">{thing.type}</p>
        </div>
        <Badge variant={getStatusVariant(thing.status)}>
          {thing.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <dl className="text-sm space-y-1">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Created:</dt>
            <dd>{formatDate(thing.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Updated:</dt>
            <dd>{formatDate(thing.updatedAt)}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(thing)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(thing._id)}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper: Get icon for thing type
function getIconForType(type: string): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType> = {
    creator: User,
    blog_post: FileText,
    video: Video,
    course: BookOpen,
    token: Coins,
    // ... map all 66 types
  };
  return iconMap[type] || HelpCircle;
}

// Helper: Get badge variant for status
function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  const variantMap = {
    active: 'default',
    published: 'default',
    draft: 'secondary',
    archived: 'outline',
    inactive: 'outline',
  };
  return variantMap[status] || 'outline';
}
```

## 5. ThingFilter

**Purpose:** Filter things by group, type, status with search

**Props:**
```typescript
interface ThingFilterProps {
  onFilterChange: (filters: ThingFilters) => void;
  availableGroups: Array<{ _id: string; name: string }>;
  availableTypes: string[];
}

interface ThingFilters {
  groupId?: string;
  type?: string;
  status?: string;
  search?: string;
}
```

**Component Structure:**
```tsx
export function ThingFilter({ onFilterChange, availableGroups, availableTypes }: ThingFilterProps) {
  const [filters, setFilters] = useState<ThingFilters>({});
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch });
  }, [debouncedSearch, filters.groupId, filters.type, filters.status]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Filters</h3>

      {/* Group Filter */}
      <div className="space-y-2">
        <Label htmlFor="filter-group">Group</Label>
        <Select
          value={filters.groupId}
          onValueChange={(value) => setFilters({ ...filters, groupId: value })}
        >
          <SelectTrigger id="filter-group">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Groups</SelectItem>
            {availableGroups.map((group) => (
              <SelectItem key={group._id} value={group._id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="filter-type">Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger id="filter-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatTypeName(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="filter-status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="filter-search">Search</Label>
        <Input
          id="filter-search"
          type="search"
          placeholder="Search by name..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Clear Filters */}
      {Object.keys(filters).some(key => filters[key]) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({})}
          className="w-full"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
```

## 6. EventTimeline

**Purpose:** Display chronological event history

**Props:**
```typescript
interface EventTimelineProps {
  events: Array<{
    _id: string;
    type: string;
    timestamp: number;
    actorId?: string;
    targetId?: string;
    metadata?: Record<string, any>;
  }>;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

**Component Structure:**
```tsx
export function EventTimeline({ events, onLoadMore, hasMore }: EventTimelineProps) {
  const groupedEvents = groupByDate(events);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            {formatRelativeDate(date)}
          </h3>
          <div className="space-y-3 border-l-2 border-border pl-6">
            {dateEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      ))}

      {hasMore && onLoadMore && (
        <Button variant="outline" onClick={onLoadMore} className="w-full">
          Load More Events
        </Button>
      )}
    </div>
  );
}
```

## Component Test Coverage

Each component must pass these test scenarios:

### GroupDialog Tests
- [ ] Renders in create mode with empty form
- [ ] Renders in edit mode with pre-filled data
- [ ] Validates required fields (name, slug, type)
- [ ] Shows error for duplicate slug
- [ ] Shows error for invalid slug format
- [ ] Shows slug preview below input
- [ ] Submits form with valid data
- [ ] Shows loading state during submission
- [ ] Handles API errors gracefully
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### ThingCard Tests
- [ ] Renders with correct icon for type
- [ ] Shows status badge with correct color
- [ ] Formats dates correctly
- [ ] Calls onEdit when Edit button clicked
- [ ] Calls onDelete when Delete button clicked
- [ ] Accessible to screen readers

### ThingFilter Tests
- [ ] Applies all filters simultaneously
- [ ] Debounces search input (300ms)
- [ ] Calls onFilterChange with updated filters
- [ ] Clears all filters when Clear button clicked
- [ ] Dropdown menus keyboard accessible

---

**All components designed to enable test flows. Ready for implementation.**
