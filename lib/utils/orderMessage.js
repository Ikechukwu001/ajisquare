import { formatNaira } from "@/lib/utils/format";
import { PAYMENT_LABELS } from "@/lib/utils/orderStatus";

function shippingText(order) {
  const status = order.deliveryFeeStatus || "to_be_confirmed";
  if (status === "awaiting_payment") return `${formatNaira(order.deliveryFee)} (to be paid)`;
  if (status === "paid") return `${formatNaira(order.deliveryFee)} (paid)`;
  if (status === "waived") return "Free";
  return "To be confirmed";
}

// Builds the WhatsApp message for an order. *text* is WhatsApp's bold.
export function buildOrderMessage(order, { brand = "", intro = "" } = {}) {
  const customer = order.customer || {};
  const paid = order.paymentStatus === "success";
  const lines = [];

  if (intro) lines.push(intro, "");

  lines.push(paid ? `*PAID ORDER* | ${brand}` : `*ORDER* | ${brand}`);
  lines.push(`Reference: ${order.reference}`);
  lines.push(
    `Payment: ${PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}${paid ? ` (${formatNaira(order.subtotal)})` : ""}`
  );

  lines.push("", "*Customer*", customer.fullName || "", `Phone: ${customer.phone || ""}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);

  lines.push("", "*Delivery address*", customer.address || "", `${customer.city || ""}, ${customer.state || ""}`);
  if (customer.notes) lines.push(`Note: ${customer.notes}`);

  lines.push("", "*Items*");
  (order.items || []).forEach((item, i) => {
    const options = [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(", ");
    lines.push(
      `${i + 1}. ${item.name}${options ? ` (${options})` : ""}${item.availabilityType === "preorder" ? " [pre-order]" : ""} x${item.quantity} @ ${formatNaira(item.price)} = ${formatNaira(item.lineTotal)}`
    );
  });

  lines.push("", `Items total: ${formatNaira(order.subtotal)}`, `Shipping: ${shippingText(order)}`);

  return lines.join("\n");
}