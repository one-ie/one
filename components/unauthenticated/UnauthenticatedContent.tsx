import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronRight, ArrowLeft, Mail } from "lucide-react";
import { SignInWithGithub } from "./SignInWithGithub";
import { SignInWithPassword } from "./SignInWithPassword";

export function UnauthenticatedContent() {
  const [showPasswordSignIn, setShowPasswordSignIn] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signIn" | "signUp">("signIn");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="mb-8 flex flex-col items-center">
        <img src="/logo.svg" alt="ONE logo" className="w-72 h-auto mb-2" />
      </div>
      <Card className="w-full max-w-xs relative overflow-hidden shadow-md border-neutral-200 p-0">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: showPasswordSignIn
              ? "translateX(-100%)"
              : "translateX(0)",
          }}
        >
          {/* First page - GitHub sign-in */}
          <div className="min-w-full shrink-0">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <SignInWithGithub />
              <div className="flex items-center gap-4 w-full my-2">
                <div className="h-px bg-neutral-300 flex-1" />
                <span className="text-neutral-700 text-sm font-medium px-2">
                  or
                </span>
                <div className="h-px bg-neutral-300 flex-1" />
              </div>
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={() => setShowPasswordSignIn(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Email
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </div>

          {/* Second page - Password sign-in */}
          {showPasswordSignIn ? (
            <div className="min-w-full shrink-0">
              <CardHeader className="relative pb-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-4"
                  onClick={() => setShowPasswordSignIn(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl text-center mt-2 pt-4">
                  {authMode === "signIn"
                    ? "Sign in with Email"
                    : "Create an Account"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SignInWithPassword onModeChange={setAuthMode} />
              </CardContent>
            </div>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
