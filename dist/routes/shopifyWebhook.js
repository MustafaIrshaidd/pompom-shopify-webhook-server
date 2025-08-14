"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const shopifyOrder_1 = require("../schemas/shopifyOrder");
const whatsappMessage_1 = require("../utils/whatsappMessage");
const router = express_1.default.Router();
router.post("/orders", (req, res) => {
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
        // Return the WhatsApp message in the response
        res.json({
            success: true,
            orderId: parsedOrder.name,
            whatsappMessage: whatsappMsg,
            message: "Order processed successfully"
        });
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
