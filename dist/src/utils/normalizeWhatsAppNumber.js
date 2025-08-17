"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWhatsAppNumber = normalizeWhatsAppNumber;
const libphonenumber_js_1 = require("libphonenumber-js");
// A helper function that normalizes numbers for WhatsApp
function normalizeWhatsAppNumber(input, defaultRegion = "PS") {
    try {
        // If input already has a country code (starts with +), return it as-is
        if (input.startsWith('+')) {
            const phone = (0, libphonenumber_js_1.parsePhoneNumberFromString)(input);
            if (phone && phone.isValid()) {
                return phone.number; // Return E.164 format
            }
            return null; // Invalid number even with country code
        }
        // If no country code, try to find it using defaultRegion
        const phone = (0, libphonenumber_js_1.parsePhoneNumberFromString)(input, defaultRegion);
        if (!phone || !phone.isValid()) {
            return null; // invalid number
        }
        // Return E.164 format (WhatsApp-ready)
        return phone.number;
    }
    catch {
        return null;
    }
}
