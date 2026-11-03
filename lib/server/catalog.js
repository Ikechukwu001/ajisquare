import "server-only";
import { adminDb } from "@/lib/firebase/admin";

// Firestore timestamps can't be passed to client components, so convert them to milliseconds.
function serialize(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value && typeof value.toMillis === "function" ? value.toMillis() : value;
  }
  return out;
}

export async function getCategories() {
  const snap = await adminDb().collection("categories").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...serialize(d.data()) }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Fine for a small shop. Sorted newest first.
export async function getProducts({ includeUnavailable = false } = {}) {
  const snap = await adminDb().collection("products").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...serialize(d.data()) }))
    .filter((p) => includeUnavailable || p.available)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function getProduct(id) {
  const doc = await adminDb().collection("products").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...serialize(doc.data()) };
}