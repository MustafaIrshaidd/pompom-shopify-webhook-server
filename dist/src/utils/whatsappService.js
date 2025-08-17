"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Node.js 18+ has built-in fetch support
// No need to import node-fetch
const normalizeWhatsAppNumber_1 = require("./normalizeWhatsAppNumber");
class WhatsAppService {
    accessToken;
    phoneNumberId;
    constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!this.accessToken || !this.phoneNumberId) {
            throw new Error('WhatsApp credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.');
        }
    }
    /**
     * Send a text message
     */
    async sendTextMessage(to, message) {
        const payload = {
            messaging_product: 'whatsapp',
            to: this.formatPhoneNumber(to),
            type: 'text',
            text: { body: message }
        };
        return await this.sendMessage(payload);
    }
    /**
     * Send a template message
     */
    async sendTemplateMessage(to, templateName, languageCode = 'ar', parameters, buttons) {
        const payload = {
            messaging_product: 'whatsapp',
            to: this.formatPhoneNumber(to),
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode
                }
            }
        };
        // Initialize components array
        payload.template.components = [];
        // Add body component with parameters if provided
        if (parameters && parameters.length > 0) {
            payload.template.components.push({
                type: 'body',
                parameters: parameters
            });
        }
        // Add buttons component if provided
        if (buttons && buttons.length > 0) {
            payload.template.components.push({
                type: 'BUTTONS',
                buttons: buttons
            });
        }
        console.log(payload);
        return await this.sendMessage(payload);
    }
    /**
     * Send Arabic order confirmation template message with retry logic (IL first, then PS)
     */
    async sendArabicOrderConfirmationTemplateWithRetry(customerPhone, customer_name, order_id, order_date, order_description, amount, primary_address, secondary_address) {
        // Check if phone number already has country code (is already normalized)
        // Try to parse without specifying a region - if it works, it already has a country code
        try {
            const { parsePhoneNumberFromString } = await Promise.resolve().then(() => __importStar(require('libphonenumber-js')));
            const phoneWithCountryCode = parsePhoneNumberFromString(customerPhone);
            console.log(phoneWithCountryCode && phoneWithCountryCode.isValid() && phoneWithCountryCode.country);
            if (phoneWithCountryCode && phoneWithCountryCode.isValid() && phoneWithCountryCode.country) {
                console.log("📱 Phone number already has country code, sending directly:", phoneWithCountryCode.number);
                try {
                    const result = await this.sendArabicOrderConfirmationTemplate(phoneWithCountryCode.number, customer_name, order_id, order_date, order_description, amount, primary_address, secondary_address);
                    console.log("✅ WhatsApp message sent successfully to normalized number:", phoneWithCountryCode.number);
                    return result;
                }
                catch (error) {
                    console.log("❌ Failed to send to normalized number:", phoneWithCountryCode.number, "Error:", error instanceof Error ? error.message : "Unknown error");
                    // If normalized number fails, fall back to IL/PS logic
                    console.log("🔄 Falling back to IL/PS normalization...");
                }
            }
        }
        catch (error) {
            console.log("📱 Could not parse phone number without region, proceeding with IL/PS normalization...");
        }
        // Normalize phone numbers for both IL and PS (only if needed)
        const ilPhone = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)(customerPhone, "IL");
        const psPhone = (0, normalizeWhatsAppNumber_1.normalizeWhatsAppNumber)(customerPhone, "PS");
        if (!ilPhone && !psPhone) {
            return {
                success: false,
                phoneNumber: null,
                error: "Could not normalize phone number for both IL and PS"
            };
        }
        let successPhone = null;
        let lastError = null;
        console.log(ilPhone, ' | ', psPhone);
        let result;
        // First try with IL (Israel) phone number
        if (ilPhone) {
            try {
                console.log("🔄 Attempting to send WhatsApp message with IL number:", ilPhone);
                result = await this.sendArabicOrderConfirmationTemplate(ilPhone, customer_name, order_id, order_date, order_description, amount, primary_address, secondary_address);
                successPhone = ilPhone;
                console.log("✅ Arabic order confirmation template sent successfully to IL number:", ilPhone);
            }
            catch (error) {
                console.log("❌ Failed to send to IL number:", ilPhone, "Error:", error instanceof Error ? error.message : "Unknown error");
                lastError = error instanceof Error ? error.message : "Unknown error";
            }
        }
        // If IL failed or doesn't exist, try with PS (Palestine) phone number
        if (psPhone) {
            try {
                console.log("🔄 Attempting to send WhatsApp message with PS number:", psPhone);
                result = await this.sendArabicOrderConfirmationTemplate(psPhone, customer_name, order_id, order_date, order_description, amount, primary_address, secondary_address);
                successPhone = psPhone;
                console.log("✅ Arabic order confirmation template sent successfully to PS number:", psPhone);
            }
            catch (error) {
                console.log("❌ Failed to send to PS number:", psPhone, "Error:", error instanceof Error ? error.message : "Unknown error");
                lastError = error instanceof Error ? error.message : "Unknown error";
            }
        }
        // Both attempts failed
        // console.error("❌ Failed to send WhatsApp message to both IL and PS numbers");
        return result;
    }
    /**
     * Send Arabic order confirmation template message
     */
    async sendArabicOrderConfirmationTemplate(to, customer_name, order_id, order_date, order_description, amount, primary_address, secondary_address) {
        const parameters = [
            { type: 'text', parameter_name: 'customer_name', text: customer_name },
            { type: 'text', parameter_name: 'order_id', text: order_id },
            { type: 'text', parameter_name: 'order_date', text: order_date },
            { type: 'text', parameter_name: 'order_description', text: order_description },
            { type: 'text', parameter_name: 'amount', text: amount },
            { type: 'text', parameter_name: 'primary_address', text: primary_address },
            { type: 'text', parameter_name: 'secondary_address', text: secondary_address }
        ];
        // const buttons = [
        // //   {
        // //     type: 'QUICK_REPLY' as const,
        // //     text: 'تاكيد الطلب'
        //   }
        // ];
        console.log('parameters', parameters);
        // console.log('buttons', buttons);
        return await this.sendTemplateMessage(to, 'order_confirmation', 'ar', parameters, []);
    }
    /**
     * Format phone number to E.164 format
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        // If number starts with 1 and is 11 digits, it's already in E.164 format
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return cleaned;
        }
        // If number is 10 digits, add country code 1 (US)
        if (cleaned.length === 10) {
            return `1${cleaned}`;
        }
        // If number already has country code, return as is
        if (cleaned.length > 10) {
            return cleaned;
        }
        // Default: assume US number and add country code
        return `1${cleaned}`;
    }
    /**
     * Send message to WhatsApp API
     */
    async sendMessage(payload) {
        const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('✅ WhatsApp message sent successfully:', {
                messageId: data?.messages?.[0]?.id,
                to: payload.to,
                type: payload.type
            });
            return data;
        }
        catch (error) {
            console.error('❌ Failed to send WhatsApp message:', error);
            throw error;
        }
    }
    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        const cleaned = this.formatPhoneNumber(phoneNumber);
        return /^1\d{10}$/.test(cleaned);
    }
}
exports.default = WhatsAppService;
