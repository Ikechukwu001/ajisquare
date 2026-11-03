"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatNaira } from "@/lib/utils/format";
import {
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  fulfillmentTone,
  paymentTone,
} from "@/lib/utils/orderStatus";
import { getSavedReferences, keepOnly, removeReference } from "@/lib/utils/orderHistory";

function feeText(order) {
  if (order.deliveryFeeStatus === "awaiting_payment") return `Shipping: ${formatNaira(order.deliveryFee)} to pay`;
  if (order.deliveryFeeStatus === "paid") return `Shipping: ${formatNaira(order.deliveryFee)} paid`;
  if (order.deliveryFeeStatus === "waived") return "Shipping: free";
  return "Shipping: to be confirmed";
}

export default function MyOrders() {
  const [state, setState] = useState("loading"); // loading | ready | error
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    const references = getSavedReferences();
    if (references.length === 0) {
      setOrders([]);
      setState("ready");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const found = data.orders || [];
      setOrders(found);
      keepOnly(found.map((o) => o.reference));
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleRemove(reference) {
    removeReference(reference);
    setOrders((current) => current.filter((o) => o.reference !== reference));
  }

  if (state === "loading") {
    return <p className="text-muted">Loading your orders...</p>;
  }

  if (state === "error") {
    return (
      <div>
        <p className="text-sm text-red-600">We couldn't load your orders right now.</p>
        <button type="button" onClick={load} className="mt-3 border border-foreground px-5 py-2 text-sm hover:bg-foreground hover:text-white">
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border bg-white p-6 text-sm text-muted">
        <p>No orders on this device yet.</p>
        <p className="mt-2">
          Placed an order on another phone or browser? Use "Find an order" with your reference and phone number.
        </p>
        <Link href="/marketplace" className="mt-4 inline-block underline hover:text-accent">Start shopping</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.reference} className="border border-border bg-white">
          <Link href={`/order/${o.reference}`} className="block p-4 hover:bg-background">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{o.reference}</p>
                <p className="text-xs text-muted">{o.createdLabel}</p>
              </div>
              <p className="font-medium">{formatNaira(o.subtotal)}</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              {o.itemsPreview} ({o.itemCount} {o.itemCount === 1 ? "item" : "items"})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge tone={paymentTone(o.paymentStatus)}>
                {PAYMENT_LABELS[o.paymentStatus] || o.paymentStatus}
              </StatusBadge>
              <StatusBadge tone={fulfillmentTone(o.fulfillmentStatus)}>
                {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
              </StatusBadge>
            </div>
            <p className="mt-2 text-xs text-muted">{feeText(o)}</p>
          </Link>
          <div className="border-t border-border px-4 py-2 text-right">
            <button
              type="button"
              onClick={() => handleRemove(o.reference)}
              className="text-xs text-muted hover:text-red-600"
            >
              Remove from this device
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}