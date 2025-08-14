import "dotenv/config";
import express from "express";
import shopifyWebhookRoutes from "./routes/shopifyWebhook";

const app = express();

// Shopify requires raw body for HMAC verification
app.use(express.raw({ type: "application/json" }));

app.use("/webhook", shopifyWebhookRoutes);

app.get("/", (_req, res) => {
  res.send("Shopify webhook server is running 🚀");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
