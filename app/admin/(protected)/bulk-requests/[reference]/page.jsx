import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import StatusBadge from "@/components/admin/StatusBadge";
import BulkRequestActions from "@/components/admin/BulkRequestActions";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getBulkRequest } from "@/lib/server/bulkRequests";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { BULK_LABELS, bulkTone } from "@/lib/utils/bulkStatus";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "Bulk request" };

function formatWhen(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-sm">{children}</dd>
    </div>
  );
}

const pillClass =
  "inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 text-sm hover:border-foreground";

export default async function AdminBulkRequestPage({ params }) {
  await requireAdmin();
  const { reference } = await params;

  const data = await getBulkRequest(reference);
  if (!data) notFound();

  const { customer, request, quote } = data;
  const status = data.status || "new";

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const requestUrl = `${siteUrl}/bulk-procurement/request/${data.reference}`;

  const message = quote
    ? `Hello ${customer.fullName}, this is ${siteConfig.name} about your bulk procurement request ${data.reference}.\n\nYour quotation: ${formatNaira(quote.amountNgn)}${quote.note ? `\n\n${quote.note}` : ""}\n\nView the details here: ${requestUrl}`
    : `Hello ${customer.fullName}, this is ${siteConfig.name}. We're reviewing your bulk procurement request ${data.reference} and will send your quotation soon.\n\nView your request here: ${requestUrl}`;
  const chatLink = whatsappLink(customer.phone, message);

  const budget =
    request.estimatedBudget == null
      ? "Not given"
      : request.currency === "USD"
        ? formatUsd(request.estimatedBudget)
        : formatNaira(request.estimatedBudget);

  return (
    <Container className="py-10">
      <Link href="/admin/bulk-requests" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ChevronLeft size={16} /> All bulk requests
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{data.reference}</h1>
          <p className="mt-1 text-sm text-muted">Submitted {formatWhen(data.createdAt)}</p>
        </div>
        <StatusBadge tone={bulkTone(status)}>{BULK_LABELS[status] || status}</StatusBadge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="border border-border bg-white p-5">
            <h2 className="font-serif text-xl">Customer</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <Detail label="Name">{customer.fullName}</Detail>
              <Detail label="Business">{customer.businessName}</Detail>
              <Detail label="Phone">{customer.phone}</Detail>
              <Detail label="Email">{customer.email}</Detail>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`tel:${customer.phone}`} className={pillClass}>
                <Phone size={15} /> Call
              </a>
              {chatLink && (
                <a href={chatLink} target="_blank" rel="noopener noreferrer" className={pillClass}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              <a href={`mailto:${customer.email}`} className={pillClass}>
                <Mail size={15} /> Email
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">
              WhatsApp opens a chat with a message ready (including the quotation, once saved). Press send there.
              {siteUrl.includes("localhost") && " The link in the message only works for customers after the site is live."}
            </p>
          </section>

          <section className="border border-border bg-white p-5">
            <h2 className="font-serif text-xl">Request</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <Detail label="Required quantity">{request.quantity}</Detail>
              <Detail label="Estimated budget">{budget}</Detail>
              <Detail label="Preferred currency">{request.currency === "USD" ? "US Dollar ($)" : "Naira (₦)"}</Detail>
              <Detail label="Delivery location">{request.deliveryLocation}</Detail>
            </dl>
            <dl className="mt-5 space-y-5">
              <Detail label="Product description">{request.productDescription}</Detail>
              {request.referenceImageUrl ? (
                <Detail label="Reference image link">
                  <a
                    href={request.referenceImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline hover:text-accent"
                  >
                    {request.referenceImageUrl}
                  </a>
                </Detail>
              ) : (
                <Detail label="Reference image link">None. The customer may send photos on WhatsApp.</Detail>
              )}
            </dl>
          </section>
        </div>

        <aside>
          <BulkRequestActions reference={data.reference} status={status} quote={quote} />
        </aside>
      </div>
    </Container>
  );
}