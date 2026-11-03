"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BULK_LABELS, BULK_STATUSES } from "@/lib/utils/bulkStatus";

async function patchRequest(reference, body) {
  const res = await fetch(`/api/admin/bulk-requests/${reference}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Prefer the specific field message over the generic one
    const firstFieldError = data.fieldErrors && Object.values(data.fieldErrors)[0];
    throw new Error(firstFieldError || data.error || "Something went wrong.");
  }
}

const inputClass =
  "w-full border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";
const primaryButton =
  "bg-foreground px-5 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

function StatusPanel({ reference, current }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await patchRequest(reference, { type: "status", status });
      setMessage("Status updated.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <section className="border border-border bg-white p-5">
      <h2 className="font-serif text-xl">Status</h2>
      <label htmlFor="bulk-status" className="mt-4 mb-1.5 block text-sm font-medium">Update status</label>
      <select
        id="bulk-status"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setMessage(""); }}
        className={inputClass}
      >
        {BULK_STATUSES.map((value) => (
          <option key={value} value={value}>{BULK_LABELS[value]}</option>
        ))}
      </select>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}

      <button type="button" onClick={save} disabled={busy || status === current} className={`mt-4 ${primaryButton}`}>
        {busy ? "Saving..." : "Save status"}
      </button>
    </section>
  );
}

function QuotePanel({ reference, status, quote }) {
  const router = useRouter();
  const [amount, setAmount] = useState(quote?.amountNgn != null ? String(quote.amountNgn) : "");
  const [amountUsd, setAmountUsd] = useState(quote?.amountUsd != null ? String(quote.amountUsd) : "");
  const [note, setNote] = useState(quote?.note || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const locked = status === "accepted" || status === "closed";

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await patchRequest(reference, { type: "quote", amount, amountUsd, note });
      setMessage("Quotation saved. The status is now Quotation ready.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <section className="border border-border bg-white p-5">
      <h2 className="font-serif text-xl">Quotation</h2>
      <p className="mt-2 text-xs text-muted">
        The full procurement amount, paid in Naira before procurement begins. Shipping is quoted separately.
      </p>

      {locked && (
        <p role="note" className="mt-4 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          This request is {status === "accepted" ? "accepted" : "closed"}. Set the status back to Under review to
          change the quotation.
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="quote-amount" className="mb-1.5 block text-sm font-medium">Amount in Naira (₦)</label>
          <input
            id="quote-amount"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1500000 (numbers only)"
            value={amount}
            disabled={locked}
            onChange={(e) => { setAmount(e.target.value); setMessage(""); setError(""); }}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="quote-usd" className="mb-1.5 block text-sm font-medium">
            Amount in USD ($) <span className="font-normal text-muted">(optional, for reference)</span>
          </label>
          <input
            id="quote-usd"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1200 or 1200.50"
            value={amountUsd}
            disabled={locked}
            onChange={(e) => { setAmountUsd(e.target.value); setMessage(""); setError(""); }}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="quote-note" className="mb-1.5 block text-sm font-medium">
            Note to the customer <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="quote-note"
            rows={4}
            value={note}
            disabled={locked}
            onChange={(e) => { setNote(e.target.value); setMessage(""); setError(""); }}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}

      <button type="button" onClick={save} disabled={busy || locked || amount.trim() === ""} className={`mt-4 ${primaryButton}`}>
        {busy ? "Saving..." : "Save quotation"}
      </button>
    </section>
  );
}

export default function BulkRequestActions({ reference, status, quote }) {
  return (
    <div className="space-y-6">
      <StatusPanel reference={reference} current={status} />
      <QuotePanel reference={reference} status={status} quote={quote} />
    </div>
  );
}