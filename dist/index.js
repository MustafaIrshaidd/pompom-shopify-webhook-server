"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
// Middleware to parse raw body for signature verification
app.use(express_1.default.json({ type: '*/*' }));
app.post('/webhook/orders', (req, res) => {
    const hmac = req.get('X-Shopify-Hmac-SHA256') || '';
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
    const digest = crypto_1.default
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body), 'utf8')
        .digest('base64');
    if (hmac !== digest) {
        console.warn('❌ Webhook signature mismatch');
        return res.status(401).send('Unauthorized');
    }
    console.log('✅ New order received:', req.body);
    res.sendStatus(200);
});
app.get('/', (_req, res) => {
    res.send('Shopify webhook server is running 🚀');
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
