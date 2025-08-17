"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const shopifyOrder_1 = require("../schemas/shopifyOrder");
const whatsappMessage_1 = require("../utils/whatsappMessage");
const whatsappService_1 = __importDefault(require("../utils/whatsappService"));
const router = express_1.default.Router();
router.post("/orders", async (req, res) => {
    // Console log all environment variables (for debugging purposes)
    const hmac = req.get("X-Shopify-Hmac-SHA256") || "";
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
    // Use the raw body buffer for HMAC calculation (this is what Shopify sends)
    const rawBody = req.body;
    const digest = crypto_1.default
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");
    if (hmac !== digest) {
        console.warn("❌ Webhook signature mismatch");
        return res.status(401).send("Unauthorized");
    }
    try {
        // Parse and validate the order data using the schema
        const orderData = JSON.parse(rawBody.toString());
        const parsedOrder = shopifyOrder_1.shopifyOrderSchema.parse(orderData);
        // Convert order to WhatsApp message
        const whatsappMsg = (0, whatsappMessage_1.orderToWhatsAppMessage)(parsedOrder);
        console.log("✅ New order received:", parsedOrder.name);
        console.log("📱 WhatsApp message ready:\n", whatsappMsg);
        // Extract customer phone number from the order
        const customerPhone = parsedOrder.shipping_address.phone;
        if (!customerPhone) {
            console.warn("⚠️ No phone number found for customer, cannot send WhatsApp message");
            return res.status(200).json({
                success: true,
                orderId: parsedOrder.name,
                message: "Order processed successfully, but no phone number for WhatsApp"
            });
        }
        // Send WhatsApp message using the service with retry logic
        const whatsappService = new whatsappService_1.default();
        // Extract required parameters for Arabic order confirmation template
        const customerName = parsedOrder.billing_address.first_name || 'Customer';
        const orderId = parsedOrder.name;
        const orderDate = new Date(parsedOrder.created_at).toLocaleDateString('ar-SA');
        const orderDescription = parsedOrder.line_items.map(item => item.title).join(', ');
        const amount = `₪${parseFloat(parsedOrder.total_price).toFixed(2)}`;
        const primaryAddress = parsedOrder.shipping_address.address1 || '';
        const secondaryAddress = parsedOrder.shipping_address.city || '';
        // Use the new retry method from WhatsApp service
        const result = await whatsappService.sendArabicOrderConfirmationTemplateWithRetry(customerPhone, customerName, orderId, orderDate, orderDescription, amount, primaryAddress, secondaryAddress);
        if (result.success) {
            res.json({
                success: true,
                orderId: parsedOrder.name,
                customerName,
                orderDate,
                amount,
                phoneNumber: result.phoneNumber,
                originalPhone: customerPhone,
                message: "Order processed and Arabic order confirmation template sent successfully"
            });
        }
        else {
            console.error("❌ Failed to send WhatsApp message:", result.error);
            res.json({
                success: true,
                orderId: parsedOrder.name,
                whatsappMessage: whatsappMsg,
                originalPhone: customerPhone,
                whatsappError: result.error,
                message: "Order processed successfully, but WhatsApp message failed"
            });
        }
    }
    catch (error) {
        console.error("❌ Error processing webhook:", error);
        return res.status(400).json({
            success: false,
            error: "Invalid payload",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.default = router;
