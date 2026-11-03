"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputClass = (error) =>
  `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground ${
    error ? "border-red-500" : "border-border"
  }`;

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProductForm({ mode, productId, initial, categories }) {
  const router = useRouter();

  const [values, setValues] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    priceUsd: initial?.priceUsd ?? "",
    availabilityType: initial?.availabilityType ?? "in_stock",
    minOrderQty: initial?.minOrderQty ?? 1,
    image: initial?.image ?? "",
    images: (initial?.images ?? []).join("\n"),
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    sizes: (initial?.sizes ?? []).join(", "),
    colors: (initial?.colors ?? []).join(", "),
    stock: initial?.stock ?? 0,
    featured: initial?.featured ?? false,
    available: initial?.available ?? true,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [failedPreview, setFailedPreview] = useState("");

  const preorder = values.availabilityType === "preorder";

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
    if (saving) return;

    setSaving(true);
    setServerError("");
    setErrors({});

    try {
      const res = await fetch(mode === "edit" ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
        return; // keep the button disabled while navigating
      }

      if (data.fieldErrors) {
        setErrors(data.fieldErrors);
        const first = Object.keys(data.fieldErrors)[0];
        if (first) document.getElementById(first)?.focus();
      }
      setServerError(data.error || "Could not save the product. Please try again.");
    } catch {
      setServerError("Network problem. Check your connection and try again.");
    }
    setSaving(false);
  }

  const showPreview = values.image.trim().startsWith("/");
  const previewFailed = failedPreview === values.image;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field id="name" label="Product name" error={errors.name}>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          className={inputClass(errors.name)}
          {...aria("name")}
        />
      </Field>

      <Field id="description" label="Description" error={errors.description}>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClass(errors.description)}
          {...aria("description")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="price" label="Price in Naira (₦)" hint="What the customer pays. Whole naira, e.g. 45000" error={errors.price}>
          <input
            id="price"
            type="text"
            inputMode="numeric"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
            className={inputClass(errors.price)}
            {...aria("price", true)}
          />
        </Field>

        <Field id="priceUsd" label="Price in USD ($)" hint="Shown for reference. e.g. 25 or 25.50. Leave blank to hide." error={errors.priceUsd}>
          <input
            id="priceUsd"
            type="text"
            inputMode="decimal"
            value={values.priceUsd}
            onChange={(e) => setField("priceUsd", e.target.value)}
            className={inputClass(errors.priceUsd)}
            {...aria("priceUsd", true)}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="availabilityType"
          label="Availability"
          hint="Pre-order items are procured after payment and are never out of stock."
          error={errors.availabilityType}
        >
          <select
            id="availabilityType"
            value={values.availabilityType}
            onChange={(e) => setField("availabilityType", e.target.value)}
            className={inputClass(errors.availabilityType)}
            {...aria("availabilityType", true)}
          >
            <option value="in_stock">In stock</option>
            <option value="preorder">Pre-order</option>
          </select>
        </Field>

        <Field
          id="minOrderQty"
          label="Minimum order quantity"
          hint="Use 1 if there is no minimum."
          error={errors.minOrderQty}
        >
          <input
            id="minOrderQty"
            type="text"
            inputMode="numeric"
            value={values.minOrderQty}
            onChange={(e) => setField("minOrderQty", e.target.value)}
            className={inputClass(errors.minOrderQty)}
            {...aria("minOrderQty", true)}
          />
        </Field>
      </div>

      <Field
        id="stock"
        label="Stock quantity"
        hint={preorder ? "Not used for pre-order items. Leave as 0." : "Total across all sizes and colors"}
        error={errors.stock}
      >
        <input
          id="stock"
          type="text"
          inputMode="numeric"
          value={values.stock}
          onChange={(e) => setField("stock", e.target.value)}
          className={inputClass(errors.stock)}
          {...aria("stock", true)}
        />
      </Field>

      <Field id="categoryId" label="Category" error={errors.categoryId}>
        <select
          id="categoryId"
          value={values.categoryId}
          onChange={(e) => setField("categoryId", e.target.value)}
          className={inputClass(errors.categoryId)}
          {...aria("categoryId")}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="sizes" label="Sizes" hint="Separate with commas, e.g. S, M, L. Leave blank if none." error={errors.sizes}>
          <input
            id="sizes"
            type="text"
            value={values.sizes}
            onChange={(e) => setField("sizes", e.target.value)}
            className={inputClass(errors.sizes)}
            {...aria("sizes", true)}
          />
        </Field>

        <Field id="colors" label="Colors" hint="Separate with commas, e.g. Black, Navy. Leave blank if none." error={errors.colors}>
          <input
            id="colors"
            type="text"
            value={values.colors}
            onChange={(e) => setField("colors", e.target.value)}
            className={inputClass(errors.colors)}
            {...aria("colors", true)}
          />
        </Field>
      </div>

      <Field
        id="image"
        label="Main image path"
        hint="Put the file in public/products/ in your project, then enter /products/filename.jpg. Leave blank for a placeholder."
        error={errors.image}
      >
        <input
          id="image"
          type="text"
          placeholder="/products/black-senator.jpg"
          value={values.image}
          onChange={(e) => setField("image", e.target.value)}
          className={inputClass(errors.image)}
          {...aria("image", true)}
        />
        {showPreview && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={values.image}
              src={values.image}
              alt="Preview"
              onError={() => setFailedPreview(values.image)}
              className={`h-24 w-[76px] bg-border/40 object-cover ${previewFailed ? "hidden" : ""}`}
            />
            {previewFailed && (
              <p className="text-xs text-red-600">No image found at this path. Check the file is in the public folder.</p>
            )}
          </div>
        )}
      </Field>

      <Field id="images" label="Extra image paths (optional)" hint="One per line, up to 8." error={errors.images}>
        <textarea
          id="images"
          rows={3}
          value={values.images}
          onChange={(e) => setField("images", e.target.value)}
          className={inputClass(errors.images)}
          {...aria("images", true)}
        />
      </Field>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => setField("featured", e.target.checked)}
            className="h-4 w-4"
          />
          Featured on the homepage
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.available}
            onChange={(e) => setField("available", e.target.checked)}
            className="h-4 w-4"
          />
          Visible in the store (untick to hide this product)
        </label>
      </div>

      {serverError && (
        <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-foreground px-8 py-3 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Saving...
            </>
          ) : mode === "edit" ? (
            "Save changes"
          ) : (
            "Add product"
          )}
        </button>
        <Link href="/admin/products" className="text-sm text-muted hover:text-accent">Cancel</Link>
      </div>
    </form>
  );
}