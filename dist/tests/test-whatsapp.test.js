"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const vitest_1 = require("vitest");
const whatsappService_1 = __importDefault(require("../src/utils/whatsappService"));
(0, vitest_1.describe)("WhatsApp Service", () => {
    let whatsappService;
    const testPhone = "970595829020";
    (0, vitest_1.beforeEach)(() => {
        whatsappService = new whatsappService_1.default();
    });
    (0, vitest_1.describe)("Template Messages", () => {
        (0, vitest_1.it)("should send Arabic order confirmation template successfully", async () => {
            const result = await whatsappService.sendArabicOrderConfirmationTemplate(testPhone, "John Smith", // customer_name
            "ORD-2024-001", // order_id
            "August 15, 2024", // order_date
            "Cotton T-Shirt, Denim Jeans", // order_description
            "$150.00", // amount
            "King Fahd Street", // primary_address
            "Riyadh, Saudi Arabia" // secondary_address
            );
            (0, vitest_1.expect)(result.messages?.[0]?.id).toBeDefined();
        });
    });
    (0, vitest_1.it)("should send to palestinian phone number successfully even if i defined it as israeli", async () => {
        const result = await whatsappService.sendArabicOrderConfirmationTemplateWithRetry("595829020", "John Smith", // customer_name
        "ORD-2024-001", // order_id
        "August 15, 2024", // order_date
        "Cotton T-Shirt, Denim Jeans", // order_description
        "$150.00", // amount
        "King Fahd Street", // primary_address
        "Riyadh, Saudi Arabia" // secondary_address
        );
        console.log(result);
        // @ts-ignore
        (0, vitest_1.expect)(result.messages?.[0]?.id).toBeDefined();
    });
    (0, vitest_1.describe)("Error Handling", () => {
        (0, vitest_1.it)("should handle API errors gracefully", async () => {
            // Test with an invalid phone number to trigger validation error
            const invalidPhone = "123"; // Too short to be valid
            await (0, vitest_1.expect)(whatsappService.sendTextMessage(invalidPhone, "test message")).rejects.toThrow();
        });
        (0, vitest_1.it)("should handle invalid phone number format", async () => {
            const invalidPhone = "invalid-phone";
            // Test that the service's validatePhoneNumber method returns false for invalid numbers
            const isValid = whatsappService.validatePhoneNumber(invalidPhone);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
    });
    (0, vitest_1.describe)("Service Initialization", () => {
        (0, vitest_1.it)("should initialize WhatsApp service with required environment variables", () => {
            (0, vitest_1.expect)(whatsappService).toBeInstanceOf(whatsappService_1.default);
            (0, vitest_1.expect)(process.env.WHATSAPP_ACCESS_TOKEN).toBeDefined();
            (0, vitest_1.expect)(process.env.WHATSAPP_PHONE_NUMBER_ID).toBeDefined();
        });
    });
});
