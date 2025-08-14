import express from "express";
import crypto from "crypto";
import { shopifyOrderSchema } from "../schemas/shopifyOrder";
import { orderToWhatsAppMessage } from "../utils/whatsappMessage";

const router = express.Router();

router.post("/orders", (req, res) => {
  const hmac = req.get("X-Shopify-Hmac-SHA256") || "";
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";

  // Use the raw body buffer for HMAC calculation (this is what Shopify sends)
  const rawBody = req.body;

  const digest = crypto
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
    const parsedOrder = shopifyOrderSchema.parse(orderData);

    // Convert order to WhatsApp message
    const whatsappMsg = orderToWhatsAppMessage(parsedOrder);
    console.log("✅ New order received:", parsedOrder.name);
    console.log("📱 WhatsApp message ready:\n", whatsappMsg);

    // Return the WhatsApp message in the response
    res.json({
      success: true,
      orderId: parsedOrder.name,
      whatsappMessage: whatsappMsg,
      message: "Order processed successfully"
    });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return res.status(400).json({
      success: false,
      error: "Invalid payload",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;