"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyOrderSchema = void 0;
const zod_1 = require("zod");
exports.shopifyOrderSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(), // e.g. "#1449"
    created_at: zod_1.z.string(), // Accept any string format, we'll parse it manually
    financial_status: zod_1.z.string(),
    currency: zod_1.z.string(),
    total_price: zod_1.z.string(),
    order_status_url: zod_1.z.string().url(),
    billing_address: zod_1.z.object({
        first_name: zod_1.z.string(),
        last_name: zod_1.z.string(),
        phone: zod_1.z.string().nullable(),
        city: zod_1.z.string(),
        address1: zod_1.z.string(),
    }),
    shipping_address: zod_1.z.object({
        first_name: zod_1.z.string(),
        last_name: zod_1.z.string(),
        phone: zod_1.z.string().nullable(),
        city: zod_1.z.string(),
        address1: zod_1.z.string(),
    }),
    line_items: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        quantity: zod_1.z.number(),
        price: zod_1.z.string(),
    })),
});
