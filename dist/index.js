"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const shopifyWebhook_1 = __importDefault(require("./routes/shopifyWebhook"));
const privacyPolicy_1 = __importDefault(require("./routes/privacyPolicy"));
const app = (0, express_1.default)();
// Shopify requires raw body for HMAC verification
app.use(express_1.default.raw({ type: "application/json" }));
app.use("/webhook", shopifyWebhook_1.default);
app.use("/", privacyPolicy_1.default);
app.get("/", (_req, res) => {
    res.send("Shopify webhook server is running 🚀");
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
