"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { normalizeReference } from "@/lib/utils/orderReference";
import { normalizePhone } from "@/lib/validation/checkout";

const inputClass =
  "w-full border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";

export default function TrackOrderForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const cleanReference = normalizeReference(reference);
    if (!cleanReference) {
      setError("Enter your order reference, e.g. FH-ABCDE-FGHJK.");
      return;
    }
    if (!normalizePhone(phone)) {
      setError("Enter the Nigerian phone number you used for the order, e.g. 0803 123 4567.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: cleanReference, phone }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reference) {
        router.push(`/order/${data.reference}`);
        return; // keep the button disabled while navigating
      }
      setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Network problem. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 border border-border bg-white p-5">
      <div>
        <label htmlFor="track-reference" className="mb-1.5 block text-sm font-medium">Order reference</label>
        <input
          id="track-reference"
          type="text"
          autoCapitalize="characters"
          placeholder="FH-ABCDE-FGHJK"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="track-phone" className="mb-1.5 block text-sm font-medium">Phone number used for the order</label>
        <input
          id="track-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0803 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 bg-foreground py-3 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Searching...
          </>
        ) : (
          "Find order"
        )}
      </button>
    </form>
  );
}