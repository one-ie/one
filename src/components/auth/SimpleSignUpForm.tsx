import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignup } from "@/hooks/useAuth"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

export function SimpleSignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const { mutate: signup, loading } = useSignup()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await signup({ email, password, name })

      if (result.success) {
        // Success
        toast.success("Account created successfully!", {
          description: `Welcome ${name}! Redirecting to your dashboard...`
        })

        setTimeout(() => {
          window.location.href = "/account"
        }, 1000)
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      let title = "Unable to create account"
      let description = `Error: ${errorMessage}. Please verify your information and try again.`

      // Check for typed errors
      if (err._tag === 'UserAlreadyExists') {
        title = "Email already registered"
        description = "This email is already in use. Please sign in instead or use a different email address."
      } else if (err._tag === 'WeakPassword') {
        title = "Invalid password"
        description = "Password must be at least 8 characters long and contain letters and numbers."
      } else if (err._tag === 'InvalidEmail') {
        title = "Invalid email"
        description = "Please enter a valid email address (e.g., yourname@example.com)."
      } else {
        // Fallback to message-based error handling
        if (errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("already registered") || errorMessage.toLowerCase().includes("user with this email")) {
          title = "Email already registered"
          description = "This email is already in use. Please sign in instead or use a different email address."
        } else if (errorMessage.toLowerCase().includes("password")) {
          title = "Invalid password"
          description = "Password must be at least 8 characters long and contain letters and numbers."
        } else if (errorMessage.toLowerCase().includes("email")) {
          title = "Invalid email"
          description = "Please enter a valid email address (e.g., yourname@example.com)."
        } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection") || errorMessage.toLowerCase().includes("fetch")) {
          title = "Network error"
          description = "Unable to connect to the server. Please check your internet connection and try again."
        } else if (errorMessage.toLowerCase().includes("timeout")) {
          title = "Request timeout"
          description = "The server is taking too long to respond. Please try again in a moment."
        } else if (errorMessage.toLowerCase().includes("cors")) {
          title = "Configuration error"
          description = "There's a configuration issue preventing sign up. Please contact support."
        } else if (errorMessage.toLowerCase().includes("required") || errorMessage.toLowerCase().includes("missing")) {
          title = "Missing information"
          description = "Please fill in all required fields (name, email, and password)."
        }
      }

      toast.error(title, {
        description: description
      })
    }
  }

  const handleGithubSignIn = () => {
    window.location.href = "/api/auth/github"
  }

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <AuthCard
      title="Create Account"
      description="Sign up to get started"
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Already have an account? <a href="/account/signin" className="text-primary hover:underline">Sign in</a>
        </p>
      }
    >
      <SocialLoginButtons
        mode="signup"
        onGithubClick={handleGithubSignIn}
        onGoogleClick={handleGoogleSignIn}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </AuthCard>
  )
}
