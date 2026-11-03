"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getMaxQty, getMinQty, isOrderable, isPreorder } from "@/lib/utils/product";

export default function AddToCart({ product }) {
  const { items, addItem } = useCart();

  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const preorder = isPreorder(product);
  const minQty = getMinQty(product);
  const maxQty = getMaxQty(product);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(minQty);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  // Stock is per product, so count every variant of this product already in the cart
  const inCart = items.filter((i) => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
  const remaining = Math.max(0, maxQty - inCart);

  // The minimum order applies when starting a new line. Adding more to an existing line has no minimum.
  const lineExists = items.some(
    (i) => i.productId === product.id && (i.size || "") === size && (i.color || "") === color
  );
  const minToAdd = lineExists ? 1 : minQty;
  const canAdd = remaining >= minToAdd;
  const qty = Math.min(Math.max(quantity, minToAdd), Math.max(remaining, minToAdd));

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 3000);
    return () => clearTimeout(t);
  }, [added]);

  if (!isOrderable(product)) {
    return (
      <button
        type="button"
        disabled
        className="mt-8 w-full cursor-not-allowed bg-border py-3.5 text-sm uppercase tracking-wider text-muted"
      >
        Out of stock
      </button>
    );
  }

  function handleAdd() {
    if (sizes.length && !size) return setError("Please select a size.");
    if (colors.length && !color) return setError("Please select a color.");
    if (!canAdd) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      priceUsd: product.priceUsd ?? null,
      image: product.image || "",
      size,
      color,
      quantity: qty,
      maxStock: maxQty,
      minQty,
      preorder,
    });
    setError("");
    setAdded(true);
    setQuantity(minQty);
  }

  const optionClass = (active) =>
    `min-w-12 border px-4 py-2 text-sm transition-colors ${
      active ? "border-foreground bg-foreground text-white" : "border-border hover:border-foreground"
    }`;

  return (
    <div className="mt-8 space-y-6">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => { setSize(s); setError(""); }}
                className={optionClass(size === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={color === c}
                onClick={() => { setColor(c); setError(""); }}
                className={optionClass(color === c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {canAdd ? (
        <div>
          <p className="mb-2 text-sm font-medium">Quantity</p>
          <div className="inline-flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(Math.max(minToAdd, qty - 1))}
              disabled={qty <= minToAdd}
              className="p-3 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-sm" aria-live="polite">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity(Math.min(remaining, qty + 1))}
              disabled={qty >= remaining}
              className="p-3 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
          {minQty > 1 && <p className="mt-2 text-xs text-muted">Minimum order: {minQty}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted">
          {remaining <= 0
            ? "You already have the maximum available in your cart."
            : `The minimum order for a new option is ${minToAdd}, but only ${remaining} more can be added.`}{" "}
          <Link href="/cart" className="underline hover:text-accent">View cart</Link>
        </p>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full bg-foreground py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {preorder ? "Pre-order now" : "Add to cart"}
      </button>

      {added && (
        <p role="status" className="flex items-center gap-2 text-sm text-green-700">
          <Check size={16} /> Added to cart.{" "}
          <Link href="/cart" className="underline">View cart</Link>
        </p>
      )}
    </div>
  );
}