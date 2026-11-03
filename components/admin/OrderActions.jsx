"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatNaira } from "@/lib/utils/format";
import {
  DELIVERY_FEE_LABELS,
  FULFILLMENT_LABELS,
  FULFILLMENT_STATUSES,
  feeTone,
} from "@/lib/utils/orderStatus";

// Same list the server enforces
const PAID_ONLY_STATUSES = ["processing", "ready_for_delivery", "shipped", "delivered"];

async function patchOrder(reference, body) {
  const res = await fetch(`/api/admin/orders/${reference}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstFieldError = data.fieldErrors && Object.values(data.fieldErrors)[0];
    throw new Error(data.error || firstFieldError || "Something went wrong.");
  }
}

const inputClass =
  "w-full border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";
const primaryButton =
  "bg-foreground px-5 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

function AttentionPanel({ order }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!order.needsAttention) return null;

  async function resolve() {
    setBusy(true);
    setError("");
    try {
      await patchOrder(order.reference, { type: "attention" });
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <section className="border border-red-300 bg-red-50 p-5">
      <h2 className="font-serif text-xl text-red-800">Needs attention</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-800">
        {(order.attentionNotes || []).map((note) => (
          <li key={note}>{note}</li>
        ))}
        {(order.attentionNotes || []).length === 0 && <li>This order was flagged for review.</li>}
      </ul>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={resolve}
        disabled={busy}
        className="mt-4 border border-red-700 px-5 py-2 text-sm text-red-800 hover:bg-red-700 hover:text-white disabled:opacity-50"
      >
        {busy ? "Saving..." : "Mark as handled"}
      </button>
    </section>
  );
}

function FulfillmentPanel({ order }) {
  const router = useRouter();
  const current = order.fulfillmentStatus || "pending";
  const [status, setStatus] = useState(current);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const paid = order.paymentStatus === "success";
  const blocked = !paid && PAID_ONLY_STATUSES.includes(status);

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await patchOrder(order.reference, { type: "fulfillment", status });
      setMessage("Status updated.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <section className="border border-border bg-white p-5">
      <h2 className="font-serif text-xl">Delivery status</h2>

      <label htmlFor="fulfillment" className="mt-4 mb-1.5 block text-sm font-medium">Update status</label>
      <select
        id="fulfillment"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setMessage(""); setError(""); }}
        className={inputClass}
      >
        {FULFILLMENT_STATUSES.map((value) => (
          <option key={value} value={value}>{FULFILLMENT_LABELS[value]}</option>
        ))}
      </select>

      {blocked && (
        <p role="note" className="mt-3 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          This order hasn't been paid for, so it can't be moved to this status yet.
        </p>
      )}

      {status === "cancelled" && current !== "cancelled" && paid && (
        <p role="note" className="mt-3 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          {order.stockDeducted
            ? "Cancelling returns the items to stock. "
            : ""}
          This site doesn't send refunds: refund the customer from the Paystack dashboard. A paid order that is
          cancelled can't be reopened.
        </p>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}

      <button type="button" onClick={save} disabled={busy || blocked || status === current} className={`mt-4 ${primaryButton}`}>
        {busy ? "Saving..." : "Save status"}
      </button>
    </section>
  );
}

function ShippingFeePanel({ order }) {
  const router = useRouter();
  const status = order.deliveryFeeStatus || "to_be_confirmed";
  const [amount, setAmount] = useState(order.deliveryFee != null ? String(order.deliveryFee) : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(body, success) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await patchOrder(order.reference, { type: "delivery_fee", ...body });
      setMessage(success);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <section className="border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl">Shipping fee</h2>
        <StatusBadge tone={feeTone(status)}>{DELIVERY_FEE_LABELS[status] || status}</StatusBadge>
      </div>

      {status === "awaiting_payment" && (
        <p role="note" className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>{formatNaira(order.deliveryFee)}</strong> shipping fee still to collect from the customer.
          {order.paymentStatus === "success"
            ? " They can pay it online from their order page."
            : " They can pay it online once their items are paid."}
        </p>
      )}
      {status === "paid" && (
        <p className="mt-4 text-sm text-green-700">Shipping fee of {formatNaira(order.deliveryFee)} has been collected.</p>
      )}
      {status === "waived" && <p className="mt-4 text-sm text-muted">Free shipping for this order.</p>}
      {status === "to_be_confirmed" && (
        <p className="mt-4 text-sm text-muted">
          Contact the customer, agree the fee for their location, then record it here. They'll be able to pay it
          online.
        </p>
      )}

      {status !== "paid" && (
        <div className="mt-4">
          <label htmlFor="deliveryFee" className="mb-1.5 block text-sm font-medium">Shipping fee (₦)</label>
          <input
            id="deliveryFee"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 3500"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setMessage(""); setError(""); }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">Enter 0 for free shipping.</p>
          <button
            type="button"
            disabled={busy || amount.trim() === ""}
            onClick={() => run({ action: "set", amount }, "Shipping fee saved.")}
            className={`mt-3 ${primaryButton}`}
          >
            {busy ? "Saving..." : "Save shipping fee"}
          </button>
        </div>
      )}

      {status === "awaiting_payment" && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted">Collected it another way (cash or a direct transfer)?</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => run({ action: "mark_paid" }, "Shipping fee marked as paid.")}
            className="mt-2 border border-foreground px-5 py-2.5 text-sm uppercase tracking-wider hover:bg-foreground hover:text-white disabled:opacity-50"
          >
            Mark fee as paid
          </button>
        </div>
      )}

      {status === "paid" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run({ action: "undo_paid" }, "Shipping fee set back to awaiting payment.")}
          className="mt-4 text-sm text-muted underline hover:text-accent disabled:opacity-50"
        >
          Undo "paid"
        </button>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
    </section>
  );
}

export default function OrderActions({ order }) {
  return (
    <div className="space-y-6">
      <AttentionPanel order={order} />
      <FulfillmentPanel order={order} />
      <ShippingFeePanel order={order} />
    </div>
  );
}