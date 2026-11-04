"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { forgetCheckout, getPendingCheckout, getPendingCheckouts } from "@/lib/utils/checkoutMemory";

// Runs on every store page. If an order this browser checked out has been confirmed as paid,
// the items from that order are taken out of the cart, whichever page the customer is on.
export default function CartSync() {
  const { hydrated, removePurchased } = useCart();
  const busy = useRef(false);

  const sync = useCallback(async () => {
    if (!hydrated || busy.current) return;

    const pending = getPendingCheckouts();
    if (pending.length === 0) return;

    busy.current = true;
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references: pending.map((p) => p.reference) }),
      });
      if (!res.ok) return; // try again next time

      const { orders = [] } = await res.json();
      const byReference = new Map(orders.map((o) => [o.reference, o]));

      for (const checkout of pending) {
        // Another part of the page may have handled this one while we were waiting
        if (!getPendingCheckout(checkout.reference)) continue;

        const order = byReference.get(checkout.reference);
        if (!order) {
          forgetCheckout(checkout.reference); // the order no longer exists
        } else if (order.paymentStatus === "success") {
          removePurchased(checkout.items);
          forgetCheckout(checkout.reference);
        } else if (order.fulfillmentStatus === "cancelled") {
          forgetCheckout(checkout.reference); // cancelled and never paid, nothing to remove
        }
      }
    } catch {
      // network problem, try again next time
    } finally {
      busy.current = false;
    }
  }, [hydrated, removePurchased]);

  // When the page loads
  useEffect(() => {
    sync();
  }, [sync]);

  // When the customer comes back to this tab or window
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sync]);

  return null;
}