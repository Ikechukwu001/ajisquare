"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { forgetCheckout, getRememberedCheckout } from "@/lib/utils/checkoutMemory";

// Rendered on an order page only when the order is paid.
// Empties the cart if it was checked out for THIS order (covers a closed tab after paying).
export default function ClearCartIfPaid({ reference }) {
  const { hydrated, clearCart } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    if (getRememberedCheckout() === reference) {
      clearCart();
      forgetCheckout();
    }
  }, [hydrated, reference, clearCart]);

  return null;
}