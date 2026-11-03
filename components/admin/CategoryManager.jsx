"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-foreground";

async function send(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstFieldError = data.fieldErrors && Object.values(data.fieldErrors)[0];
    throw new Error(firstFieldError || data.error || "Something went wrong.");
  }
  return data;
}

function AddCategory({ nextOrder, onDone }) {
  const [form, setForm] = useState({ name: "", image: "", order: String(nextOrder) });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await send("/api/admin/categories", "POST", form);
      setForm({ name: "", image: "", order: String(nextOrder + 1) });
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-white p-4">
      <h2 className="font-serif text-xl">Add a category</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
        <div>
          <label htmlFor="new-cat-name" className="mb-1 block text-xs text-muted">Name</label>
          <input
            id="new-cat-name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="new-cat-image" className="mb-1 block text-xs text-muted">Image path (optional)</label>
          <input
            id="new-cat-image"
            className={inputClass}
            placeholder="/products/shoes.jpg"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="new-cat-order" className="mb-1 block text-xs text-muted">Order</label>
          <input
            id="new-cat-order"
            className={inputClass}
            inputMode="numeric"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 bg-foreground px-6 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-accent disabled:opacity-60"
      >
        {saving ? "Adding..." : "Add category"}
      </button>
    </form>
  );
}

function CategoryRow({ category, onDone }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    name: category.name,
    image: category.image || "",
    order: String(category.order ?? 0),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError("");
    try {
      await send(`/api/admin/categories/${category.id}`, "PUT", form);
      setEditing(false);
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await send(`/api/admin/categories/${category.id}`, "DELETE");
      onDone();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
    setBusy(false);
  }

  return (
    <li className="border-b border-border py-4">
      {editing ? (
        <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
          <input aria-label="Category name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input aria-label="Image path" className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <input aria-label="Display order" className={inputClass} inputMode="numeric" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-xs text-muted">Order {category.order ?? 0} · {category.image || "no image"}</p>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex items-center gap-4 text-sm">
        {editing ? (
          <>
            <button type="button" onClick={save} disabled={busy} className="hover:underline disabled:opacity-50">
              {busy ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={busy} className="text-muted hover:underline">
              Cancel
            </button>
          </>
        ) : confirming ? (
          <>
            <span className="text-muted">Delete this category?</span>
            <button type="button" onClick={remove} disabled={busy} className="text-red-600 hover:underline disabled:opacity-50">
              {busy ? "Deleting..." : "Yes"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="hover:underline">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="hover:underline">Edit</button>
            <button type="button" onClick={() => setConfirming(true)} className="text-red-600 hover:underline">Delete</button>
          </>
        )}
      </div>
    </li>
  );
}

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const nextOrder = categories.reduce((max, c) => Math.max(max, Number(c.order) || 0), 0) + 1;

  return (
    <div className="space-y-8">
      <AddCategory nextOrder={nextOrder} onDone={refresh} />

      <section>
        <h2 className="font-serif text-xl">Your categories</h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No categories yet. Add one above to start adding products.</p>
        ) : (
          <ul className="mt-2 border-t border-border">
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} onDone={refresh} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}