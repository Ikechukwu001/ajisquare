import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE_URL = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is missing in environment variables.");
  return key;
}

async function paystackFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) {
    const err = new Error(json?.message || `Paystack request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

// amountKobo must be a whole number (1 naira = 100 kobo)
export function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  return paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });
}

export function verifyTransaction(reference) {
  return paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" });
}

// Paystack signs the RAW request body with HMAC-SHA512, using your secret key
export function isValidWebhookSignature(rawBody, signature) {
  if (!signature || typeof signature !== "string") return false;

  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}