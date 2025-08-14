import { ShopifyOrder } from "../schemas/shopifyOrder";

export function orderToWhatsAppMessage(order: ShopifyOrder): string {
  const customerName = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`;
  const phone = order.shipping_address.phone || "N/A";

  const itemsList = order.line_items
    .map(
      (item) => `• ${item.title} — ${item.quantity} × ${item.price} ${order.currency}`
    )
    .join("\n");

  const total = `${order.total_price} ${order.currency}`;
  
  // Handle various date formats from Shopify
  let orderDate: string;
  try {
    orderDate = new Date(order.created_at).toLocaleDateString("en-GB");
  } catch (error) {
    orderDate = order.created_at; // Fallback to original string if parsing fails
  }

  return (
    `Hello ${customerName} 👋,\n\n` +
    `Thank you for your order ${order.name} placed on ${orderDate}.\n\n` +
    `🛍️ Order details:\n${itemsList}\n\n` +
    `💰 Total: ${total}\n` +
    `📍 Delivery to: ${order.shipping_address.address1}, ${order.shipping_address.city}\n` +
    `📞 Contact: ${phone}\n\n` +
    `You can track your order here: ${order.order_status_url}\n\n` +
    `Please reply *YES* to confirm your order ✅`
  );
}