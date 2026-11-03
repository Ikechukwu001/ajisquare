import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ValidationError } from "@/lib/server/adminCatalog";
import { FULFILLMENT_STATUSES } from "@/lib/utils/orderStatus";

const REFERENCE_PATTERN = /^FH-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
const MAX_DELIVERY_FEE = 10000000;

// These statuses mean "we are working on it or it's on its way", so the order must be paid first
const PAID_ONLY_STATUSES = ["processing", "ready_for_delivery", "shipped", "delivered"];

function orderRef(reference) {
  if (!REFERENCE_PATTERN.test(reference || "")) throw new ValidationError("Order not found.", {}, 404);
  return adminDb().collection("orders").doc(reference);
}

function formatWhen(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
}

function toWholeNumber(value) {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : null;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

// Newest first. Returns slim rows for the list page.
export async function listOrders(limit = 200) {
  const snap = await adminDb().collection("orders").orderBy("createdAt", "desc").limit(limit).get();

  return snap.docs.map((doc) => {
    const o = doc.data();
    const createdAt = o.createdAt?.toMillis?.() ?? null;
    return {
      reference: o.reference || doc.id,
      createdLabel: formatWhen(createdAt),
      customerName: o.customer?.fullName || "",
      phone: o.customer?.phone || "",
      city: o.customer?.city || "",
      state: o.customer?.state || "",
      itemCount: (o.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
      subtotal: o.subtotal || 0,
      deliveryFee: o.deliveryFee ?? null,
      deliveryFeeStatus: o.deliveryFeeStatus || "to_be_confirmed",
      paymentStatus: o.paymentStatus || "pending",
      fulfillmentStatus: o.fulfillmentStatus || "pending",
      needsAttention: Boolean(o.needsAttention),
    };
  });
}

export async function updateFulfillmentStatus(reference, status) {
  if (!FULFILLMENT_STATUSES.includes(status)) throw new ValidationError("Choose a valid status.");

  const ref = orderRef(reference);
  const db = adminDb();

  await db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new ValidationError("Order not found.", {}, 404);

    const order = snap.data();
    const current = order.fulfillmentStatus || "pending";
    if (current === status) return;

    const paid = order.paymentStatus === "success";

    if (PAID_ONLY_STATUSES.includes(status) && !paid) {
      throw new ValidationError(
        "This order hasn't been paid for yet, so it can't be moved to this status. Confirm the payment first.",
        {},
        409
      );
    }

    if (current === "cancelled" && paid) {
      throw new ValidationError(
        "This paid order was cancelled and can't be reopened. Ask the customer to place a new order.",
        {},
        409
      );
    }

    const now = Timestamp.now();
    const update = { fulfillmentStatus: status, updatedAt: now };
    const stockWrites = [];

    if (status === "cancelled") {
      // Give the stock back once, if it was taken when the order was paid
      if (order.stockDeducted && !order.stockRestored) {
        const totals = new Map();
        for (const item of order.items || []) {
          if (item.availabilityType === "preorder") continue;
          totals.set(item.productId, (totals.get(item.productId) || 0) + item.quantity);
        }

        // All reads first, then all writes
        const productRefs = [...totals.keys()].map((id) => db.collection("products").doc(id));
        const productSnaps = productRefs.length ? await t.getAll(...productRefs) : [];
        productSnaps.forEach((ps, i) => {
          if (ps.exists) {
            stockWrites.push([ps.ref, (Number(ps.data().stock) || 0) + totals.get(productRefs[i].id)]);
          }
        });
        update.stockRestored = true;
      }

      if (paid) {
        update.needsAttention = true;
        update.attentionNotes = FieldValue.arrayUnion(
          "A paid order was cancelled. Refund the customer from the Paystack dashboard."
        );
      }
    }

    for (const [productRef, newStock] of stockWrites) t.update(productRef, { stock: newStock, updatedAt: now });
    t.update(ref, update);
  });
}

// actions: "set" (record or change the shipping fee), "mark_paid", "undo_paid"
export async function updateDeliveryFee(reference, { action, amount } = {}) {
  const ref = orderRef(reference);

  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ValidationError("Order not found.", {}, 404);

    const status = snap.data().deliveryFeeStatus || "to_be_confirmed";
    const now = Timestamp.now();

    if (action === "set") {
      if (status === "paid") {
        throw new ValidationError("This shipping fee is already marked as paid. Undo that first to change it.", {}, 409);
      }
      const fee = toWholeNumber(amount);
      if (fee === null || fee > MAX_DELIVERY_FEE) {
        throw new ValidationError(
          "Enter the shipping fee as a whole number of naira (0 for free shipping).",
          { amount: "Enter a whole number of naira." }
        );
      }
      tx.update(ref, {
        deliveryFee: fee,
        deliveryFeeStatus: fee === 0 ? "waived" : "awaiting_payment",
        deliveryFeeUpdatedAt: now,
        updatedAt: now,
      });
    } else if (action === "mark_paid") {
      if (status !== "awaiting_payment") {
        throw new ValidationError("There is no outstanding shipping fee to mark as paid.", {}, 409);
      }
      tx.update(ref, { deliveryFeeStatus: "paid", deliveryFeePaidAt: now, updatedAt: now });
    } else if (action === "undo_paid") {
      if (status !== "paid") {
        throw new ValidationError("This shipping fee is not marked as paid.", {}, 409);
      }
      tx.update(ref, {
        deliveryFeeStatus: "awaiting_payment",
        deliveryFeePaidAt: FieldValue.delete(),
        updatedAt: now,
      });
    } else {
      throw new ValidationError("Unknown action.");
    }
  });
}

// The owner has dealt with whatever the warning was about
export async function clearOrderAttention(reference) {
  const ref = orderRef(reference);
  try {
    await ref.update({
      needsAttention: false,
      attentionResolvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    if (err?.code === 5) throw new ValidationError("Order not found.", {}, 404);
    throw err;
  }
}