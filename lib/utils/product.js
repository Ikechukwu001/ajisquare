// Most units of one product a single order can hold (all sizes and colors together)
export const MAX_LINE_QUANTITY = 99;

export const isPreorder = (product) => product?.availabilityType === "preorder";

// Minimum order quantity. Older products without the field default to 1.
export function getMinQty(product) {
  const n = Number(product?.minOrderQty);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

// Pre-order items are not limited by stock. In-stock items are limited by their stock count.
export function getMaxQty(product) {
  if (isPreorder(product)) return MAX_LINE_QUANTITY;
  return Math.min(MAX_LINE_QUANTITY, Math.max(0, Number(product?.stock) || 0));
}

export const isOrderable = (product) => getMaxQty(product) >= getMinQty(product);

// key is one of: preorder, out, low, in
export function getAvailability(product) {
  if (isPreorder(product)) return { key: "preorder", label: "Pre-order" };

  const stock = Math.max(0, Number(product?.stock) || 0);
  if (stock <= 0) return { key: "out", label: "Out of stock" };
  if (!isOrderable(product)) return { key: "out", label: "Unavailable" };
  if (stock <= 3) return { key: "low", label: `Only ${stock} left` };
  return { key: "in", label: "In stock" };
}