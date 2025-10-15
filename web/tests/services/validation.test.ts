/**
 * Validation Utilities Tests
 *
 * Test all validation functions for:
 * - Thing types (66 types)
 * - Connection types (25 types)
 * - Event types (67 types)
 * - Status transitions
 * - Type-specific property validation
 */

import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import {
  validateThingType,
  validateConnectionType,
  validateEventType,
  validateStatusTransition,
  validateCourseProperties,
  validateLessonProperties,
  validateTokenProperties,
  validatePaymentProperties,
  validateAICloneProperties,
} from "@/services/utils/validation";

describe("Validation Utilities", () => {
  describe("validateThingType", () => {
    it("should accept valid thing types", async () => {
      const validTypes = [
        "creator",
        "ai_clone",
        "course",
        "lesson",
        "token",
        "organization",
        "external_agent",
        "mandate",
      ];

      for (const type of validTypes) {
        const result = await Effect.runPromise(validateThingType(type));
        expect(result).toBeUndefined();
      }
    });

    it("should reject invalid thing types", async () => {
      const program = validateThingType("invalid_type");

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("InvalidTypeError");
          expect(errorObj.type).toBe("invalid_type");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateConnectionType", () => {
    it("should accept valid connection types", async () => {
      const validTypes = [
        "owns",
        "created_by",
        "member_of",
        "holds_tokens",
        "transacted",
        "communicated",
      ];

      for (const type of validTypes) {
        const result = await Effect.runPromise(validateConnectionType(type));
        expect(result).toBeUndefined();
      }
    });

    it("should reject invalid connection types", async () => {
      const program = validateConnectionType("invalid_connection");

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("InvalidRelationshipTypeError");
          expect(errorObj.type).toBe("invalid_connection");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateEventType", () => {
    it("should accept valid event types", async () => {
      const validTypes = [
        "entity_created",
        "entity_updated",
        "user_registered",
        "payment_event",
        "inference_request",
      ];

      for (const type of validTypes) {
        const result = await Effect.runPromise(validateEventType(type));
        expect(result).toBeUndefined();
      }
    });

    it("should reject invalid event types", async () => {
      const program = validateEventType("invalid_event");

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("InvalidEventTypeError");
          expect(errorObj.type).toBe("invalid_event");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateStatusTransition", () => {
    it("should allow valid transitions", async () => {
      const validTransitions = [
        ["draft", "active"],
        ["active", "published"],
        ["published", "archived"],
      ];

      for (const [from, to] of validTransitions) {
        const result = await Effect.runPromise(validateStatusTransition(from, to));
        expect(result).toBeUndefined();
      }
    });

    it("should reject invalid transitions", async () => {
      const program = validateStatusTransition("archived", "active");

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("InvalidStatusTransitionError");
          expect(errorObj.from).toBe("archived");
          expect(errorObj.to).toBe("active");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateCourseProperties", () => {
    it("should accept valid course properties", async () => {
      const properties = {
        title: "Test Course",
        creatorId: "creator_123",
        modules: 5,
      };

      const result = await Effect.runPromise(validateCourseProperties(properties));
      expect(result).toBeUndefined();
    });

    it("should reject course without title", async () => {
      const properties = { creatorId: "creator_123" };
      const program = validateCourseProperties(properties);

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("ValidationError");
          expect(errorObj.field).toBe("properties.title");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });

    it("should reject course without creatorId", async () => {
      const properties = { title: "Test Course" };
      const program = validateCourseProperties(properties);

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("ValidationError");
          expect(errorObj.field).toBe("properties.creatorId");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateTokenProperties", () => {
    it("should accept valid token properties", async () => {
      const properties = {
        symbol: "TEST",
        network: "base",
        totalSupply: 1000000,
      };

      const result = await Effect.runPromise(validateTokenProperties(properties));
      expect(result).toBeUndefined();
    });

    it("should reject token without symbol", async () => {
      const properties = { network: "base" };
      const program = validateTokenProperties(properties);

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("ValidationError");
          expect(errorObj.field).toBe("properties.symbol");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validatePaymentProperties", () => {
    it("should accept valid payment properties", async () => {
      const properties = {
        amount: 99.99,
        currency: "USD",
        paymentMethod: "stripe",
      };

      const result = await Effect.runPromise(validatePaymentProperties(properties));
      expect(result).toBeUndefined();
    });

    it("should reject payment with zero amount", async () => {
      const properties = {
        amount: 0,
        currency: "USD",
        paymentMethod: "stripe",
      };
      const program = validatePaymentProperties(properties);

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Parse error from message: (FiberFailure) Error: {"_tag":"ValidationError",...}
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("ValidationError");
          expect(errorObj.field).toBe("properties.amount");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });

  describe("validateAICloneProperties", () => {
    it("should accept valid AI clone properties", async () => {
      const properties = {
        systemPrompt: "You are a helpful assistant",
        temperature: 0.7,
      };

      const result = await Effect.runPromise(validateAICloneProperties(properties));
      expect(result).toBeUndefined();
    });

    it("should reject temperature out of range", async () => {
      const properties = {
        systemPrompt: "Test",
        temperature: 1.5,
      };
      const program = validateAICloneProperties(properties);

      try {
        await Effect.runPromise(program);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Parse error from message
        const errorStr = error.toString();
        const jsonMatch = errorStr.match(/Error: (\{.*\})/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[1]);
          expect(errorObj._tag).toBe("ValidationError");
          expect(errorObj.field).toBe("properties.temperature");
        } else {
          throw new Error("Could not parse error");
        }
      }
    });
  });
});
