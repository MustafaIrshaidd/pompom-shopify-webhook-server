import "dotenv/config";
import { describe, it, expect, beforeEach, vi } from "vitest";
import WhatsAppService from "../src/utils/whatsappService";

describe("WhatsApp Service", () => {
  let whatsappService: WhatsAppService;
  const testPhone = "+970595829020";

  beforeEach(() => {
    whatsappService = new WhatsAppService();
  });

  describe("Template Messages", () => {
    it("should send Arabic order confirmation template successfully", async () => {
      const result = await whatsappService.sendArabicOrderConfirmationTemplate(
        testPhone,
        "John Smith", // customer_name
        "ORD-2024-001", // order_id
        "August 15, 2024", // order_date
        "Cotton T-Shirt, Denim Jeans", // order_description
        "$150.00", // amount
        "King Fahd Street", // primary_address
        "Riyadh, Saudi Arabia" // secondary_address
      );

      expect(result.messages?.[0]?.id).toBeDefined();
    });
  });

  it("should send to palestinian phone number successfully even if i defined it as israeli", async () => {
    const result = await whatsappService.sendArabicOrderConfirmationTemplateWithRetry(
      "0595829020",
      "John Smith", // customer_name
      "ORD-2024-001", // order_id
      "August 15, 2024", // order_date
      "Cotton T-Shirt, Denim Jeans", // order_description
      "$150.00", // amount
      "King Fahd Street", // primary_address
      "Riyadh, Saudi Arabia" // secondary_address
    );

    console.log(result)

    // @ts-ignore
    expect(result.messages?.[0]?.id).toBeDefined();
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      // Test with an invalid phone number to trigger validation error
      const invalidPhone = "123"; // Too short to be valid

      await expect(
        whatsappService.sendTextMessage(invalidPhone, "test message")
      ).rejects.toThrow();
    });

    it("should handle invalid phone number format", async () => {
      const invalidPhone = "invalid-phone";

      // Test that the service's validatePhoneNumber method returns false for invalid numbers
      const isValid = whatsappService.validatePhoneNumber(invalidPhone);
      expect(isValid).toBe(false);
    });
  });

  describe("Service Initialization", () => {
    it("should initialize WhatsApp service with required environment variables", () => {
      expect(whatsappService).toBeInstanceOf(WhatsAppService);
      expect(process.env.WHATSAPP_ACCESS_TOKEN).toBeDefined();
      expect(process.env.WHATSAPP_PHONE_NUMBER_ID).toBeDefined();
    });
  });
});
