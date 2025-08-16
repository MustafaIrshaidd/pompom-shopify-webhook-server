import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

// A helper function that normalizes numbers for WhatsApp
export function normalizeWhatsAppNumber(input: string, defaultRegion: CountryCode = "PS"): string | null {
  try {
    // If input already has a country code (starts with +), return it as-is
    if (input.startsWith('+')) {
      const phone = parsePhoneNumberFromString(input);
      if (phone && phone.isValid()) {
        return phone.number; // Return E.164 format
      }
      return null; // Invalid number even with country code
    }

    // If no country code, try to find it using defaultRegion
    const phone = parsePhoneNumberFromString(input, defaultRegion);

    if (!phone || !phone.isValid()) {
      return null; // invalid number
    }

    // Return E.164 format (WhatsApp-ready)
    return phone.number; 
  } catch {
    return null;
  }
}