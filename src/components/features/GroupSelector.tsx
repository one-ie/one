/**
 * GroupSelector Component
 * Dropdown to switch between user's groups with search and filtering
 */

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@/types/convex";

interface Group {
  _id: Id<"groups">;
  slug: string;
  name: string;
  type:
    | "friend_circle"
    | "business"
    | "community"
    | "dao"
    | "government"
    | "organization";
  status: "active" | "archived";
  settings: {
    visibility: "public" | "private";
  };
}

interface GroupSelectorProps {
  selectedGroupId?: Id<"groups">;
  onGroupChange: (groupId: Id<"groups">) => void;
  filterByType?: Group["type"];
  filterByStatus?: "active" | "archived";
  className?: string;
}

const groupTypeLabels: Record<Group["type"], string> = {
  friend_circle: "Friend Circle",
  business: "Business",
  community: "Community",
  dao: "DAO",
  government: "Government",
  organization: "Organization",
};

const groupTypeColors: Record<
  Group["type"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  friend_circle: "secondary",
  business: "default",
  community: "outline",
  dao: "secondary",
  government: "default",
  organization: "default",
};

export function GroupSelector({
  selectedGroupId,
  onGroupChange,
  filterByType,
  filterByStatus = "active",
  className,
}: GroupSelectorProps) {
  const groups = useQuery(api.queries.groups.list, {
    type: filterByType,
    status: filterByStatus,
  });

  // Loading state
  if (groups === undefined) {
    return (
      <div className={className}>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No groups available. Create your first group to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        value={selectedGroupId}
        onValueChange={(value) => onGroupChange(value as Id<"groups">)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group: Group) => (
            <SelectItem key={group._id} value={group._id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{group.name}</span>
                <Badge
                  variant={groupTypeColors[group.type as keyof typeof groupTypeColors]}
                  className="text-xs"
                >
                  {groupTypeLabels[group.type as keyof typeof groupTypeLabels]}
                </Badge>
                {group.settings.visibility === "private" && (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
