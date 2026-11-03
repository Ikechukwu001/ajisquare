import "server-only";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { initializeTransaction, verifyTransaction } from "@/lib/server/paystack";
import { siteConfig } from "@/lib/config/site";
import { isPreorder } from "@/lib/utils/product";

const ORDER_REFERENCE = /^FH-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
// Every payment attempt gets its own reference. P = items, S = shipping.
const PAYMENT_REFERENCE = /^(FH-[A-Z0-9]{5}-[A-Z0-9]{5})-([PS])[A-Z0-9]{6}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export class PaymentError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function paymentErrorResponse(err) {
  if (err instanceof PaymentError) {
    return NextResponse.json({ error: err.message, ...err.extra }, { status: err.status });
  }
  console.error("Payment error:", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

function randomPart(length) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

// Re-checks that everything in the order can still be bought
async function assertItemsStillAvailable(db, items = []) {
  const ids = [...new Set(items.map((i) => i.productId))];
  if (ids.length === 0) throw new PaymentError("This order has no items.", 400);

  const snaps = await db.getAll(...ids.map((id) => db.collection("products").doc(id)));
  const products = new Map(snaps.filter((s) => s.exists).map((s) => [s.id, s.data()]));

  const totals = new Map();
  for (const item of items) totals.set(item.productId, (totals.get(item.productId) || 0) + item.quantity);

  const issues = new Set();
  for (const [id, quantity] of totals) {
    const product = products.get(id);
    if (!product || !product.available) {
      issues.add("An item in this order is no longer available.");
      continue;
    }
    if (isPreorder(product)) continue;

    const stock = Number(product.stock) || 0;
    if (stock <= 0) issues.add(`${product.name} is now out of stock.`);
    else if (quantity > stock) issues.add(`Only ${stock} of ${product.name} left.`);
  }

  if (issues.size > 0) {
    throw new PaymentError(
      "Some items in this order are no longer available, so we can't take payment for it. Please contact us.",
      409,
      { issues: [...issues] }
    );
  }
}

/* ---------- start a payment ---------- */

// purpose: "items" (the products) or "shipping" (the shipping fee, after the items are paid)
export async function startPayment(orderReference, purpose = "items") {
  if (!ORDER_REFERENCE.test(orderReference || "")) throw new PaymentError("Order not found.", 404);
  if (!["items", "shipping"].includes(purpose)) throw new PaymentError("Invalid request.", 400);

  const db = adminDb();
  const snap = await db.collection("orders").doc(orderReference).get();
  if (!snap.exists) throw new PaymentError("Order not found.", 404);

  const order = snap.data();
  if (order.fulfillmentStatus === "cancelled") throw new PaymentError("This order was cancelled.", 409);

  let amountNaira;
  if (purpose === "items") {
    if (order.paymentStatus === "success") throw new PaymentError("This order has already been paid for.", 409);
    await assertItemsStillAvailable(db, order.items);
    amountNaira = Number(order.subtotal);
  } else {
    if (order.paymentStatus !== "success") {
      throw new PaymentError("Please pay for your items first. Shipping is paid after that.", 409);
    }
    if (order.deliveryFeeStatus === "paid") throw new PaymentError("Shipping has already been paid for.", 409);
    if (order.deliveryFeeStatus !== "awaiting_payment") {
      throw new PaymentError("There's no shipping fee to pay yet. We'll contact you once it's confirmed.", 409);
    }
    amountNaira = Number(order.deliveryFee);
  }

  // The amount comes from the saved order, never from the browser
  const amountKobo = Math.round(amountNaira * 100);
  if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
    throw new PaymentError("This can't be paid online. Please contact us.", 400);
  }

  const paymentReference = `${orderReference}-${purpose === "items" ? "P" : "S"}${randomPart(6)}`;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  // Orders placed before checkout asked for an email fall back to the business email (test orders only)
  const email = order.customer?.email || siteConfig.contact.email;

  let transaction;
  try {
    transaction = await initializeTransaction({
      email,
      amountKobo,
      reference: paymentReference,
      callbackUrl: `${siteUrl}/payment/callback`,
      metadata: { orderReference, purpose, customerName: order.customer?.fullName || "" },
    });
  } catch (err) {
    console.error("Paystack initialize failed:", err.message);
    throw new PaymentError("We couldn't start the payment. Please try again in a moment.", 502);
  }

  await db.collection("payment_attempts").doc(paymentReference).set({
    paymentReference,
    orderReference,
    purpose,
    amountKobo,
    status: "initiated",
    createdAt: Timestamp.now(),
  });

  return { authorizationUrl: transaction.authorization_url };
}

/* ---------- verify a payment and apply it ---------- */

function mapStatus(status) {
  if (status === "success") return "success";
  if (status === "failed" || status === "reversed") return "failed";
  if (status === "abandoned") return "abandoned";
  return "pending"; // ongoing, queued, pending
}

// Marks an order for the owner's attention and the payment attempt for review
function flagForReview(t, orderRef, attemptRef, note, now) {
  t.update(orderRef, {
    needsAttention: true,
    attentionNotes: FieldValue.arrayUnion(note),
    updatedAt: now,
  });
  t.update(attemptRef, { status: "review", updatedAt: now });
}

// Safe to call many times for the same payment (return page, webhook, retries):
// each payment is applied only once.
export async function verifyAndApplyPayment(paymentReference) {
  const match = PAYMENT_REFERENCE.exec(paymentReference || "");
  if (!match) throw new PaymentError("Payment not found.", 404);
  const orderReference = match[1];
  const purpose = match[2] === "S" ? "shipping" : "items";

  const db = adminDb();
  const attemptRef = db.collection("payment_attempts").doc(paymentReference);

  // Only payments this site started are accepted
  const attemptSnap = await attemptRef.get();
  if (!attemptSnap.exists) throw new PaymentError("Payment not found.", 404);

  // Ask Paystack directly. The customer returning to the site proves nothing.
  let transaction;
  try {
    transaction = await verifyTransaction(paymentReference);
  } catch (err) {
    console.error("Paystack verify failed:", err.message);
    throw new PaymentError("We couldn't confirm this payment yet. Please check again shortly.", 502);
  }

  const outcome = mapStatus(transaction.status);
  const orderRef = db.collection("orders").doc(orderReference);

  if (outcome === "success") {
    if (transaction.reference !== paymentReference) {
      throw new PaymentError("Payment details do not match.", 409);
    }

    const result = await db.runTransaction(async (t) => {
      const orderSnap = await t.get(orderRef);
      if (!orderSnap.exists) throw new PaymentError("Order not found.", 404);
      const order = orderSnap.data();
      const now = Timestamp.now();

      const claimed = transaction.metadata?.orderReference;
      const wrongOrder = claimed && claimed !== orderReference;

      /* ----- shipping payment ----- */
      if (purpose === "shipping") {
        if (order.deliveryFeeStatus === "paid") return "success"; // already processed

        const expectedKobo = Math.round(Number(order.deliveryFee) * 100);
        if (
          wrongOrder ||
          order.deliveryFeeStatus !== "awaiting_payment" ||
          transaction.currency !== "NGN" ||
          Number(transaction.amount) !== expectedKobo
        ) {
          console.error("Shipping payment needs review", { paymentReference, expectedKobo, got: transaction.amount });
          flagForReview(
            t,
            orderRef,
            attemptRef,
            `A shipping payment of ₦${Number(transaction.amount) / 100} was received (${paymentReference}) but it does not match the current shipping fee. Check it in Paystack.`,
            now
          );
          return "review";
        }

        t.update(orderRef, {
          deliveryFeeStatus: "paid",
          deliveryFeePaidAt: now,
          shippingPaystackReference: paymentReference,
          shippingPaymentChannel: transaction.channel || null,
          updatedAt: now,
        });
        t.update(attemptRef, { status: "success", paidAt: now });
        return "success";
      }

      /* ----- items payment ----- */
      if (order.paymentStatus === "success") return "success"; // already processed

      const expectedKobo = Math.round(Number(order.subtotal) * 100);
      if (wrongOrder || transaction.currency !== "NGN" || Number(transaction.amount) !== expectedKobo) {
        console.error("Payment needs review", { paymentReference, expectedKobo, got: transaction.amount });
        flagForReview(
          t,
          orderRef,
          attemptRef,
          `A payment of ₦${Number(transaction.amount) / 100} was received (${paymentReference}) but it does not match this order's total. Check it in Paystack.`,
          now
        );
        return "review";
      }

      // Paid after the owner cancelled the order: record the money, don't touch stock, flag for a refund
      if (order.fulfillmentStatus === "cancelled") {
        t.update(orderRef, {
          paymentStatus: "success",
          paidAt: now,
          paystackReference: paymentReference,
          paymentChannel: transaction.channel || null,
          stockDeducted: false,
          needsAttention: true,
          attentionNotes: FieldValue.arrayUnion(
            "Payment was received after this order was cancelled. Refund the customer from the Paystack dashboard."
          ),
          updatedAt: now,
        });
        t.update(attemptRef, { status: "success", paidAt: now });
        return "success";
      }

      // In-stock items are deducted. Pre-order items are procured after payment, so stock is untouched.
      const totals = new Map();
      for (const item of order.items || []) {
        if (item.availabilityType === "preorder") continue;
        totals.set(item.productId, (totals.get(item.productId) || 0) + item.quantity);
      }

      // All reads first, then all writes
      const productRefs = [...totals.keys()].map((id) => db.collection("products").doc(id));
      const productSnaps = productRefs.length ? await t.getAll(...productRefs) : [];

      const shortfalls = [];
      const stockWrites = [];
      productSnaps.forEach((ps, i) => {
        const productId = productRefs[i].id;
        const needed = totals.get(productId);
        const stock = ps.exists ? Number(ps.data().stock) || 0 : 0;

        if (stock < needed) {
          // Money is already taken, so the order is still marked paid. Stock stays at 0 and the order is flagged.
          shortfalls.push({ productId, name: ps.exists ? ps.data().name : productId, needed, available: stock });
        }
        if (ps.exists) stockWrites.push([ps.ref, Math.max(0, stock - needed)]);
      });

      for (const [ref, newStock] of stockWrites) t.update(ref, { stock: newStock, updatedAt: now });

      t.update(orderRef, {
        paymentStatus: "success",
        paidAt: now,
        paystackReference: paymentReference,
        paymentChannel: transaction.channel || null,
        stockDeducted: true,
        ...(shortfalls.length
          ? {
              stockShortfall: shortfalls,
              needsAttention: true,
              attentionNotes: FieldValue.arrayUnion(
                `Stock ran short when this payment came in: ${shortfalls
                  .map((s) => `${s.name} (needed ${s.needed}, had ${s.available})`)
                  .join(", ")}. Check what you can supply and contact the customer.`
              ),
            }
          : {}),
        updatedAt: now,
      });
      t.update(attemptRef, { status: "success", paidAt: now });
      return "success";
    });

    return { status: result, orderReference, purpose };
  }

  if (outcome === "failed" || outcome === "abandoned") {
    await db.runTransaction(async (t) => {
      const orderSnap = await t.get(orderRef);
      const now = Timestamp.now();

      // Never downgrade an order that is already paid (for example by a later attempt).
      // A failed shipping attempt leaves the order's payment status alone.
      if (purpose === "items" && orderSnap.exists && orderSnap.data().paymentStatus !== "success") {
        t.update(orderRef, { paymentStatus: outcome, updatedAt: now });
      }
      t.update(attemptRef, { status: outcome, updatedAt: now });
    });
    return { status: outcome, orderReference, purpose };
  }

  // Still being processed
  return { status: "pending", orderReference, purpose };
}