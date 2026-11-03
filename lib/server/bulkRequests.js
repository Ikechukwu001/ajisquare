import "server-only";
import { randomInt } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ValidationError } from "@/lib/server/adminCatalog";
import { validateBulkRequest } from "@/lib/validation/bulkRequest";
import { BULK_STATUSES } from "@/lib/utils/bulkStatus";

const COLLECTION = "bulk_requests";
const REFERENCE_PATTERN = /^BR-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_QUOTE = 10000000000;

function randomPart(length) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

function generateReference() {
  return `BR-${randomPart(5)}-${randomPart(5)}`;
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

// Optional USD amount with up to 2 decimals. Blank means "none".
function parseUsd(value) {
  if (value === "" || value === null || value === undefined) return { ok: true, value: null };
  const text = String(value).trim().replace(/^\$/, "");
  if (text === "") return { ok: true, value: null };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { ok: false };
  const n = Number(text);
  return n > 0 && n <= 1e10 ? { ok: true, value: n } : { ok: false };
}

function docRef(reference) {
  if (!REFERENCE_PATTERN.test(reference || "")) throw new ValidationError("Request not found.", {}, 404);
  return adminDb().collection(COLLECTION).doc(reference);
}

function serialize(data) {
  const out = { ...data };
  for (const key of ["createdAt", "updatedAt"]) {
    if (out[key]?.toMillis) out[key] = out[key].toMillis();
  }
  if (out.quote) out.quote = { ...out.quote, quotedAt: out.quote.quotedAt?.toMillis?.() ?? null };
  return out;
}

/* ---------- public ---------- */

export async function createBulkRequest(input) {
  const { ok, errors, values } = validateBulkRequest(input);
  if (!ok) throw new ValidationError("Please check the highlighted fields.", errors);

  const { fullName, businessName, phone, email, ...request } = values;
  const now = Timestamp.now();
  const db = adminDb();

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generateReference();
    try {
      // create() fails if the reference already exists, so a request is never overwritten
      await db.collection(COLLECTION).doc(reference).create({
        reference,
        status: "new",
        customer: { fullName, businessName, phone, email },
        request,
        quote: null,
        createdAt: now,
        updatedAt: now,
      });
      return reference;
    } catch (err) {
      if (err.code === 6 || /ALREADY_EXISTS/.test(String(err.message))) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique request reference.");
}

export async function getBulkRequest(reference) {
  if (!REFERENCE_PATTERN.test(reference || "")) return null;
  const snap = await adminDb().collection(COLLECTION).doc(reference).get();
  return snap.exists ? serialize(snap.data()) : null;
}

/* ---------- admin ---------- */

export async function listBulkRequests(limit = 200) {
  const snap = await adminDb().collection(COLLECTION).orderBy("createdAt", "desc").limit(limit).get();

  return snap.docs.map((doc) => {
    const r = serialize(doc.data());
    return {
      reference: r.reference || doc.id,
      createdLabel: formatWhen(r.createdAt),
      fullName: r.customer?.fullName || "",
      businessName: r.customer?.businessName || "",
      quantity: r.request?.quantity || "",
      estimatedBudget: r.request?.estimatedBudget ?? null,
      currency: r.request?.currency || "NGN",
      status: r.status || "new",
      quoteAmount: r.quote?.amountNgn ?? null,
    };
  });
}

export async function countNewBulkRequests() {
  const snap = await adminDb().collection(COLLECTION).where("status", "==", "new").count().get();
  return snap.data().count;
}

export async function updateBulkStatus(reference, status) {
  if (!BULK_STATUSES.includes(status)) throw new ValidationError("Choose a valid status.");

  const ref = docRef(reference);
  try {
    await ref.update({ status, updatedAt: Timestamp.now() });
  } catch (err) {
    if (err?.code === 5) throw new ValidationError("Request not found.", {}, 404);
    throw err;
  }
}

export async function saveBulkQuote(reference, { amount, amountUsd, note } = {}) {
  const ref = docRef(reference);

  const amountNgn = toWholeNumber(amount);
  const usd = parseUsd(amountUsd);
  const cleanNote = typeof note === "string" ? note.trim() : "";

  const errors = {};
  if (amountNgn === null || amountNgn < 1 || amountNgn > MAX_QUOTE) {
    errors.amount = "Enter the quotation as a whole number of naira, e.g. 1500000.";
  }
  if (!usd.ok) errors.amountUsd = "Enter the USD amount like 1200 or 1200.50, or leave it blank.";
  if (cleanNote.length > 1000) errors.note = "Note is too long (max 1000 characters).";
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);

  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ValidationError("Request not found.", {}, 404);

    const status = snap.data().status || "new";
    if (!["new", "reviewing", "quoted"].includes(status)) {
      throw new ValidationError(
        "This request is already accepted or closed. Set the status back to Under review before changing the quotation.",
        {},
        409
      );
    }

    const now = Timestamp.now();
    tx.update(ref, {
      quote: { amountNgn, amountUsd: usd.value, note: cleanNote, quotedAt: now },
      status: "quoted",
      updatedAt: now,
    });
  });
}