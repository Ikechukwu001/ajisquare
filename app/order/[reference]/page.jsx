import { notFound } from "next/navigation";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import RememberOrder from "@/components/orders/RememberOrder";
import PayNowButton from "@/components/orders/PayNowButton";
import ClearCartIfPaid from "@/components/orders/ClearCartIfPaid";
import { getOrderByReference } from "@/lib/server/orders";
import { formatNaira } from "@/lib/utils/format";
import { FULFILLMENT_LABELS, PAYMENT_LABELS } from "@/lib/utils/orderStatus";
import { buildOrderMessage } from "@/lib/utils/orderMessage";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { siteConfig } from "@/lib/config/site";

export const metadata = {
  title: "Order summary",
  robots: { index: false, follow: false },
};

function shippingText(order) {
  const status = order.deliveryFeeStatus || "to_be_confirmed";
  if (status === "awaiting_payment") return `${formatNaira(order.deliveryFee)} (to be paid)`;
  if (status === "paid") return `${formatNaira(order.deliveryFee)} (paid)`;
  if (status === "waived") return "Free";
  return "To be confirmed";
}

function formatWhen(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
}

export default async function OrderPage({ params }) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const { customer, items } = order;
  const feeStatus = order.deliveryFeeStatus || "to_be_confirmed";
  const paymentStatus = order.paymentStatus || "pending";
  const cancelled = order.fulfillmentStatus === "cancelled";
  const paid = paymentStatus === "success";
  const shippingPayable = paid && feeStatus === "awaiting_payment" && !cancelled;

  // WhatsApp links for the customer to send the order details to the business
  const message = buildOrderMessage(order, {
    brand: siteConfig.name,
    intro: `Hello ${siteConfig.name}, I have paid for this order:`,
  });
  const whatsappLines = siteConfig.contact.lines.map((line) => ({
    phone: line.phone,
    href: whatsappLink(line.whatsapp, message),
  }));

  return (
    <Container className="max-w-3xl py-10">
      <RememberOrder reference={order.reference} />
      {paid && <ClearCartIfPaid reference={order.reference} />}

      <p className="text-xs uppercase tracking-[0.2em] text-accent">Order summary</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Order {order.reference}</h1>
      <p className="mt-2 text-sm text-muted">
        Placed {formatWhen(order.createdAt)}. Keep this reference, you'll need it if you contact us about this order.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="border border-border bg-white px-3 py-1.5">
          Payment: <strong>{PAYMENT_LABELS[paymentStatus] || paymentStatus}</strong>
        </span>
        <span className="border border-border bg-white px-3 py-1.5">
          Delivery: <strong>{FULFILLMENT_LABELS[order.fulfillmentStatus || "pending"]}</strong>
        </span>
      </div>

      {/* Payment for the items */}
      {paid ? (
        <section className="mt-8 border border-green-300 bg-green-50 p-5 text-sm text-green-900">
          <p className="font-medium">Payment received{order.paidAt ? ` on ${formatWhen(order.paidAt)}` : ""}.</p>
          <p className="mt-1">Thank you. We'll be in touch about shipping for your location.</p>
        </section>
      ) : cancelled ? (
        <section className="mt-8 border border-border bg-white p-5 text-sm text-muted">
          This order was cancelled, so it can't be paid for.
        </section>
      ) : (
        <section className="mt-8 border border-border bg-white p-5">
          <h2 className="font-serif text-xl">Pay for your items</h2>
          {(paymentStatus === "failed" || paymentStatus === "abandoned") && (
            <p role="note" className="mt-3 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {paymentStatus === "failed"
                ? "Your last payment attempt didn't go through. You haven't been charged for it."
                : "Your last payment wasn't completed. You haven't been charged for it."}{" "}
              You can try again below.
            </p>
          )}
          <p className="mt-3 text-sm text-muted">
            Pay the items total of <strong className="text-foreground">{formatNaira(order.subtotal)}</strong> now.
            Shipping is confirmed and paid separately.
          </p>
          <div className="mt-5">
            <PayNowButton reference={order.reference} totalLabel={formatNaira(order.subtotal)} />
          </div>
        </section>
      )}

      {/* Shipping payment */}
      {shippingPayable && (
        <section className="mt-6 border border-gold bg-white p-5">
          <h2 className="font-serif text-xl">Pay your shipping fee</h2>
          <p className="mt-3 text-sm text-muted">
            Your shipping fee for {customer.city}, {customer.state} is{" "}
            <strong className="text-foreground">{formatNaira(order.deliveryFee)}</strong>. This is separate from the
            payment for your items.
          </p>
          <div className="mt-5">
            <PayNowButton
              reference={order.reference}
              totalLabel={formatNaira(order.deliveryFee)}
              purpose="shipping"
            />
          </div>
        </section>
      )}

      {/* WhatsApp: send the order details to the business */}
      {paid && (
        <section className="mt-6 border border-border bg-white p-5">
          <h2 className="font-serif text-xl">Send your order details on WhatsApp</h2>
          <p className="mt-2 text-sm text-muted">
            This opens WhatsApp with your order details ready. Press send there so we can follow up quickly. Your
            order is already saved either way.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {whatsappLines.map((line, i) => (
              <ButtonLink key={line.phone} href={line.href} variant={i === 0 ? "gold" : "outline"}>
                <MessageCircle size={16} className="mr-2" /> {line.phone}
              </ButtonLink>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-xl">Items</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {items.map((item, i) => {
            const src = item.image || "/products/placeholder.svg";
            return (
              <li key={`${item.productId}-${i}`} className="flex gap-4 py-4">
                <div className="relative h-24 w-[76px] shrink-0 overflow-hidden bg-border/40">
                  <Image src={src} alt={item.name} fill sizes="76px" unoptimized={src.endsWith(".svg")} className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-sm text-muted">
                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {item.availabilityType === "preorder" && (
                      <p className="text-xs text-accent">Pre-order: procured after payment</p>
                    )}
                    <p className="text-sm text-muted">
                      {formatNaira(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">{formatNaira(item.lineTotal)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Items total</dt>
            <dd className="font-medium">{formatNaira(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shippingText(order)}</dd>
          </div>
        </dl>

        {(feeStatus === "to_be_confirmed" || feeStatus === "awaiting_payment") && (
          <p className="mt-3 text-xs text-muted">
            Shipping depends on your location and is paid separately from your items.{" "}
            {feeStatus === "to_be_confirmed"
              ? "We'll contact you on the phone number you gave to confirm it, and you'll be able to pay it here."
              : paid
                ? ""
                : "You can pay it here once your items are paid."}
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl">Customer</h2>
          <p className="mt-2 text-sm">{customer.fullName}</p>
          <p className="text-sm text-muted">{customer.phone}</p>
          {customer.email && <p className="text-sm text-muted">{customer.email}</p>}
        </div>
        <div>
          <h2 className="font-serif text-xl">Delivery</h2>
          <p className="mt-2 text-sm">{customer.address}</p>
          <p className="text-sm text-muted">
            {customer.city}, {customer.state}
          </p>
          {customer.notes && <p className="mt-2 text-sm text-muted">Note: {customer.notes}</p>}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/orders">My orders</ButtonLink>
        <ButtonLink href="/marketplace" variant="outline">Continue shopping</ButtonLink>
      </div>
    </Container>
  );
}