"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { maxQuantityFor, minQuantityFor, useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils/format";

function ItemImage({ src, name, size }) {
  const url = src || "/products/placeholder.svg";
  return (
    <div className="relative shrink-0 overflow-hidden bg-border/40" style={{ width: size, height: size * 1.25 }}>
      <Image src={url} alt={name} fill sizes={`${size}px`} unoptimized={url.endsWith(".svg")} className="object-cover" />
    </div>
  );
}

export default function CartView() {
  const { items, hydrated, subtotal, updateQuantity, removeItem } = useCart();
  const [step, setStep] = useState("cart");

  if (!hydrated) {
    return (
      <Container className="py-16">
        <p className="text-muted">Loading your cart...</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-muted" />
        <h1 className="mt-4 font-serif text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted">Looks like you haven't added anything yet.</p>
        <div className="mt-8">
          <ButtonLink href="/marketplace">Start shopping</ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl sm:text-4xl">{step === "cart" ? "Your Cart" : "Checkout"}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {step === "cart" ? (
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => {
                const max = maxQuantityFor(items, item);
                const min = minQuantityFor(item);
                return (
                  <li key={item.lineId} className="flex gap-4 py-5">
                    <ItemImage src={item.image} name={item.name} size={80} />

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/marketplace/${item.productId}`} className="font-medium hover:text-accent">
                            {item.name}
                          </Link>
                          {(item.size || item.color) && (
                            <p className="mt-0.5 text-sm text-muted">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          <p className="mt-0.5 text-sm text-muted">{formatNaira(item.price)} each</p>
                          {item.preorder && (
                            <p className="mt-0.5 text-xs text-accent">Pre-order: procured after payment</p>
                          )}
                          {min > 1 && <p className="mt-0.5 text-xs text-muted">Minimum order: {min}</p>}
                        </div>
                        <p className="shrink-0 font-medium">{formatNaira(item.price * item.quantity)}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            disabled={item.quantity <= min}
                            className="p-2 disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-sm" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                            disabled={item.quantity >= max}
                            className="p-2 disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.lineId)}
                          className="inline-flex items-center gap-1 text-sm text-muted hover:text-red-600"
                        >
                          <Trash2 size={15} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <CheckoutForm items={items} onBack={() => setStep("cart")} />
          )}
        </div>

        <aside className="h-fit border border-border bg-white p-6">
          <h2 className="font-serif text-xl">Order summary</h2>

          {step === "checkout" && (
            <ul className="mt-4 space-y-3 border-b border-border pb-4 text-sm">
              {items.map((item) => (
                <li key={item.lineId} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    {item.name} × {item.quantity}
                    {(item.size || item.color) && (
                      <span className="block text-xs text-muted">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0">{formatNaira(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Items total</dt>
              <dd className="font-medium">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>Confirmed after you order</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted">
            You pay for your items in Naira. Shipping depends on your location and is calculated and paid separately.
          </p>

          {step === "cart" && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full bg-foreground py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent"
              >
                Proceed to checkout
              </button>
              <Link href="/marketplace" className="block text-center text-sm text-muted hover:text-accent">
                Continue shopping
              </Link>
            </div>
          )}
        </aside>
      </div>
    </Container>
  );
}