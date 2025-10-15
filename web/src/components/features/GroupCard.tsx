/**
 * GroupCard Component
 * Beautiful card component for displaying group information
 */

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  Globe,
  Coins,
  Building2,
  Building,
  Lock,
  Eye,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGroup, useGroupStats, type Group } from "@/hooks/useGroups";
import type { Id } from "@/types/convex";

interface GroupCardProps {
  groupId: Id<"groups">;
  showStats?: boolean;
  showActions?: boolean;
  onViewClick?: (groupId: Id<"groups">) => void;
  onJoinClick?: (groupId: Id<"groups">) => void;
  className?: string;
}

const groupTypeConfig = {
  friend_circle: {
    label: "Friend Circle",
    icon: Users,
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
  business: {
    label: "Business",
    icon: Briefcase,
    color: "bg-purple-500",
    textColor: "text-purple-500",
  },
  community: {
    label: "Community",
    icon: Globe,
    color: "bg-green-500",
    textColor: "text-green-500",
  },
  dao: {
    label: "DAO",
    icon: Coins,
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  government: {
    label: "Government",
    icon: Building2,
    color: "bg-red-500",
    textColor: "text-red-500",
  },
  organization: {
    label: "Organization",
    icon: Building,
    color: "bg-gray-500",
    textColor: "text-gray-500",
  },
};

const joinPolicyLabels = {
  open: "Open to Join",
  invite_only: "Invite Only",
  approval_required: "Approval Required",
};

const planLabels = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function GroupCard({
  groupId,
  showStats = true,
  showActions = true,
  onViewClick,
  onJoinClick,
  className,
}: GroupCardProps) {
  const { data: group, loading: groupLoading } = useGroup(groupId);
  const { data: stats, loading: statsLoading } = useGroupStats(groupId, {
    includeSubgroups: false,
    enabled: showStats,
  });

  // Loading state
  if (groupLoading || (showStats && statsLoading)) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        {showActions && (
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // Error state
  if (!group) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Group not found or you don't have access.
          </p>
        </CardContent>
      </Card>
    );
  }

  const typeConfig = groupTypeConfig[group.type as keyof typeof groupTypeConfig];
  const Icon = typeConfig.icon;
  const isPrivate = group.settings.visibility === "private";

  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      {/* Header with colored bar */}
      <div className={cn("h-2", typeConfig.color)} />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                typeConfig.color,
                "bg-opacity-10"
              )}
            >
              <Icon className={cn("h-5 w-5", typeConfig.textColor)} />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">
                {typeConfig.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPrivate ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            {group.settings.plan && (
              <Badge variant="secondary" className="text-xs">
                {planLabels[group.settings.plan as keyof typeof planLabels]}
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-xl">{group.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {group.description || "No description provided."}
        </CardDescription>
      </CardHeader>

      {showStats && stats && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.members}
              </div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.entities}
              </div>
              <div className="text-xs text-muted-foreground">Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.connections}
              </div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.events}
              </div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {joinPolicyLabels[group.settings.joinPolicy as keyof typeof joinPolicyLabels]}
            </Badge>
            {group.status === "archived" && (
              <Badge variant="destructive" className="text-xs">
                Archived
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {showActions && (
        <CardFooter className="flex gap-2">
          {onViewClick && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewClick(group._id)}
            >
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {onJoinClick &&
            group.status === "active" &&
            group.settings.joinPolicy !== "invite_only" && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => onJoinClick(group._id)}
              >
                Join Group
              </Button>
            )}
        </CardFooter>
      )}
    </Card>
  );
}
