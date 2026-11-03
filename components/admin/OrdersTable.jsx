"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatNaira } from "@/lib/utils/format";
import {
  DELIVERY_FEE_LABELS,
  FULFILLMENT_LABELS,
  FULFILLMENT_STATUSES,
  PAYMENT_LABELS,
  feeTone,
  fulfillmentTone,
  paymentTone,
} from "@/lib/utils/orderStatus";

const selectClass =
  "border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";

export default function OrdersTable({ orders }) {
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("all");
  const [fulfillment, setFulfillment] = useState("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    const phoneQuery = digits.startsWith("0") ? digits.slice(1) : digits;

    return orders.filter((o) => {
      if (payment !== "all" && o.paymentStatus !== payment) return false;
      if (fulfillment !== "all" && o.fulfillmentStatus !== fulfillment) return false;
      if (!q) return true;

      return (
        o.reference.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        `${o.city} ${o.state}`.toLowerCase().includes(q) ||
        (phoneQuery.length >= 3 && o.phone.replace(/\D/g, "").includes(phoneQuery))
      );
    });
  }, [orders, query, payment, fulfillment]);

  const filtered = query.trim() !== "" || payment !== "all" || fulfillment !== "all";
  const attentionCount = orders.filter((o) => o.needsAttention).length;

  if (orders.length === 0) {
    return (
      <p className="mt-12 text-center text-muted">
        No orders yet. Orders appear here when customers check out.
      </p>
    );
  }

  return (
    <div>
      {attentionCount > 0 && (
        <p role="note" className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {attentionCount} {attentionCount === 1 ? "order needs" : "orders need"} your attention (marked in red below).
        </p>
      )}

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, name, phone, or location"
            aria-label="Search orders"
            className="w-full border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Filter by payment status" className={selectClass}>
          <option value="all">All payments</option>
          {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value)} aria-label="Filter by delivery status" className={selectClass}>
          <option value="all">All delivery statuses</option>
          {FULFILLMENT_STATUSES.map((value) => (
            <option key={value} value={value}>{FULFILLMENT_LABELS[value]}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-muted">
        {results.length} {results.length === 1 ? "order" : "orders"}
        {orders.length >= 200 && !filtered && " (latest 200 shown)"}
      </p>

      {results.length === 0 ? (
        <p className="py-12 text-center text-muted">No orders match your search or filters.</p>
      ) : (
        <div className="mt-3 overflow-x-auto border border-border bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Items total</th>
                <th className="p-3 font-medium">Payment</th>
                <th className="p-3 font-medium">Delivery status</th>
                <th className="p-3 font-medium">Shipping fee</th>
              </tr>
            </thead>
            <tbody>
              {results.map((o) => (
                <tr
                  key={o.reference}
                  className={`border-b border-border last:border-0 ${o.needsAttention ? "bg-red-50/60" : ""}`}
                >
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.reference}`} className="font-medium hover:text-accent hover:underline">
                      {o.reference}
                    </Link>
                    <p className="text-xs text-muted">{o.createdLabel}</p>
                    {o.needsAttention && (
                      <div className="mt-1">
                        <StatusBadge tone="red">Needs attention</StatusBadge>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-muted">{o.phone}</p>
                  </td>
                  <td className="p-3 text-muted">{o.city}, {o.state}</td>
                  <td className="p-3">{o.itemCount}</td>
                  <td className="p-3">{formatNaira(o.subtotal)}</td>
                  <td className="p-3">
                    <StatusBadge tone={paymentTone(o.paymentStatus)}>
                      {PAYMENT_LABELS[o.paymentStatus] || o.paymentStatus}
                    </StatusBadge>
                  </td>
                  <td className="p-3">
                    <StatusBadge tone={fulfillmentTone(o.fulfillmentStatus)}>
                      {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
                    </StatusBadge>
                  </td>
                  <td className="p-3">
                    <StatusBadge tone={feeTone(o.deliveryFeeStatus)}>
                      {DELIVERY_FEE_LABELS[o.deliveryFeeStatus] || o.deliveryFeeStatus}
                    </StatusBadge>
                    {o.deliveryFee ? <p className="mt-1 text-xs text-muted">{formatNaira(o.deliveryFee)}</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}