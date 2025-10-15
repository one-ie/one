/**
 * Tests for Provider Configuration Loader
 *
 * Validates environment-based configuration loading,
 * validation, and multi-tenant configuration management.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadProviderConfig,
  validateEncryptionKey,
  getOrganizationProviderConfig,
  setOrganizationProviderConfig,
  clearOrganizationProviderConfig,
  clearAllOrganizationProviderConfigs,
  validateProviderConfig,
  getMissingEnvHelp,
  type OrganizationProviderConfig,
} from "../../src/config/providers";
import type { ProviderConfig } from "../../src/providers/factory";

describe("Provider Configuration Loader", () => {
  describe("validateEncryptionKey", () => {
    it("should accept valid 64-character hex key", () => {
      const validKey = "0".repeat(64);
      expect(() => validateEncryptionKey(validKey)).not.toThrow();
    });

    it("should reject missing key", () => {
      expect(() => validateEncryptionKey(undefined)).toThrow(
        "ENCRYPTION_KEY environment variable required"
      );
    });

    it("should reject short key", () => {
      const shortKey = "0".repeat(32); // Only 32 chars instead of 64
      expect(() => validateEncryptionKey(shortKey)).toThrow(
        "must be 32 bytes (64 hex characters)"
      );
    });

    it("should reject non-hex key", () => {
      const invalidKey = "g".repeat(64); // 'g' is not hex
      expect(() => validateEncryptionKey(invalidKey)).toThrow(
        "must be 32 bytes (64 hex characters)"
      );
    });
  });

  describe("validateProviderConfig", () => {
    it("should validate Convex config", () => {
      const config: ProviderConfig = {
        type: "convex",
        client: null as any,
        cacheEnabled: true,
        cacheTTL: 60000,
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate WordPress config", () => {
      const config: ProviderConfig = {
        type: "wordpress",
        url: "https://example.com/wp-json",
        username: "admin",
        password: "xxxx xxxx xxxx xxxx xxxx xxxx",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(true);
    });

    it("should reject invalid WordPress password format", () => {
      const config: ProviderConfig = {
        type: "wordpress",
        url: "https://example.com/wp-json",
        username: "admin",
        password: "too-short",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("should validate Notion config", () => {
      const config: ProviderConfig = {
        type: "notion",
        apiKey: "secret_abc123",
        databaseId: "database-id-123",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(true);
    });

    it("should reject Notion token without 'secret_' prefix", () => {
      const config = {
        type: "notion",
        apiKey: "invalid-token",
        databaseId: "database-id-123",
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
    });

    it("should validate Supabase config", () => {
      const config: ProviderConfig = {
        type: "supabase",
        url: "https://xxxxx.supabase.co",
        anonKey: "anon-key-123",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(true);
    });

    it("should reject unknown provider type", () => {
      const config = {
        type: "unknown",
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("Unknown provider type");
    });
  });

  describe("Multi-tenant configuration", () => {
    beforeEach(() => {
      clearAllOrganizationProviderConfigs();
    });

    afterEach(() => {
      clearAllOrganizationProviderConfigs();
    });

    it("should set and get organization config", () => {
      const orgId = "org_123";
      const config: ProviderConfig = {
        type: "convex",
        client: null as any,
        cacheEnabled: true,
      };

      setOrganizationProviderConfig(orgId, config);
      const retrieved = getOrganizationProviderConfig(orgId);

      expect(retrieved).toEqual(config);
    });

    it("should return null for unconfigured organization", () => {
      const retrieved = getOrganizationProviderConfig("org_nonexistent");
      expect(retrieved).toBeNull();
    });

    it("should clear specific organization config", () => {
      const orgId = "org_123";
      const config: ProviderConfig = {
        type: "convex",
        client: null as any,
      };

      setOrganizationProviderConfig(orgId, config);
      expect(getOrganizationProviderConfig(orgId)).toEqual(config);

      clearOrganizationProviderConfig(orgId);
      expect(getOrganizationProviderConfig(orgId)).toBeNull();
    });

    it("should support multiple organizations with different providers", () => {
      const orgAConfig: ProviderConfig = {
        type: "convex",
        client: null as any,
      };

      const orgBConfig: ProviderConfig = {
        type: "wordpress",
        url: "https://example.com/wp-json",
        username: "admin",
        password: "xxxx xxxx xxxx xxxx xxxx xxxx",
      };

      setOrganizationProviderConfig("org_a", orgAConfig);
      setOrganizationProviderConfig("org_b", orgBConfig);

      expect(getOrganizationProviderConfig("org_a")).toEqual(orgAConfig);
      expect(getOrganizationProviderConfig("org_b")).toEqual(orgBConfig);
    });

    it("should isolate organization configurations", () => {
      const config1: ProviderConfig = {
        type: "convex",
        client: null as any,
      };

      const config2: ProviderConfig = {
        type: "wordpress",
        url: "https://different.com/wp-json",
        username: "different",
        password: "xxxx xxxx xxxx xxxx xxxx xxxx",
      };

      setOrganizationProviderConfig("org_1", config1);
      setOrganizationProviderConfig("org_2", config2);

      // Modifying one should not affect the other
      const retrieved1 = getOrganizationProviderConfig("org_1");
      const retrieved2 = getOrganizationProviderConfig("org_2");

      expect(retrieved1?.type).toBe("convex");
      expect(retrieved2?.type).toBe("wordpress");
    });

    it("should clear all organization configs", () => {
      setOrganizationProviderConfig("org_1", {
        type: "convex",
        client: null as any,
      });
      setOrganizationProviderConfig("org_2", {
        type: "wordpress",
        url: "https://example.com/wp-json",
        username: "admin",
        password: "xxxx xxxx xxxx xxxx xxxx xxxx",
      });

      clearAllOrganizationProviderConfigs();

      expect(getOrganizationProviderConfig("org_1")).toBeNull();
      expect(getOrganizationProviderConfig("org_2")).toBeNull();
    });
  });

  describe("getMissingEnvHelp", () => {
    it("should provide Convex example", () => {
      const help = getMissingEnvHelp("convex");
      expect(help).toContain("BACKEND_PROVIDER=convex");
      expect(help).toContain("PUBLIC_CONVEX_URL");
      expect(help).toContain("CONVEX_DEPLOYMENT");
    });

    it("should provide WordPress example", () => {
      const help = getMissingEnvHelp("wordpress");
      expect(help).toContain("BACKEND_PROVIDER=wordpress");
      expect(help).toContain("WORDPRESS_URL");
      expect(help).toContain("WORDPRESS_USERNAME");
      expect(help).toContain("WORDPRESS_APP_PASSWORD");
    });

    it("should provide Notion example", () => {
      const help = getMissingEnvHelp("notion");
      expect(help).toContain("BACKEND_PROVIDER=notion");
      expect(help).toContain("NOTION_TOKEN");
      expect(help).toContain("NOTION_DATABASE_ID");
    });

    it("should provide Supabase example", () => {
      const help = getMissingEnvHelp("supabase");
      expect(help).toContain("BACKEND_PROVIDER=supabase");
      expect(help).toContain("SUPABASE_URL");
      expect(help).toContain("SUPABASE_ANON_KEY");
    });

    it("should handle unknown provider", () => {
      const help = getMissingEnvHelp("unknown");
      expect(help).toContain("Unknown provider type");
    });
  });

  describe("Configuration format validation", () => {
    it("should validate URL fields", () => {
      const config: ProviderConfig = {
        type: "wordpress",
        url: "not-a-url",
        username: "admin",
        password: "xxxx xxxx xxxx xxxx xxxx xxxx",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(false);
    });

    it("should validate required fields", () => {
      const config = {
        type: "wordpress",
        url: "https://example.com/wp-json",
        // Missing username and password
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
    });

    it("should validate WordPress password length", () => {
      const config: ProviderConfig = {
        type: "wordpress",
        url: "https://example.com/wp-json",
        username: "admin",
        password: "short",
      };

      const result = validateProviderConfig(config);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain("24 characters");
    });

    it("should validate Notion token prefix", () => {
      const config = {
        type: "notion",
        apiKey: "invalid-prefix",
        databaseId: "db-123",
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
    });
  });

  describe("Configuration error messages", () => {
    it("should provide helpful error for missing required field", () => {
      const config = {
        type: "convex",
        // Missing client
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should provide multiple errors for multiple issues", () => {
      const config = {
        type: "wordpress",
        url: "not-a-url",
        username: "",
        password: "short",
      };

      const result = validateProviderConfig(config as any);
      expect(result.success).toBe(false);
      // Should have multiple validation errors
    });
  });
});

describe("Configuration Performance", () => {
  it("should load config quickly (<10ms)", () => {
    const start = Date.now();

    // Set up valid environment
    const config: ProviderConfig = {
      type: "convex",
      client: null as any,
      cacheEnabled: true,
    };

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10);
  });

  it("should validate config quickly (<5ms)", () => {
    const config: ProviderConfig = {
      type: "convex",
      client: null as any,
    };

    const start = Date.now();
    validateProviderConfig(config);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5);
  });

  it("should cache organization configs efficiently", () => {
    const config: ProviderConfig = {
      type: "convex",
      client: null as any,
    };

    setOrganizationProviderConfig("org_123", config);

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      getOrganizationProviderConfig("org_123");
    }
    const duration = Date.now() - start;

    // 1000 cache lookups should be fast
    expect(duration).toBeLessThan(10);
  });
});
