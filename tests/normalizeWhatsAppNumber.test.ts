import { normalizeWhatsAppNumber } from "../src/utils/normalizeWhatsAppNumber";
import { describe, test, expect } from "vitest";

describe("normalizeWhatsAppNumber", () => {
  test("should add Palestine country code to 0595829020", () => {
    const result = normalizeWhatsAppNumber("0595829020");

    expect(result).toBe("+970595829020");
  });

  test("should handle numbers with existing country code", () => {
    const result = normalizeWhatsAppNumber("+970595829020");

    expect(result).toBe("+970595829020");
  });

  test("should handle numbers with existing country code", () => {
    const result = normalizeWhatsAppNumber("0599088063", "IL");

    expect(result).toBe("+972599088063");
  });

  test("should handle invalid numbers", () => {
    const result = normalizeWhatsAppNumber("0592491421421");

    expect(result).toBeNull();
  });
});
