/**
 * BetterAuthProvider - Authentication Provider Implementation
 *
 * Wraps Better Auth + Convex auth to implement DataProvider auth interface.
 * Maps backend Convex auth mutations to typed Effect operations.
 *
 * IMPORTANT: This is a THIN wrapper. It calls existing Convex auth mutations
 * without breaking them. Zero changes to backend required.
 */

import { Effect } from "effect";
import type { ConvexReactClient } from "convex/react";
import type {
  AuthResult,
  User,
  TwoFactorStatus,
  TwoFactorSetup,
  LoginArgs,
  SignupArgs,
  MagicLinkArgs,
  PasswordResetArgs,
  PasswordResetCompleteArgs,
  VerifyEmailArgs,
  Verify2FAArgs,
  Disable2FAArgs,
  AuthError,
  InvalidCredentialsError,
  UserNotFoundError,
  EmailAlreadyExistsError,
  WeakPasswordError,
  InvalidTokenError,
  TokenExpiredError,
  NetworkError,
  RateLimitExceededError,
  EmailNotVerifiedError,
  TwoFactorRequiredError,
  Invalid2FACodeError,
} from "./DataProvider";

/**
 * Parse backend error message to typed AuthError
 */
function parseAuthError(error: unknown): AuthError {
  const message = String(error);

  // Map common error messages to typed errors
  if (
    message.toLowerCase().includes("invalid email or password") ||
    message.toLowerCase().includes("invalid password") ||
    message.toLowerCase().includes("incorrect")
  ) {
    return { _tag: "InvalidCredentials", message: "Invalid email or password" } as InvalidCredentialsError;
  }

  if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("no user")) {
    return { _tag: "UserNotFound", message: "User not found" } as UserNotFoundError;
  }

  if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("email is already in use")) {
    return { _tag: "EmailAlreadyExists", message: "Email already registered" } as EmailAlreadyExistsError;
  }

  if (message.toLowerCase().includes("password") && message.toLowerCase().includes("weak")) {
    return { _tag: "WeakPassword", message: "Password must be at least 8 characters" } as WeakPasswordError;
  }

  if (message.toLowerCase().includes("token") && message.toLowerCase().includes("expired")) {
    return { _tag: "TokenExpired", message: "Token has expired" } as TokenExpiredError;
  }

  if (
    message.toLowerCase().includes("invalid") &&
    (message.toLowerCase().includes("token") || message.toLowerCase().includes("link"))
  ) {
    return { _tag: "InvalidToken", message: "Invalid or expired token" } as InvalidTokenError;
  }

  if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many")) {
    return { _tag: "RateLimitExceeded", message: "Too many requests, please wait" } as RateLimitExceededError;
  }

  if (message.toLowerCase().includes("email") && message.toLowerCase().includes("verified")) {
    return { _tag: "EmailNotVerified", message: "Email address not verified" } as EmailNotVerifiedError;
  }

  if (message.toLowerCase().includes("2fa") || message.toLowerCase().includes("two-factor")) {
    if (message.toLowerCase().includes("required")) {
      return { _tag: "TwoFactorRequired", message: "Two-factor authentication required" } as TwoFactorRequiredError;
    }
    return { _tag: "Invalid2FACode", message: "Invalid 2FA code" } as Invalid2FACodeError;
  }

  // Default to network error
  return { _tag: "NetworkError", message } as NetworkError;
}

/**
 * Get auth token from cookies (client-side)
 */
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find((row) => row.startsWith("auth_token="));
  return authCookie ? authCookie.split("=")[1] : null;
}

/**
 * Set auth token in cookies (client-side)
 */
function setAuthToken(token: string) {
  if (typeof document === "undefined") return;
  // SameSite=Lax is required for cookies to be sent with fetch requests
  document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`; // 30 days
}

/**
 * Clear auth token from cookies (client-side)
 */
function clearAuthToken() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0";
}

/**
 * Create auth methods for DataProvider
 */
export function createBetterAuthProvider(client: ConvexReactClient) {
  return {
    // ===== LOGIN =====
    login: (args: LoginArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signIn" as any, {
            email: args.email,
            password: args.password,
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== SIGNUP =====
    signup: (args: SignupArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signUp" as any, {
            email: args.email,
            password: args.password,
            name: args.name,
            sendVerificationEmail: true,
            baseUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== LOGOUT =====
    logout: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (token) {
            await client.mutation("auth:signOut" as any, { token });
            clearAuthToken();
          }
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== GET CURRENT USER =====
    getCurrentUser: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) return null;

          const user = await client.query("auth:getCurrentUser" as any, { token });
          return user as User | null;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== MAGIC LINK AUTH =====
    magicLinkAuth: (args: MagicLinkArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signInWithMagicLink" as any, {
            token: args.token,
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== PASSWORD RESET =====
    passwordReset: (args: PasswordResetArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:requestPasswordReset" as any, {
            email: args.email,
            baseUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
          });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== PASSWORD RESET COMPLETE =====
    passwordResetComplete: (args: PasswordResetCompleteArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:resetPassword" as any, {
            token: args.token,
            password: args.newPassword,
          });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== VERIFY EMAIL =====
    verifyEmail: (args: VerifyEmailArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:verifyEmail" as any, {
            token: args.token,
          });

          return {
            success: true,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== GET 2FA STATUS =====
    get2FAStatus: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          const result = await client.query("auth:get2FAStatus" as any, { token });
          return result as TwoFactorStatus;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== SETUP 2FA =====
    setup2FA: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          const result = await client.mutation("auth:setup2FA" as any, { token });
          return result as TwoFactorSetup;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== VERIFY 2FA =====
    verify2FA: (args: Verify2FAArgs) =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          await client.mutation("auth:verify2FA" as any, { token });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== DISABLE 2FA =====
    disable2FA: (args: Disable2FAArgs) =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          await client.mutation("auth:disable2FA" as any, {
            token,
            password: args.password,
          });
        },
        catch: (error) => parseAuthError(error),
      }),
  };
}
