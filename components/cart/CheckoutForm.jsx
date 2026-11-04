"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/utils/nigeria";
import { validateCheckout } from "@/lib/validation/checkout";
import { rememberCheckout } from "@/lib/utils/checkoutMemory";

const EMPTY = { fullName: "", phone: "", email: "", address: "", city: "", state: "", notes: "" };

const inputClass = (error) =>
  `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground ${
    error ? "border-red-500" : "border-border"
  }`;

function Field({ id, label, error, hint, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function CheckoutForm({ items, onBack }) {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [issues, setIssues] = useState([]);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  const aria = (name, hint) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setServerError("");
    setIssues([]);

    const { ok, errors: found, values: cleaned } = validateCheckout(values);
    if (!ok) {
      setErrors(found);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    // Only identifiers and quantities are sent. Prices are decided by the server.
    const lines = items.map((i) => ({
      productId: i.productId,
      size: i.size || "",
      color: i.color || "",
      quantity: i.quantity,
    }));

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: cleaned, items: lines }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reference) {
        // Remember exactly what this order contains, so those items leave the cart once it is paid
        rememberCheckout(data.reference, lines);
        router.push(`/order/${data.reference}`);
        return; // keep the button disabled while navigating
      }

      if (data.fieldErrors) setErrors(data.fieldErrors);
      setServerError(data.error || "Something went wrong. Please try again.");
      setIssues(data.issues || []);
    } catch {
      setServerError("Network problem. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft size={16} /> Back to cart
      </button>

      <h2 className="font-serif text-2xl">Delivery details</h2>

      <Field id="fullName" label="Full name" error={errors.fullName}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className={inputClass(errors.fullName)}
          {...aria("fullName")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="phone" label="Phone number" error={errors.phone} hint="We'll call or WhatsApp this number about your delivery.">
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={inputClass(errors.phone)}
            {...aria("phone", true)}
          />
        </Field>

        <Field id="email" label="Email address" error={errors.email} hint="Your payment receipt is sent here.">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className={inputClass(errors.email)}
            {...aria("email", true)}
          />
        </Field>
      </div>

      <Field id="address" label="Delivery address" error={errors.address}>
        <textarea
          id="address"
          rows={3}
          autoComplete="street-address"
          value={values.address}
          onChange={(e) => setField("address", e.target.value)}
          className={inputClass(errors.address)}
          {...aria("address")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="city" label="City or town" error={errors.city}>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => setField("city", e.target.value)}
            className={inputClass(errors.city)}
            {...aria("city")}
          />
        </Field>

        <Field id="state" label="State" error={errors.state}>
          <select
            id="state"
            autoComplete="address-level1"
            value={values.state}
            onChange={(e) => setField("state", e.target.value)}
            className={inputClass(errors.state)}
            {...aria("state")}
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="notes" label="Delivery instructions" optional error={errors.notes}>
        <textarea
          id="notes"
          rows={2}
          placeholder="Landmarks, preferred delivery time, etc."
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className={inputClass(errors.notes)}
          {...aria("notes")}
        />
      </Field>

      <div className="border border-border bg-white p-4 text-sm text-muted">
        Shipping is <strong className="text-foreground">not included</strong> in the item total. After you place your
        order, we'll contact you to confirm the shipping fee for your location.
      </div>

      {serverError && (
        <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">{serverError}</p>
          {issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issues.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
          {issues.length > 0 && (
            <button type="button" onClick={onBack} className="mt-3 underline">
              Go back and update your cart
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 bg-foreground py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Placing your order...
          </>
        ) : (
          "Place order"
        )}
      </button>
    </form>
  );
}