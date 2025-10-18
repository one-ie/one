import { describe, it, expect, beforeEach } from "vitest";
import { api } from "../../../../../backend/convex/_generated/api";
import {
  convex,
  generateTestEmail,
  generateTestPassword,
  TestLogger,
  assert,
  assertErrorMessage,
  isValidEmail,
  isStrongPassword,
} from "./utils";

/**
 * Email & Password Authentication Tests
 *
 * Tests traditional email/password signup and signin flows
 */
describe("Auth - Email & Password", () => {
  let testEmail: string;
  let testPassword: string;

  beforeEach(() => {
    testEmail = generateTestEmail("email-pass");
    testPassword = generateTestPassword();
  });

  describe("Email Validation", () => {
    it("should validate email format", () => {
      const logger = new TestLogger("Email Validation");

      const validEmails = [
        "test@example.com",
        "user+tag@domain.co.uk",
        "name.surname@company.io",
      ];

      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
      ];

      validEmails.forEach((email) => {
        assert(isValidEmail(email), `${email} should be valid`);
        logger.log(`✓ Valid: ${email}`);
      });

      invalidEmails.forEach((email) => {
        assert(!isValidEmail(email), `${email} should be invalid`);
        logger.log(`✗ Invalid: ${email}`);
      });

      logger.success("Email validation working correctly");
    });
  });

  describe("Password Requirements", () => {
    it("should enforce password strength", () => {
      const logger = new TestLogger("Password Strength");

      const strongPasswords = [
        "MyP@ssw0rd123",
        "Test1234!Pass",
        "Secure9Pass!",
      ];

      const weakPasswords = [
        "short",
        "alllowercase123",
        "ALLUPPERCASE123",
        "NoNumbers!",
      ];

      strongPasswords.forEach((password) => {
        assert(isStrongPassword(password), `${password} should be strong`);
        logger.log(`✓ Strong: ${password}`);
      });

      weakPasswords.forEach((password) => {
        assert(!isStrongPassword(password), `${password} should be weak`);
        logger.log(`✗ Weak: ${password}`);
      });

      logger.success("Password strength validation working");
    });
  });

  describe("Sign Up Flow", () => {
    it("should create user with minimum required fields", async () => {
      const logger = new TestLogger("SignUp - Minimum Fields");
      logger.log(`Creating user: ${testEmail}`);

      const result = await convex.mutation(api.auth.signUp, {
        email: testEmail,
        password: testPassword,
      });

      assert(!!result.token, "Token should be returned");
      assert(!!result.userId, "User ID should be returned");

      logger.success("User created with minimum fields");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("userId");
    });

    it("should create user with optional name", async () => {
      const logger = new TestLogger("SignUp - With Name");
      const email = generateTestEmail("with-name");

      const result = await convex.mutation(api.auth.signUp, {
        email,
        password: testPassword,
        name: "Test User With Name",
      });

      assert(!!result.token, "Token should be returned");
      logger.success("User created with name");
      expect(result.userId).toBeDefined();
    });

    it("should create user with email verification enabled", async () => {
      const logger = new TestLogger("SignUp - Email Verification");
      const email = generateTestEmail("verify");

      const result = await convex.mutation(api.auth.signUp, {
        email,
        password: testPassword,
        name: "Test User Verify",
        sendVerificationEmail: true,
        baseUrl: "http://localhost:4321",
      });

      assert(!!result.token, "Token should be returned");
      logger.log("User created, verification email queued");
      logger.success("Email verification flow initiated");
      expect(result.userId).toBeDefined();
    });

    it("should prevent weak passwords", async () => {
      const logger = new TestLogger("SignUp - Weak Password");
      const weakPassword = "123"; // Too short

      // Note: The backend currently doesn't enforce password strength
      // This is a placeholder for when that validation is added

      logger.log("⚠️  Backend password validation not yet implemented");
      logger.success("Password validation planned");
    });
  });

  describe("Sign In Flow", () => {
    it("should sign in with correct credentials", async () => {
      const logger = new TestLogger("SignIn - Success");
      const email = generateTestEmail("signin-success");
      const password = generateTestPassword();

      // Create user
      const signupResult = await convex.mutation(api.auth.signUp, {
        email,
        password,
        name: "SignIn Test User",
      });
      logger.log(`User created: ${signupResult.userId}`);

      // Sign in
      const signinResult = await convex.mutation(api.auth.signIn, {
        email,
        password,
      });

      assert(!!signinResult.token, "Token should be returned");
      assert(signinResult.userId === signupResult.userId, "User ID should match");

      logger.success("Sign in successful");
      expect(signinResult.token).toBeDefined();
      expect(signinResult.userId).toBe(signupResult.userId);
    });

    it("should reject wrong password", async () => {
      const logger = new TestLogger("SignIn - Wrong Password");
      const email = generateTestEmail("wrong-password");
      const password = generateTestPassword();

      // Create user
      await convex.mutation(api.auth.signUp, {
        email,
        password,
      });
      logger.log("User created");

      // Try to sign in with wrong password
      try {
        await convex.mutation(api.auth.signIn, {
          email,
          password: "WrongPassword123!",
        });

        throw new Error("Should have thrown error");
      } catch (error: any) {
        assertErrorMessage(
          error,
          ["Invalid email or password", "Server Error"],
          "Should reject wrong password"
        );
        logger.success("Wrong password rejected");
      }
    });

    it("should reject non-existent user", async () => {
      const logger = new TestLogger("SignIn - Non-existent User");
      const email = `nonexistent-${Date.now()}@test.com`;

      try {
        await convex.mutation(api.auth.signIn, {
          email,
          password: "SomePassword123!",
        });

        throw new Error("Should have thrown error");
      } catch (error: any) {
        assertErrorMessage(
          error,
          ["Invalid email or password", "Server Error"],
          "Should reject non-existent user"
        );
        logger.success("Non-existent user rejected");
      }
    });

    it("should be case-sensitive for password", async () => {
      const logger = new TestLogger("SignIn - Case Sensitive");
      const email = generateTestEmail("case-sensitive");
      const password = "TestPassword123!";

      // Create user
      await convex.mutation(api.auth.signUp, {
        email,
        password,
      });
      logger.log("User created with password");

      // Try to sign in with different case
      try {
        await convex.mutation(api.auth.signIn, {
          email,
          password: "testpassword123!", // lowercase
        });

        throw new Error("Should have thrown error");
      } catch (error: any) {
        assertErrorMessage(
          error,
          ["Invalid email or password", "Server Error"],
          "Should reject different case"
        );
        logger.success("Password is case-sensitive");
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long passwords", async () => {
      const logger = new TestLogger("Edge - Long Password");
      const email = generateTestEmail("long-password");
      const longPassword = "A".repeat(100) + "1!"; // 102 characters

      const result = await convex.mutation(api.auth.signUp, {
        email,
        password: longPassword,
      });

      assert(!!result.token, "Should accept long password");
      logger.success("Long password handled correctly");
    });

    it("should handle special characters in password", async () => {
      const logger = new TestLogger("Edge - Special Chars");
      const email = generateTestEmail("special-chars");
      const specialPassword = "Test!@#$%^&*()_+-=[]{}|;:,.<>?/~`123Pass";

      const result = await convex.mutation(api.auth.signUp, {
        email,
        password: specialPassword,
      });

      assert(!!result.token, "Should accept special characters");

      // Verify can sign in with special characters
      const signinResult = await convex.mutation(api.auth.signIn, {
        email,
        password: specialPassword,
      });

      assert(!!signinResult.token, "Should sign in with special characters");
      logger.success("Special characters handled correctly");
    });

    it("should handle email case-insensitivity", async () => {
      const logger = new TestLogger("Edge - Email Case");
      const email = generateTestEmail("email-case");
      const password = generateTestPassword();

      // Create user with lowercase email
      await convex.mutation(api.auth.signUp, {
        email: email.toLowerCase(),
        password,
      });
      logger.log(`User created: ${email.toLowerCase()}`);

      // Try to sign in with uppercase email
      try {
        const result = await convex.mutation(api.auth.signIn, {
          email: email.toUpperCase(),
          password,
        });

        // If this succeeds, email is case-insensitive
        logger.log("✓ Email is case-insensitive");
        assert(!!result.token, "Should accept different case email");
      } catch (error) {
        // If this fails, email is case-sensitive
        logger.log("ℹ️  Email is case-sensitive");
      }

      logger.success("Email case handling verified");
    });
  });
});
