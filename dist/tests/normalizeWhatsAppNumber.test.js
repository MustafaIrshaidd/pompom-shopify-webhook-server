"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizeWhatsAppNumber_1 = require("../src/utils/normalizeWhatsAppNumber");
const vitest_1 = require("vitest");
(0, vitest_1.describe)("normalizeWhatsAppNumber", () => {
    (0, vitest_1.test)("should add Palestine country code to 0595829020", () => {
        const result = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)("0595829020");
        (0, vitest_1.expect)(result).toBe("+970595829020");
    });
    (0, vitest_1.test)("should handle numbers with existing country code", () => {
        const result = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)("+970595829020");
        (0, vitest_1.expect)(result).toBe("+970595829020");
    });
    (0, vitest_1.test)("should handle numbers with existing country code", () => {
        const result = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)("0599088063", "IL");
        (0, vitest_1.expect)(result).toBe("+972599088063");
    });
    (0, vitest_1.test)("should handle invalid numbers", () => {
        const result = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)("0592491421421");
        (0, vitest_1.expect)(result).toBeNull();
    });
});
