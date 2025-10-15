import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useMagicLinkAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MagicLinkAuthProps {
  token: string
}

export function MagicLinkAuth({ token }: MagicLinkAuthProps) {
  const [authSuccess, setAuthSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [authenticating, setAuthenticating] = useState(true)
  const { mutate: authenticate, loading } = useMagicLinkAuth()

  useEffect(() => {
    // Auto-authenticate on mount if token exists
    const authenticateWithMagicLink = async () => {
      if (!token) {
        setTokenValid(false)
        setAuthenticating(false)
        toast.error("No magic link token", {
          description: "This link is missing a token."
        })
        return
      }

      try {
        const result = await authenticate({ token })

        if (result?.success) {
          setAuthSuccess(true)
          toast.success("Signed in successfully!", {
            description: "Redirecting to your dashboard..."
          })

          setTimeout(() => {
            window.location.href = "/account"
          }, 1500)
        }
      } catch (err: any) {
        setTokenValid(false)
        const errorMessage = err.message || "Unable to sign in"
        let title = "Authentication failed"
        let description = errorMessage

        // Check for typed errors
        if (err._tag === 'InvalidToken' || err._tag === 'TokenExpired') {
          title = "Invalid or expired link"
          description = "This magic link has expired or is invalid. Magic links expire after 15 minutes."
        } else if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
          title = "Invalid or expired link"
          description = "This magic link has expired or is invalid. Magic links expire after 15 minutes."
        }

        toast.error(title, {
          description
        })
      } finally {
        setAuthenticating(false)
      }
    }

    authenticateWithMagicLink()
  }, [token, authenticate])

  if (authenticating || loading) {
    return (
      <AuthCard
        title="Signing you in"
        description="Please wait while we authenticate your magic link"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthCard>
    )
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Authentication failed"
        description="This magic link is no longer valid"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/account/magic-link" className="text-primary hover:underline">Request a new magic link</a>
          </p>
        }
      >
        <Alert variant="destructive">
          <Mail className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This magic link has expired or is invalid. Magic links expire after 15 minutes and can only be used once.
          </AlertDescription>
        </Alert>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/magic-link">Request new magic link</a>
        </Button>
      </AuthCard>
    )
  }

  if (authSuccess) {
    return (
      <AuthCard
        title="Signed in successfully!"
        description="Redirecting to your dashboard"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            <a href="/account" className="text-primary hover:underline">Go to dashboard</a>
          </p>
        }
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            You've been successfully signed in with your magic link.
          </AlertDescription>
        </Alert>

        <Button className="w-full" asChild>
          <a href="/account">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  return null
}
