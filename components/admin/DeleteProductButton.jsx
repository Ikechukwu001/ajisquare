"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete the product.");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
    setLoading(false);
  }

  if (!confirming) {
    return (
      <span>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${name}`}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
        {error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">Delete?</span>
      <button type="button" onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline disabled:opacity-50">
        {loading ? "Deleting..." : "Yes"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} disabled={loading} className="hover:underline">
        Cancel
      </button>
    </span>
  );
}