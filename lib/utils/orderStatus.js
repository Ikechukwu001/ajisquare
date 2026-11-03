export const FULFILLMENT_STATUSES = [
  "pending",
  "processing",
  "ready_for_delivery",
  "shipped",
  "delivered",
  "cancelled",
];

export const FULFILLMENT_LABELS = {
  pending: "Pending",
  processing: "Processing",
  ready_for_delivery: "Ready for delivery",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS = {
  pending: "Awaiting payment",
  success: "Paid",
  failed: "Payment failed",
  abandoned: "Not completed",
};

export const DELIVERY_FEE_LABELS = {
  to_be_confirmed: "To be confirmed",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  waived: "Waived",
};

export const fulfillmentTone = (status) =>
  ({ pending: "gray", processing: "blue", ready_for_delivery: "blue", shipped: "blue", delivered: "green", cancelled: "red" })[status] || "gray";

export const paymentTone = (status) =>
  ({ success: "green", pending: "amber", failed: "red", abandoned: "gray" })[status] || "gray";

export const feeTone = (status) =>
  ({ to_be_confirmed: "amber", awaiting_payment: "amber", paid: "green", waived: "gray" })[status] || "gray";