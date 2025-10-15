/**
 * Auth Hooks - Backend-Agnostic Authentication
 *
 * Provides React hooks for all authentication methods through DataProvider interface.
 * Maps directly to backend auth functions (Convex mutations).
 *
 * @example
 * ```tsx
 * import { useLogin, useSignup, useCurrentUser } from '@/hooks/useAuth';
 *
 * function LoginForm() {
 *   const { mutate: login, loading, error } = useLogin();
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     try {
 *       const result = await login({ email, password });
 *       if (result.success) {
 *         console.log('Logged in:', result.user);
 *       }
 *     } catch (err) {
 *       if (err._tag === 'InvalidCredentials') {
 *         console.error('Wrong password');
 *       }
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={() => handleSubmit('test@example.com', 'pass')}>
 *       <button disabled={loading}>
 *         {loading ? 'Signing in...' : 'Sign In'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { useDataProvider } from './useDataProvider';
import { Effect } from 'effect';
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
} from '@/providers/DataProvider';

// ============================================================================
// HOOK RESULT TYPES
// ============================================================================

interface MutationResult<TData, TArgs> {
  mutate: (args: TArgs) => Promise<TData>;
  loading: boolean;
  error: AuthError | null;
}

interface QueryResult<TData> {
  data: TData | null;
  loading: boolean;
  error: AuthError | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// LOGIN HOOK
// ============================================================================

/**
 * useLogin - Email/password authentication
 *
 * @example
 * ```tsx
 * const { mutate: login, loading, error } = useLogin();
 *
 * try {
 *   const result = await login({ email: 'user@example.com', password: 'pass123' });
 *   if (result.success) {
 *     window.location.href = '/account';
 *   }
 * } catch (err) {
 *   if (err._tag === 'InvalidCredentials') {
 *     toast.error('Wrong password');
 *   }
 * }
 * ```
 */
export function useLogin(): MutationResult<AuthResult, LoginArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: LoginArgs): Promise<AuthResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await Effect.runPromise(provider.auth.login(args));
        setLoading(false);
        return result;
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

// ============================================================================
// SIGNUP HOOK
// ============================================================================

/**
 * useSignup - Create new account with email/password
 *
 * @example
 * ```tsx
 * const { mutate: signup, loading, error } = useSignup();
 *
 * await signup({
 *   email: 'new@example.com',
 *   password: 'securepass',
 *   name: 'John Doe'
 * });
 * ```
 */
export function useSignup(): MutationResult<AuthResult, SignupArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: SignupArgs): Promise<AuthResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await Effect.runPromise(provider.auth.signup(args));
        setLoading(false);
        return result;
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

// ============================================================================
// LOGOUT HOOK
// ============================================================================

/**
 * useLogout - Sign out current user
 *
 * @example
 * ```tsx
 * const { mutate: logout, loading } = useLogout();
 *
 * await logout();
 * window.location.href = '/';
 * ```
 */
export function useLogout(): MutationResult<void, void> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await Effect.runPromise(provider.auth.logout());
      setLoading(false);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      setLoading(false);
      throw authError;
    }
  }, [provider]);

  return { mutate, loading, error };
}

// ============================================================================
// CURRENT USER HOOK
// ============================================================================

/**
 * useCurrentUser - Get authenticated user
 *
 * @example
 * ```tsx
 * const { data: user, loading, refetch } = useCurrentUser();
 *
 * if (loading) return <div>Loading...</div>;
 * if (!user) return <div>Not logged in</div>;
 *
 * return <div>Welcome {user.name}!</div>;
 * ```
 */
export function useCurrentUser(): QueryResult<User> {
  const provider = useDataProvider();
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await Effect.runPromise(provider.auth.getCurrentUser());
      setData(user);
      setLoading(false);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      setLoading(false);
      throw authError;
    }
  }, [provider]);

  // Initial fetch
  useState(() => {
    refetch().catch(() => {
      // Error already handled in refetch
    });
  });

  return { data, loading, error, refetch };
}

// ============================================================================
// MAGIC LINK HOOK
// ============================================================================

