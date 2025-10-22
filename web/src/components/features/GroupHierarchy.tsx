/**
 * GroupHierarchy Component
 * Visual tree of nested groups with expand/collapse functionality
 */

import * as React from "react";
import { useGroup, useGroups, type Group } from "@/hooks/useGroups";
import { ChevronRight, ChevronDown, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Id } from "@/types/convex";

interface GroupWithDepth extends Group {
  depth?: number;
}

interface GroupHierarchyProps {
  rootGroupId: Id<"groups">;
  onGroupClick?: (groupId: Id<"groups">) => void;
  selectedGroupId?: Id<"groups">;
  maxDepth?: number;
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

function GroupNode({
  group,
  onGroupClick,
  selectedGroupId,
}: {
  group: GroupWithDepth;
  onGroupClick?: (groupId: Id<"groups">) => void;
  selectedGroupId?: Id<"groups">;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const { data: subgroups, loading: loadingSubgroups } = useGroups({
    parentGroupId: group._id,
    status: 'active',
  });

  const hasChildren = subgroups && subgroups.length > 0;
  const isSelected = selectedGroupId === group._id;
  const depth = group.depth || 0;

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent transition-colors",
          isSelected && "bg-accent",
          "cursor-pointer"
        )}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        onClick={() => onGroupClick?.(group._id)}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <div className="flex flex-1 items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{group.name}</span>
          <Badge variant="outline" className="text-xs">
            {groupTypeLabels[group.type]}
          </Badge>
          {group.settings.visibility === "private" && (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {subgroups.map((subgroup) => (
            <GroupNode
              key={subgroup._id}
              group={{ ...subgroup, depth: depth + 1 }}
              onGroupClick={onGroupClick}
              selectedGroupId={selectedGroupId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupHierarchy({
  rootGroupId,
  onGroupClick,
  selectedGroupId,
  maxDepth = 10,
  className,
}: GroupHierarchyProps) {
  const { data: rootGroup, loading, error } = useGroup(rootGroupId);

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full ml-6" />
        <Skeleton className="h-10 w-full ml-6" />
        <Skeleton className="h-10 w-full ml-12" />
      </div>
    );
  }

  // Error state
  if (error || !rootGroup) {
    return (
      <div className={cn("rounded-lg border border-destructive p-4", className)}>
        <p className="text-sm text-destructive">
          {error?.message || "Group not found. The group may have been deleted or you may not have access."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <GroupNode
        group={rootGroup}
        onGroupClick={onGroupClick}
        selectedGroupId={selectedGroupId}
      />
    </div>
  );
}
