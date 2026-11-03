"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import { useCart } from "@/context/CartContext";
import { forgetCheckout, getRememberedCheckout } from "@/lib/utils/checkoutMemory";

export default function VerifyPayment({ reference }) {
  const { hydrated, clearCart } = useCart();
  const [state, setState] = useState({ status: "checking" });
  const started = useRef(false);

  const check = useCallback(async () => {
    setState({ status: "checking" });
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState({ status: "error", message: data.error || "We couldn't confirm your payment yet." });
        return;
      }
      setState({ status: data.status, orderReference: data.orderReference, purpose: data.purpose });
    } catch {
      setState({ status: "error", message: "Network problem. Check your connection and try again." });
    }
  }, [reference]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    check();
  }, [check]);

  // The cart is emptied only after the server has confirmed the payment for the items
  useEffect(() => {
    if (state.status !== "success" || state.purpose !== "items" || !hydrated) return;
    if (getRememberedCheckout() === state.orderReference) {
      clearCart();
      forgetCheckout();
    }
  }, [state, hydrated, clearCart]);

  const shipping = state.purpose === "shipping";
  const orderHref = state.orderReference ? `/order/${state.orderReference}` : "/orders";

  if (state.status === "checking") {
    return (
      <div className="py-8 text-center" role="status">
        <Loader2 size={36} className="mx-auto animate-spin text-accent" />
        <h1 className="mt-5 font-serif text-3xl">Confirming your payment...</h1>
        <p className="mt-2 text-muted">Please don't close this page.</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="py-8 text-center">
        <CheckCircle2 size={44} className="mx-auto text-green-700" />
        <h1 className="mt-5 font-serif text-3xl">{shipping ? "Shipping payment received" : "Payment received"}</h1>
        <p className="mt-2 text-muted">
          {shipping
            ? `Thank you. Your shipping payment was confirmed for order ${state.orderReference}.`
            : `Thank you. Your payment was confirmed for order ${state.orderReference}. We'll contact you about shipping.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={orderHref}>View your order</ButtonLink>
          <ButtonLink href="/marketplace" variant="outline">Continue shopping</ButtonLink>
        </div>
      </div>
    );
  }

  if (state.status === "review") {
    return (
      <div className="py-8 text-center">
        <Loader2 size={36} className="mx-auto text-accent" />
        <h1 className="mt-5 font-serif text-3xl">We're checking your payment</h1>
        <p className="mt-2 text-muted">
          We received a payment, but we need to check it against your order. You don't need to pay again. We'll
          contact you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={orderHref}>View your order</ButtonLink>
          <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
        </div>
      </div>
    );
  }

  if (state.status === "pending") {
    return (
      <div className="py-8 text-center">
        <Loader2 size={36} className="mx-auto text-accent" />
        <h1 className="mt-5 font-serif text-3xl">Payment still processing</h1>
        <p className="mt-2 text-muted">
          Your payment hasn't been confirmed yet. This can take a minute, especially for bank transfers.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={check}
            className="bg-foreground px-7 py-3 text-sm uppercase tracking-wider text-white hover:bg-accent"
          >
            Check again
          </button>
          <ButtonLink href={orderHref} variant="outline">View your order</ButtonLink>
        </div>
      </div>
    );
  }

  if (state.status === "failed" || state.status === "abandoned") {
    return (
      <div className="py-8 text-center">
        <XCircle size={44} className="mx-auto text-red-600" />
        <h1 className="mt-5 font-serif text-3xl">
          {state.status === "failed" ? "Payment didn't go through" : "Payment not completed"}
        </h1>
        <p className="mt-2 text-muted">
          You haven't been charged for this attempt.
          {shipping ? "" : " Your items are still in your cart."} You can try again from your order.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={orderHref}>Try again</ButtonLink>
          {!shipping && <ButtonLink href="/cart" variant="outline">View cart</ButtonLink>}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <XCircle size={44} className="mx-auto text-red-600" />
      <h1 className="mt-5 font-serif text-3xl">We couldn't confirm your payment</h1>
      <p className="mt-2 text-muted">{state.message}</p>
      <p className="mt-2 text-sm text-muted">
        If money left your account, don't pay again. Contact us with your order reference and we'll sort it out.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={check}
          className="bg-foreground px-7 py-3 text-sm uppercase tracking-wider text-white hover:bg-accent"
        >
          Try again
        </button>
        <Link href="/contact" className="inline-flex items-center border border-foreground px-7 py-3 text-sm uppercase tracking-wider hover:bg-foreground hover:text-white">
          Contact us
        </Link>
      </div>
    </div>
  );
}