"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { getAvailability, getMaxQty, getMinQty, isOrderable, isPreorder } from "@/lib/utils/product";

const STATUS_COLOR = {
  in: "text-green-700",
  low: "text-accent",
  preorder: "text-accent",
  out: "text-red-600",
};

export default function ProductCard({ product }) {
  const { items, addItem } = useCart();

  const href = `/marketplace/${product.id}`;
  const src = product.image || "/products/placeholder.svg";
  const availability = getAvailability(product);
  const orderable = isOrderable(product);
  const hasOptions = (product.sizes?.length ?? 0) > 0 || (product.colors?.length ?? 0) > 0;

  const minQty = getMinQty(product);
  const maxQty = getMaxQty(product);
  const inCart = items.filter((i) => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
  const remaining = Math.max(0, maxQty - inCart);
  // The minimum order only applies to the first add. After that any quantity can be added.
  const minToAdd = inCart > 0 ? 1 : minQty;

  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const qty = Math.min(Math.max(quantity, minToAdd), Math.max(remaining, minToAdd));

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  function handleAdd() {
    if (remaining < minToAdd) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      priceUsd: product.priceUsd ?? null,
      image: product.image || "",
      size: "",
      color: "",
      quantity: qty,
      maxStock: maxQty,
      minQty,
      preorder: isPreorder(product),
    });
    setAdded(true);
    setQuantity(minQty);
  }

  const smallButton =
    "w-full py-2.5 text-center text-[11px] uppercase tracking-wider transition-colors";

  return (
    <div className="flex h-full flex-col">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-border/40">
        <Image
          src={src}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          unoptimized={src.endsWith(".svg")}
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-sm font-medium">
          <Link href={href} className="hover:text-accent">{product.name}</Link>
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        )}

        <div className="mt-2">
          <p className="text-sm font-medium">{formatNaira(product.price)}</p>
          {product.priceUsd != null && <p className="text-xs text-muted">{formatUsd(product.priceUsd)}</p>}
        </div>

        <p className={`mt-1 text-xs font-medium ${STATUS_COLOR[availability.key]}`}>{availability.label}</p>
        {minQty > 1 && <p className="text-xs text-muted">Minimum order: {minQty}</p>}

        <div className="mt-auto pt-3">
          {!orderable ? (
            <button type="button" disabled className={`${smallButton} cursor-not-allowed bg-border text-muted`}>
              {availability.label === "Unavailable" ? "Unavailable" : "Out of stock"}
            </button>
          ) : hasOptions ? (
            <Link href={href} className={`${smallButton} block border border-foreground hover:bg-foreground hover:text-white`}>
              Choose options
            </Link>
          ) : remaining < minToAdd ? (
            <p className="text-xs text-muted">
              Maximum quantity in your cart.{" "}
              <Link href="/cart" className="underline hover:text-accent">View cart</Link>
            </p>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex items-center border border-border">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => setQuantity(Math.max(minToAdd, qty - 1))}
                  disabled={qty <= minToAdd}
                  className="p-2 disabled:opacity-40"
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => setQuantity(Math.min(remaining, qty + 1))}
                  disabled={qty >= remaining}
                  className="p-2 disabled:opacity-40"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className={`${smallButton} bg-foreground text-white hover:bg-accent`}
              >
                Add to cart
              </button>
              {added && (
                <p role="status" className="text-xs text-green-700">
                  Added. <Link href="/cart" className="underline">View cart</Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}