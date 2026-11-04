"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { forgetCheckout, getPendingCheckout } from "@/lib/utils/checkoutMemory";

// Rendered on an order page only when the order is paid.
// Takes this order's items out of the cart straight away (the site-wide sync would also do it shortly after).
export default function ClearCartIfPaid({ reference }) {
  const { hydrated, removePurchased } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    const pending = getPendingCheckout(reference);
    if (pending) {
      removePurchased(pending.items);
      forgetCheckout(reference);
    }
  }, [hydrated, reference, removePurchased]);

  return null;
}