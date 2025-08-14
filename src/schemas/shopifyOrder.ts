import { z } from "zod";

export const shopifyOrderSchema = z.object({
  id: z.number(),
  name: z.string(), // e.g. "#1449"
  created_at: z.string(), // Accept any string format, we'll parse it manually
  financial_status: z.string(),
  currency: z.string(),
  total_price: z.string(),
  order_status_url: z.string().url(),
  billing_address: z.object({
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().nullable(),
    city: z.string(),
    address1: z.string(),
  }),
  shipping_address: z.object({
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().nullable(),
    city: z.string(),
    address1: z.string(),
  }),
  line_items: z.array(
    z.object({
      title: z.string(),
      quantity: z.number(),
      price: z.string(),
    })
  ),
});

export type ShopifyOrder = z.infer<typeof shopifyOrderSchema>;