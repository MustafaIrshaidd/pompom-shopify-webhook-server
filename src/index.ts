import 'dotenv/config';
import express, { Request, Response } from 'express';
import crypto from 'crypto';

const app = express();

// Middleware to parse raw body for signature verification
app.use(express.json({ type: '*/*' }));

app.post('/webhook/orders', (req: Request, res: Response) => {
  const hmac = req.get('X-Shopify-Hmac-SHA256') || '';
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';

  const digest = crypto
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

app.get('/', (_req: Request, res: Response) => {
  res.send('Shopify webhook server is running 🚀');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));