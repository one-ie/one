import * as React from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "../ui/button";

export const SignOutButton: React.FC = () => {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) return null;

  return (
    <Button variant="default" onClick={() => void signOut()}>
      Sign out
    </Button>
  );
};
