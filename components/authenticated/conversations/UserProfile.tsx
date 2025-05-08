import * as React from "react";
import { Card } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { SignOutButton } from "../SignOutButton";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

interface UserProfileProps {}

export const UserProfile: React.FC<UserProfileProps> = ({}) => {
  const me = useQuery(api.users.queries.getMe);
  return (
    <Card className="m-2 p-2 bg-accent/50 border-accent/50">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={me?.image} />
          <AvatarFallback>{me?.name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-primary-foreground truncate">
            {me?.name}
          </div>
          <div className="text-xs text-muted-foreground/80 truncate">
            {me?.email}
          </div>
        </div>
        <SignOutButton />
      </div>
    </Card>
  );
};
