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
    console.log("🔍 Environment Variables:");
    console.log("SHOPIFY_WEBHOOK_SECRET:", process.env.SHOPIFY_WEBHOOK_SECRET);
    console.log("WHATSAPP_ACCESS_TOKEN:", process.env.WHATSAPP_ACCESS_TOKEN);
    console.log("WHATSAPP_PHONE_NUMBER_ID:", process.env.WHATSAPP_PHONE_NUMBER_ID);
    console.log("PORT:", process.env.PORT);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("================================");
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
        // Send WhatsApp message using the service
        try {
            const whatsappService = new whatsappService_1.default();
            // Extract required parameters for Arabic order confirmation template
            const customerName = parsedOrder.billing_address.first_name || 'Customer';
            const orderId = parsedOrder.name;
            const orderDate = new Date(parsedOrder.created_at).toLocaleDateString('ar-SA');
            const orderDescription = parsedOrder.line_items.map(item => item.title).join(', ');
            const amount = `$${parseFloat(parsedOrder.total_price).toFixed(2)}`;
            const primaryAddress = parsedOrder.shipping_address.address1 || '';
            const secondaryAddress = parsedOrder.shipping_address.city || '';
            // Send the Arabic order confirmation template message
            await whatsappService.sendArabicOrderConfirmationTemplate(customerPhone, customerName, orderId, orderDate, orderDescription, amount, primaryAddress, secondaryAddress);
            console.log("✅ Arabic order confirmation template sent successfully to:", customerPhone);
            res.json({
                success: true,
                orderId: parsedOrder.name,
                customerName,
                orderDate,
                amount,
                phoneNumber: customerPhone,
                message: "Order processed and Arabic order confirmation template sent successfully"
            });
        }
        catch (whatsappError) {
            console.error("❌ Error sending WhatsApp message:", whatsappError);
            // Still return success for the order processing, but note WhatsApp failure
            res.json({
                success: true,
                orderId: parsedOrder.name,
                whatsappMessage: whatsappMsg,
                phoneNumber: customerPhone,
                whatsappError: whatsappError instanceof Error ? whatsappError.message : "Unknown error",
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
