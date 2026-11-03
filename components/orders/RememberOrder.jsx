"use client";

import { useEffect } from "react";
import { saveReference } from "@/lib/utils/orderHistory";

// Rendered on the order page. Saves the reference in this browser so it shows on /orders.
export default function RememberOrder({ reference }) {
  useEffect(() => {
    saveReference(reference);
  }, [reference]);

  return null;
}