import "server-only";
import { randomInt } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { MAX_LINE_QUANTITY, getMinQty, isPreorder } from "@/lib/utils/product";

// No 0/O/1/I so references are easy to read out over the phone
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomPart(length) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export function generateReference() {
  return `FH-${randomPart(5)}-${randomPart(5)}`;
}

export class OrderError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// Builds the order from DATABASE data only. Prices sent by the browser are never used.
export async function createOrder({ customer, items }) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    throw new OrderError("Your cart is empty.", 400);
  }

  const lines = [];
  for (const raw of items) {
    const productId = typeof raw?.productId === "string" ? raw.productId : "";
    const quantity = raw?.quantity;
    if (!/^[\w-]{1,100}$/.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new OrderError("Your cart contains an invalid item. Please remove it and try again.", 400);
    }
    lines.push({
      productId,
      quantity,
      size: typeof raw.size === "string" ? raw.size : "",
      color: typeof raw.color === "string" ? raw.color : "",
    });
  }

  const db = adminDb();
  const ids = [...new Set(lines.map((l) => l.productId))];
  const snaps = await db.getAll(...ids.map((id) => db.collection("products").doc(id)));
  const products = new Map(snaps.filter((s) => s.exists).map((s) => [s.id, s.data()]));

  const issues = new Set();
  const orderItems = [];
  const requested = new Map();

  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product || !product.available) {
      issues.add("An item in your cart is no longer available. Please remove it.");
      continue;
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      issues.add(`${product.name} can't be ordered right now.`);
      continue;
    }

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];

    if (sizes.length > 0 && !sizes.includes(line.size)) {
      issues.add(`Please choose a valid size for ${product.name}.`);
      continue;
    }
    if (colors.length > 0 && !colors.includes(line.color)) {
      issues.add(`Please choose a valid color for ${product.name}.`);
      continue;
    }

    requested.set(line.productId, (requested.get(line.productId) || 0) + line.quantity);

    orderItems.push({
      productId: line.productId,
      name: product.name,
      price,
      priceUsd: product.priceUsd ?? null,
      availabilityType: isPreorder(product) ? "preorder" : "in_stock",
      quantity: line.quantity,
      size: sizes.length > 0 ? line.size : "",
      color: colors.length > 0 ? line.color : "",
      image: product.image || "",
      lineTotal: price * line.quantity,
    });
  }

  // Quantity rules per product (all sizes and colors together)
  for (const [productId, total] of requested) {
    const product = products.get(productId);

    const minQty = getMinQty(product);
    if (total < minQty) issues.add(`${product.name}: the minimum order is ${minQty}.`);

    if (total > MAX_LINE_QUANTITY) {
      issues.add(`${product.name}: for more than ${MAX_LINE_QUANTITY} units, please use Bulk Procurement.`);
    }

    // Pre-order items are procured after payment, so they are not limited by stock
    if (isPreorder(product)) continue;

    const stock = Number(product.stock) || 0;
    if (stock <= 0) issues.add(`${product.name} is out of stock.`);
    else if (total > stock) issues.add(`Only ${stock} of ${product.name} available.`);
  }

  if (issues.size > 0) {
    throw new OrderError("Some items in your cart need attention.", 409, { issues: [...issues] });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const now = Timestamp.now();

  const base = {
    customer,
    items: orderItems,
    subtotal,
    deliveryFee: null,
    deliveryFeeStatus: "to_be_confirmed",
    paymentStatus: "pending",
    fulfillmentStatus: "pending",
    stockDeducted: false,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generateReference();
    try {
      // create() fails if the reference already exists, so an order is never overwritten
      await db.collection("orders").doc(reference).create({ reference, ...base });
      return { reference };
    } catch (err) {
      if (err.code === 6 || /ALREADY_EXISTS/.test(String(err.message))) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique order reference.");
}

function serialize(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value && typeof value.toMillis === "function" ? value.toMillis() : value;
  }
  return out;
}

export async function getOrderByReference(reference) {
  if (!/^FH-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(reference || "")) return null;
  const doc = await adminDb().collection("orders").doc(reference).get();
  if (!doc.exists) return null;
  return serialize(doc.data());
}