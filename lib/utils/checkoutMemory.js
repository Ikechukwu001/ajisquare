// Remembers, in this browser, what was in the cart when an order was placed.
// Once that order's payment is confirmed, exactly those items are removed from the cart.
const KEY = "fashion-house-pending-checkouts";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // forget checkouts that were never paid after 14 days
const MAX_KEPT = 10;

function isValid(entry) {
  return (
    entry &&
    typeof entry.reference === "string" &&
    Array.isArray(entry.items) &&
    typeof entry.createdAt === "number"
  );
}

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved.filter(isValid) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_KEPT)));
  } catch {
    // storage blocked, the cart simply won't clear by itself
  }
}

// items: the cart lines that were sent with the order
export function rememberCheckout(reference, items) {
  const lines = (items || []).map(({ productId, size, color, quantity }) => ({
    productId,
    size: size || "",
    color: color || "",
    quantity,
  }));
  write([...read().filter((c) => c.reference !== reference), { reference, items: lines, createdAt: Date.now() }]);
}

export function getPendingCheckouts() {
  const all = read();
  const now = Date.now();
  const fresh = all.filter((c) => now - c.createdAt < MAX_AGE_MS);
  if (fresh.length !== all.length) write(fresh);
  return fresh;
}

export function getPendingCheckout(reference) {
  return getPendingCheckouts().find((c) => c.reference === reference) || null;
}

export function forgetCheckout(reference) {
  write(read().filter((c) => c.reference !== reference));
}