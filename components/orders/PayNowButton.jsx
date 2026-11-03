"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

// purpose: "items" (pay for the products) or "shipping" (pay the shipping fee)
export default function PayNowButton({ reference, totalLabel, purpose = "items" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState([]);

  async function handlePay() {
    if (loading) return;
    setLoading(true);
    setError("");
    setIssues([]);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, purpose }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.authorizationUrl) {
        window.location.assign(data.authorizationUrl);
        return; // keep the button disabled while redirecting
      }

      setError(data.error || "We couldn't start the payment. Please try again.");
      setIssues(data.issues || []);
    } catch {
      setError("Network problem. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 bg-foreground px-8 py-4 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Taking you to payment...
          </>
        ) : (
          <>
            <Lock size={16} /> {purpose === "shipping" ? `Pay shipping ${totalLabel}` : `Pay ${totalLabel} now`}
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-muted">
        You'll be taken to Paystack to pay securely in Naira. We never see your card details.
      </p>

      {error && (
        <div role="alert" className="mt-4 border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">{error}</p>
          {issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issues.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}