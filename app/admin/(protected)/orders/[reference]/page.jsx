import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import OrderActions from "@/components/admin/OrderActions";
import StatusBadge from "@/components/admin/StatusBadge";
import CopyMessageButton from "@/components/admin/CopyMessageButton";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getOrderByReference } from "@/lib/server/orders";
import { formatNaira } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { buildOrderMessage } from "@/lib/utils/orderMessage";
import { siteConfig } from "@/lib/config/site";
import {
  DELIVERY_FEE_LABELS,
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  feeTone,
  fulfillmentTone,
  paymentTone,
} from "@/lib/utils/orderStatus";

export const metadata = { title: "Order" };

function formatWhen(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
}

export default async function AdminOrderPage({ params }) {
  await requireAdmin();
  const { reference } = await params;

  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const { customer, items } = order;
  const feeStatus = order.deliveryFeeStatus || "to_be_confirmed";
  const paymentStatus = order.paymentStatus || "pending";
  const fulfillmentStatus = order.fulfillmentStatus || "pending";

  const chatLink = whatsappLink(
    customer.phone,
    `Hello ${customer.fullName}, this is ${siteConfig.name} about your order ${order.reference}. We're getting in touch to confirm your shipping details and shipping fee.`
  );

  const orderMessage = buildOrderMessage(order, { brand: siteConfig.name });

  return (
    <Container className="py-10">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ChevronLeft size={16} /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{order.reference}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatWhen(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={paymentTone(paymentStatus)}>{PAYMENT_LABELS[paymentStatus] || paymentStatus}</StatusBadge>
          <StatusBadge tone={fulfillmentTone(fulfillmentStatus)}>
            {FULFILLMENT_LABELS[fulfillmentStatus] || fulfillmentStatus}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl">Items</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border bg-white">
              {items.map((item, i) => {
                const src = item.image || "/products/placeholder.svg";
                return (
                  <li key={`${item.productId}-${i}`} className="flex gap-4 p-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-border/40">
                      <Image src={src} alt={item.name} fill sizes="64px" unoptimized={src.endsWith(".svg")} className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {(item.size || item.color) && (
                          <p className="text-sm text-muted">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {item.availabilityType === "preorder" && (
                          <p className="text-xs text-accent">Pre-order: procure after payment</p>
                        )}
                        <p className="text-sm text-muted">{formatNaira(item.price)} × {item.quantity}</p>
                      </div>
                      <p className="shrink-0 font-medium">{formatNaira(item.lineTotal)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="border border-border bg-white p-5">
            <h2 className="font-serif text-xl">Payment summary</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <dt>
                    Items total <span className="font-medium">{formatNaira(order.subtotal)}</span>
                  </dt>
                  <dd>
                    <StatusBadge tone={paymentTone(paymentStatus)}>{PAYMENT_LABELS[paymentStatus] || paymentStatus}</StatusBadge>
                  </dd>
                </div>
                {paymentStatus === "success" && (
                  <p className="mt-1 text-xs text-muted">
                    Paid online{order.paymentChannel ? ` by ${order.paymentChannel}` : ""} on {formatWhen(order.paidAt)}.
                    {order.paystackReference && ` Paystack reference: ${order.paystackReference}`}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <dt>
                    Shipping fee{" "}
                    <span className="font-medium">{order.deliveryFee == null ? "not set" : formatNaira(order.deliveryFee)}</span>
                  </dt>
                  <dd>
                    <StatusBadge tone={feeTone(feeStatus)}>{DELIVERY_FEE_LABELS[feeStatus] || feeStatus}</StatusBadge>
                  </dd>
                </div>
                {order.shippingPaystackReference && (
                  <p className="mt-1 text-xs text-muted">
                    Paid online{order.shippingPaymentChannel ? ` by ${order.shippingPaymentChannel}` : ""} on{" "}
                    {formatWhen(order.deliveryFeePaidAt)}. Paystack reference: {order.shippingPaystackReference}
                  </p>
                )}
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">Shipping is collected separately from the items payment.</p>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-serif text-xl">Customer</h2>
              <p className="mt-2 text-sm font-medium">{customer.fullName}</p>
              <p className="text-sm text-muted">{customer.phone}</p>
              {customer.email && <p className="text-sm text-muted">{customer.email}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 hover:border-foreground">
                  <Phone size={15} /> Call
                </a>
                {chatLink && (
                  <a href={chatLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 hover:border-foreground">
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl">Delivery address</h2>
              <p className="mt-2 text-sm">{customer.address}</p>
              <p className="text-sm text-muted">{customer.city}, {customer.state}</p>
              {customer.notes && <p className="mt-2 text-sm text-muted">Note: {customer.notes}</p>}
            </div>
          </section>

          <section className="border border-border bg-white p-5">
            <h2 className="font-serif text-xl">Order message</h2>
            <p className="mt-1 text-xs text-muted">
              A ready-made summary of this order. The buttons open WhatsApp with it prepared. Nothing is sent until
              you press send there.
            </p>
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap bg-background p-3 text-xs leading-relaxed">
              {orderMessage}
            </pre>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {siteConfig.contact.lines.map((line) => (
                <a
                  key={line.phone}
                  href={whatsappLink(line.whatsapp, orderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 hover:border-foreground"
                >
                  <MessageCircle size={15} /> Send to {line.phone}
                </a>
              ))}
              <CopyMessageButton text={orderMessage} />
            </div>
          </section>
        </div>

        <aside>
          <OrderActions
            order={{
              reference: order.reference,
              paymentStatus,
              fulfillmentStatus,
              deliveryFee: order.deliveryFee ?? null,
              deliveryFeeStatus: feeStatus,
              stockDeducted: Boolean(order.stockDeducted),
              needsAttention: Boolean(order.needsAttention),
              attentionNotes: order.attentionNotes || [],
            }}
          />
        </aside>
      </div>
    </Container>
  );
}