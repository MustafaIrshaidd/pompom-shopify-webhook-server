"use strict";
// Node.js 18+ has built-in fetch support
// No need to import node-fetch
Object.defineProperty(exports, "__esModule", { value: true });
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
        // //   }
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
