"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { validateBulkRequest } from "@/lib/validation/bulkRequest";

const EMPTY = {
  fullName: "",
  businessName: "",
  phone: "",
  email: "",
  productDescription: "",
  referenceImageUrl: "",
  quantity: "",
  estimatedBudget: "",
  currency: "NGN",
  deliveryLocation: "",
};

const inputClass = (error) =>
  `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground ${
    error ? "border-red-500" : "border-border"
  }`;

function Field({ id, label, hint, error, optional, children }) {
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

export default function BulkRequestForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot, must stay empty
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  const aria = (name, hasHint) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : hasHint ? `${name}-hint` : undefined,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setServerError("");

    const { ok, errors: found } = validateBulkRequest(values);
    if (!ok) {
      setErrors(found);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bulk-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reference) {
        router.push(`/bulk-procurement/request/${data.reference}?submitted=1`);
        return; // keep the button disabled while navigating
      }

      if (data.fieldErrors) setErrors(data.fieldErrors);
      setServerError(data.error || "Something went wrong. Please try again.");
    } catch {
      setServerError("Network problem. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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

        <Field
          id="businessName"
          label="Business name"
          hint="Type Individual if you don't have a business."
          error={errors.businessName}
        >
          <input
            id="businessName"
            type="text"
            autoComplete="organization"
            value={values.businessName}
            onChange={(e) => setField("businessName", e.target.value)}
            className={inputClass(errors.businessName)}
            {...aria("businessName", true)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="phone" label="Phone number" hint="We may reach you on WhatsApp." error={errors.phone}>
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

        <Field id="email" label="Email address" error={errors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className={inputClass(errors.email)}
            {...aria("email")}
          />
        </Field>
      </div>

      <Field
        id="productDescription"
        label="Product description"
        hint="What do you need? Include material, size, color, brand, or any details that help."
        error={errors.productDescription}
      >
        <textarea
          id="productDescription"
          rows={5}
          value={values.productDescription}
          onChange={(e) => setField("productDescription", e.target.value)}
          className={inputClass(errors.productDescription)}
          {...aria("productDescription", true)}
        />
      </Field>

      <Field
        id="referenceImageUrl"
        label="Product reference image link"
        optional
        hint="Paste a web link to a photo of what you need. You can also send photos on WhatsApp after you submit."
        error={errors.referenceImageUrl}
      >
        <input
          id="referenceImageUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={values.referenceImageUrl}
          onChange={(e) => setField("referenceImageUrl", e.target.value)}
          className={inputClass(errors.referenceImageUrl)}
          {...aria("referenceImageUrl", true)}
        />
      </Field>

      <Field
        id="quantity"
        label="Required quantity"
        hint="Include the unit, e.g. 200 pieces or 500 yards."
        error={errors.quantity}
      >
        <input
          id="quantity"
          type="text"
          value={values.quantity}
          onChange={(e) => setField("quantity", e.target.value)}
          className={inputClass(errors.quantity)}
          {...aria("quantity", true)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="estimatedBudget"
          label="Estimated budget"
          optional
          hint="A rough amount helps us source the right option."
          error={errors.estimatedBudget}
        >
          <input
            id="estimatedBudget"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 500000"
            value={values.estimatedBudget}
            onChange={(e) => setField("estimatedBudget", e.target.value)}
            className={inputClass(errors.estimatedBudget)}
            {...aria("estimatedBudget", true)}
          />
        </Field>

        <Field
          id="currency"
          label="Preferred currency"
          hint="Payments are always made in Naira. This is used to show your quotation."
          error={errors.currency}
        >
          <select
            id="currency"
            value={values.currency}
            onChange={(e) => setField("currency", e.target.value)}
            className={inputClass(errors.currency)}
            {...aria("currency", true)}
          >
            <option value="NGN">Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
          </select>
        </Field>
      </div>

      <Field
        id="deliveryLocation"
        label="Delivery location"
        hint="City and state where the goods should be delivered."
        error={errors.deliveryLocation}
      >
        <input
          id="deliveryLocation"
          type="text"
          autoComplete="address-level2"
          value={values.deliveryLocation}
          onChange={(e) => setField("deliveryLocation", e.target.value)}
          className={inputClass(errors.deliveryLocation)}
          {...aria("deliveryLocation", true)}
        />
      </Field>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {serverError && (
        <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 bg-foreground py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Sending request...
          </>
        ) : (
          "Request Bulk Procurement"
        )}
      </button>
    </form>
  );
}