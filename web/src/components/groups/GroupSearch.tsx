import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Globe, Lock, Users, X } from 'lucide-react';

interface Group {
  _id: string;
  slug: string;
  name: string;
  type: string;
  description?: string;
  settings: {
    visibility: 'public' | 'private';
    joinPolicy: string;
  };
}

interface GroupSearchProps {
  initialGroups: Group[];
}

const groupTypeLabels: Record<string, string> = {
  friend_circle: 'Friend Circle',
  business: 'Business',
  community: 'Community',
  dao: 'DAO',
  government: 'Government',
  organization: 'Organization',
};

export function GroupSearch({ initialGroups }: GroupSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [filteredGroups, setFilteredGroups] = React.useState(initialGroups);

  React.useEffect(() => {
    let results = [...initialGroups];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.slug.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      results = results.filter((group) => group.type === typeFilter);
    }

    setFilteredGroups(results);
  }, [searchQuery, typeFilter, initialGroups]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups by name, slug, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="friend_circle">Friend Circle</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="dao">DAO</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredGroups.length} of {initialGroups.length} groups
        </p>
        {hasActiveFilters && <p className="text-primary">Filters active</p>}
      </div>

      {/* Results Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card key={group._id} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{group.name}</CardTitle>
                  {group.settings.visibility === 'public' ? (
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{groupTypeLabels[group.type]}</Badge>
                  {group.settings.joinPolicy === 'open' && (
                    <Badge variant="outline">Open to Join</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <div className="flex-1">
                  {group.description ? (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No description provided</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/group/${group.slug}`}>View Group</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-lg font-semibold">No groups found</p>
            <p className="text-center text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
