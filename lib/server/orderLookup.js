import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { normalizeReference } from "@/lib/utils/orderReference";

const MAX_REFERENCES = 20;

function formatWhen(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
}

// Short summaries only. No phone number or address is returned.
export async function getOrderSummaries(references) {
  const refs = [...new Set(references.map(normalizeReference).filter(Boolean))].slice(0, MAX_REFERENCES);
  if (refs.length === 0) return [];

  const db = adminDb();
  const snaps = await db.getAll(...refs.map((ref) => db.collection("orders").doc(ref)));

  return snaps
    .filter((snap) => snap.exists)
    .map((snap) => {
      const o = snap.data();
      const items = o.items || [];
      const names = items.slice(0, 2).map((i) => i.name);
      const extra = items.length - names.length;
      return {
        createdAt: o.createdAt?.toMillis?.() ?? 0,
        reference: o.reference || snap.id,
        itemsPreview: names.join(", ") + (extra > 0 ? ` and ${extra} more` : ""),
        itemCount: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
        subtotal: o.subtotal || 0,
        deliveryFee: o.deliveryFee ?? null,
        deliveryFeeStatus: o.deliveryFeeStatus || "to_be_confirmed",
        paymentStatus: o.paymentStatus || "pending",
        fulfillmentStatus: o.fulfillmentStatus || "pending",
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ createdAt, ...rest }) => ({ ...rest, createdLabel: formatWhen(createdAt) }));
}

// True only when the order exists AND the phone number matches the one used at checkout.
export async function verifyOrderPhone(reference, normalizedPhone) {
  const snap = await adminDb().collection("orders").doc(reference).get();
  if (!snap.exists) return false;
  return snap.data().customer?.phone === normalizedPhone;
}