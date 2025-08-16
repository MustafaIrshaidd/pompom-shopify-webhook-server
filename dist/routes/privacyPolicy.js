"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Privacy Policy route
router.get("/privacy-policy", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Privacy Policy</title>
      <style>
        body { max-width: 800px; margin: 40px auto; font-family: sans-serif; line-height: 1.6; }
        h1, h2 { color: #333; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> August 16, 2025</p>
      <p>[Your Company/App Name] ("we," "our," or "us") respects your privacy and is
      committed to protecting the personal information you provide when using our services.</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Personal Information (name, email, phone, billing details)</li>
        <li>Usage Data (IP, browser, device info, pages visited)</li>
        <li>Cookies & tracking technologies</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and maintain services</li>
        <li>Process orders/payments</li>
        <li>Communicate with you</li>
        <li>Improve website and experience</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Sharing Information</h2>
      <p>We do not sell or rent your data. We may share it with service providers
      (hosting, payments) or legal authorities if required.</p>

      <h2>4. Data Security</h2>
      <p>We use reasonable measures to protect your information, but no system is 100% secure.</p>

      <h2>5. Your Rights</h2>
      <p>You may request access, correction, deletion, or opt out of marketing.
      Email us at <strong>[Your Contact Email]</strong>.</p>

      <h2>6. Third-Party Links</h2>
      <p>We are not responsible for third-party websites linked from our app.</p>

      <h2>7. Children's Privacy</h2>
      <p>Our services are not directed to children under 13.</p>

      <h2>8. Updates</h2>
      <p>We may update this policy. Changes will be posted here.</p>

      <h2>9. Contact Us</h2>
      <p>
        Email: <strong>[Your Email]</strong><br />
        Website: <strong>[Your Website URL]</strong>
      </p>
    </body>
    </html>
  `);
});
exports.default = router;
