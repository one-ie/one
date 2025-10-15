/**
 * Comprehensive example demonstrating all 6 dimensions of React hooks
 *
 * This component shows how to use the backend-agnostic hooks for:
 * - Organizations (multi-tenant)
 * - People (users & roles)
 * - Things (entities)
 * - Connections (relationships)
 * - Events (audit trail)
 * - Knowledge (search & labels)
 */

import { useState } from 'react';
import {
  // Provider
  DataProviderProvider,
  
  // Organizations
  useOrganization,
  useOrganizations,
  useCreateOrganization,
  
  // People
  useCurrentUser,
  usePeople,
  useHasRole,
  
  // Things
  useThings,
  useThing,
  useCreateThing,
  useUpdateThing,
  
  // Connections
  useConnections,
  useCreateConnection,
  useOwnedThings,
  
  // Events
  useEvents,
  useLogEvent,
  useAuditTrail,
  
  // Knowledge
  useSearch,
  useLabels,
  useCreateKnowledge,
} from '@/hooks';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

/**
 * Example 1: Organizations Management
 */
export function OrganizationsExample() {
  const { data: orgs, loading } = useOrganizations({ status: 'active' });
  const { mutate: createOrg } = useCreateOrganization({
    onSuccess: async () => { toast.success('Organization created!'); },
  });

  const [newOrgName, setNewOrgName] = useState('');

  async function handleCreate() {
    await createOrg({
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/\s+/g, '-'),
      plan: 'starter',
    });
    setNewOrgName('');
  }

  if (loading) return <Skeleton className="h-32" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>

          <div className="space-y-2">
            {orgs?.map((org) => (
              <div key={org._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-muted-foreground">{org.slug}</div>
                </div>
                <Badge>{org.plan}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Role-Based Access Control
 */
export function RoleBasedUIExample() {
  const { data: user, loading } = useCurrentUser();
  const { data: isOrgOwner } = useHasRole(['org_owner', 'platform_owner']);

  if (loading) return <Skeleton className="h-20" />;
  if (!user) return <div>Not authenticated</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Name:</span> {user.displayName}
          </div>
          <div>
            <span className="font-medium">Role:</span> <Badge>{user.role}</Badge>
          </div>

          {isOrgOwner && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="font-medium">Admin Access</p>
              <p className="text-sm text-muted-foreground">
                You have organization management permissions
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Things CRUD Operations
 */
export function ThingsCRUDExample() {
  const { data: courses, loading } = useThings({ type: 'course', status: 'published' });
  const { mutate: createCourse } = useCreateThing({
    onSuccess: async () => {
      toast.success('Course created!');
    },
  });
  const { mutate: updateCourse } = useUpdateThing({
    onSuccess: async () => {
      toast.success('Course updated!');
    },
  });

  const [newCourseName, setNewCourseName] = useState('');

  async function handleCreateCourse() {
    await createCourse({
      type: 'course',
      name: newCourseName,
      properties: {
        description: 'A new course',
        price: 99,
      },
      status: 'published',
    });
    setNewCourseName('');
  }

  async function handlePublishCourse(courseId: string) {
    await updateCourse({
      id: courseId,
      status: 'published',
    });
  }

  if (loading) return <Skeleton className="h-32" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Course name"
            />
            <Button onClick={handleCreateCourse}>Create</Button>
          </div>

          <div className="space-y-2">
            {courses?.map((course) => (
              <div key={course._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{course.name}</div>
                  <Badge variant="outline">{course.status}</Badge>
                </div>
                {course.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublishCourse(course._id)}>
                    Publish
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Connections & Relationships
 */
export function ConnectionsExample({ userId }: { userId: string | null }) {
  const { data: ownedCourses } = useOwnedThings(userId);
  const { mutate: createConnection } = useCreateConnection({
    onSuccess: async () => {
      toast.success('Enrolled!');
    },
  });

  async function handleEnroll(courseId: string) {
    if (!userId) return;

    await createConnection({
      fromEntityId: userId,
      toEntityId: courseId,
      relationshipType: 'enrolled_in',
      metadata: { progress: 0 },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ownedCourses?.map((connection) => (
            <div key={connection._id} className="p-2 border rounded">
              <div className="font-medium">Course ID: {connection.toEntityId}</div>
              <div className="text-sm text-muted-foreground">
                {connection.relationshipType}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Events & Audit Trail
 */
export function AuditTrailExample({ thingId }: { thingId: string | null }) {
  const { data: events, loading } = useAuditTrail(thingId, { limit: 10 });
  const { mutate: logEvent } = useLogEvent({
    onSuccess: async () => {
      toast.success('Event logged');
    },
  });

  async function handleLogEvent() {
    if (!thingId) return;

    await logEvent({
      type: 'content_viewed',
      actorId: 'current-user-id', // Would come from useCurrentUser
      targetId: thingId,
      metadata: { source: 'audit-trail-example' },
    });
  }

  if (loading) return <Skeleton className="h-32" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleLogEvent}>Log View Event</Button>

          <div className="space-y-2">
            {events?.map((event) => (
              <div key={event._id} className="p-2 border rounded text-sm">
                <div className="font-medium">{event.type}</div>
                <div className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Search & Knowledge
 */
export function SearchExample() {
  const [query, setQuery] = useState('');
  const { data: results, loading } = useSearch(query);
  const { data: labels } = useLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Labels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />

          {loading && <div>Searching...</div>}

          {results && (
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result._id} className="p-2 border rounded">
                  <div className="text-sm">{result.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Available Labels</div>
            <div className="flex flex-wrap gap-2">
              {labels?.map((label) => (
                <Badge key={label._id} variant="secondary">
                  {label.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Component: Comprehensive Example
 */
export function HooksComprehensiveExample() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">6-Dimension Ontology Hooks</h1>
        <p className="text-muted-foreground">
          Backend-agnostic React hooks for Organizations, People, Things, Connections, Events, and
          Knowledge
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrganizationsExample />
        <RoleBasedUIExample />
        <ThingsCRUDExample />
        <ConnectionsExample userId={null} />
        <AuditTrailExample thingId={null} />
        <SearchExample />
      </div>
    </div>
  );
}
