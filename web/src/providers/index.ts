/**
 * DataProvider Exports
 *
 * Central export for all DataProvider functionality.
 * Organizations can switch backends by changing ONE import.
 */

// Main interface and types
export type {
  DataProvider,
  Thing,
  Connection,
  Event,
  Knowledge,
  ThingKnowledge,
  CreateThingInput,
  UpdateThingInput,
  CreateConnectionInput,
  CreateEventInput,
  CreateKnowledgeInput,
  ListThingsOptions,
  ListConnectionsOptions,
  ListEventsOptions,
  SearchKnowledgeOptions,
  ThingStatus,
  ConnectionType,
  KnowledgeType,
  DataProviderError,
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionNotFoundError,
  ConnectionCreateError,
  EventCreateError,
  KnowledgeNotFoundError,
  QueryError,
  // Auth types
  User,
  AuthResult,
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

// Effect.ts service tag
export { DataProviderService } from "./DataProvider";

// Convex implementation
export { createConvexProvider } from "./ConvexProvider";
export type { ConvexProviderConfig } from "./ConvexProvider";

// Factory pattern
export {
  createDataProvider,
  createDataProviderLayer,
  initializeDefaultProvider,
  getDefaultProvider,
} from "./factory";
export type { ProviderType, ProviderConfig } from "./factory";
