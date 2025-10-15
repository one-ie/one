/**
 * GroupTypeSelector Component
 * Radio buttons for selecting one of 6 group types with descriptions
 */

import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  Globe,
  Coins,
  Building2,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

type GroupType =
  | "friend_circle"
  | "business"
  | "community"
  | "dao"
  | "government"
  | "organization";

interface GroupTypeOption {
  value: GroupType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const groupTypes: GroupTypeOption[] = [
  {
    value: "friend_circle",
    label: "Friend Circle",
    description: "Small private group for friends and family",
    icon: Users,
    color: "text-blue-500",
  },
  {
    value: "business",
    label: "Business",
    description: "Professional organization or company",
    icon: Briefcase,
    color: "text-purple-500",
  },
  {
    value: "community",
    label: "Community",
    description: "Public community for shared interests",
    icon: Globe,
    color: "text-green-500",
  },
  {
    value: "dao",
    label: "DAO",
    description: "Decentralized autonomous organization",
    icon: Coins,
    color: "text-orange-500",
  },
  {
    value: "government",
    label: "Government",
    description: "Government entity or public institution",
    icon: Building2,
    color: "text-red-500",
  },
  {
    value: "organization",
    label: "Organization",
    description: "General purpose organization",
    icon: Building,
    color: "text-gray-500",
  },
];

interface GroupTypeSelectorProps {
  value?: GroupType;
  onValueChange: (value: GroupType) => void;
  className?: string;
  layout?: "vertical" | "grid";
}

export function GroupTypeSelector({
  value,
  onValueChange,
  className,
  layout = "vertical",
}: GroupTypeSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onValueChange(val as GroupType)}
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
          : "space-y-4",
        className
      )}
    >
      {groupTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;

        return (
          <Label
            key={type.value}
            htmlFor={type.value}
            className="cursor-pointer"
          >
            <Card
              className={cn(
                "transition-all hover:border-primary hover:shadow-md",
                isSelected && "border-primary shadow-md bg-accent"
              )}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("h-5 w-5", type.color)} />
                    <span className="font-semibold text-base">
                      {type.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