/**
 * useMagicLinkAuth - Passwordless authentication with magic link
 *
 * @example
 * ```tsx
 * const { mutate: authenticate, loading } = useMagicLinkAuth();
 *
 * useEffect(() => {
 *   const token = new URLSearchParams(window.location.search).get('token');
 *   if (token) {
 *     authenticate({ token });
 *   }
 * }, []);
 * ```
 */
export function useMagicLinkAuth(): MutationResult<AuthResult, MagicLinkArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: MagicLinkArgs): Promise<AuthResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await Effect.runPromise(provider.auth.magicLinkAuth(args));
        setLoading(false);
        return result;
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

// ============================================================================
// PASSWORD RESET HOOKS
// ============================================================================

/**
 * usePasswordReset - Request password reset email
 *
 * @example
 * ```tsx
 * const { mutate: requestReset, loading } = usePasswordReset();
 *
 * await requestReset({ email: 'user@example.com' });
 * toast.success('Check your email for reset link');
 * ```
 */
export function usePasswordReset(): MutationResult<void, PasswordResetArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: PasswordResetArgs): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await Effect.runPromise(provider.auth.passwordReset(args));
        setLoading(false);
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

/**
 * usePasswordResetComplete - Complete password reset with token
 *
 * @example
 * ```tsx
 * const { mutate: resetPassword, loading } = usePasswordResetComplete();
 *
 * await resetPassword({
 *   token: 'reset-token-from-email',
 *   newPassword: 'newSecurePassword123'
 * });
 * ```
 */
export function usePasswordResetComplete(): MutationResult<void, PasswordResetCompleteArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: PasswordResetCompleteArgs): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await Effect.runPromise(provider.auth.passwordResetComplete(args));
        setLoading(false);
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

// ============================================================================
// EMAIL VERIFICATION HOOK
// ============================================================================

/**
 * useVerifyEmail - Verify email address with token
 *
 * @example
 * ```tsx
 * const { mutate: verify, loading } = useVerifyEmail();
 *
 * useEffect(() => {
 *   const token = new URLSearchParams(window.location.search).get('token');
 *   if (token) {
 *     verify({ token });
 *   }
 * }, []);
 * ```
 */
export function useVerifyEmail(): MutationResult<AuthResult, VerifyEmailArgs> {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const mutate = useCallback(
    async (args: VerifyEmailArgs): Promise<AuthResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await Effect.runPromise(provider.auth.verifyEmail(args));
        setLoading(false);
        return result;
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { mutate, loading, error };
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION HOOKS
// ============================================================================

/**
 * use2FA - Complete 2FA management
 *
 * @example
 * ```tsx
 * const { getStatus, setup, verify, disable, loading } = use2FA();
 *
 * // Check status
 * const status = await getStatus();
 * console.log('2FA enabled:', status.enabled);
 *
 * // Setup 2FA
 * const { secret, backupCodes } = await setup();
 *
 * // Verify and enable
 * await verify({ code: '123456' });
 *
 * // Disable
 * await disable({ password: 'mypassword' });
 * ```
 */
export function use2FA() {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const getStatus = useCallback(async (): Promise<TwoFactorStatus> => {
    try {
      return await Effect.runPromise(provider.auth.get2FAStatus());
    } catch (err) {
      throw err as AuthError;
    }
  }, [provider]);

  const setup = useCallback(async (): Promise<TwoFactorSetup> => {
    setLoading(true);
    setError(null);

    try {
      const result = await Effect.runPromise(provider.auth.setup2FA());
      setLoading(false);
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      setLoading(false);
      throw authError;
    }
  }, [provider]);

  const verify = useCallback(
    async (args: Verify2FAArgs): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await Effect.runPromise(provider.auth.verify2FA(args));
        setLoading(false);
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  const disable = useCallback(
    async (args: Disable2FAArgs): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await Effect.runPromise(provider.auth.disable2FA(args));
        setLoading(false);
      } catch (err) {
        const authError = err as AuthError;
        setError(authError);
        setLoading(false);
        throw authError;
      }
    },
    [provider]
  );

  return { getStatus, setup, verify, disable, loading, error };
}
