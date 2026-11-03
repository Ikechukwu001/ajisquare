import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import StatusBadge from "@/components/admin/StatusBadge";
import { getBulkRequest } from "@/lib/server/bulkRequests";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { BULK_LABELS, bulkTone } from "@/lib/utils/bulkStatus";
import { siteConfig } from "@/lib/config/site";

export const metadata = {
  title: "Bulk procurement request",
  robots: { index: false, follow: false },
};

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

export default async function BulkRequestPage({ params, searchParams }) {
  const { reference } = await params;
  const { submitted } = await searchParams;

  const data = await getBulkRequest(reference);
  if (!data) notFound();

  const { customer, request, quote } = data;
  const status = data.status || "new";

  const budget =
    request.estimatedBudget == null
      ? "Not given"
      : request.currency === "USD"
        ? formatUsd(request.estimatedBudget)
        : formatNaira(request.estimatedBudget);

  const photosLink = whatsappLink(
    siteConfig.contact.whatsapp,
    `Hello ${siteConfig.name}, here is the reference image for my bulk procurement request ${data.reference}.`
  );
  const replyLink = whatsappLink(
    siteConfig.contact.whatsapp,
    `Hello ${siteConfig.name}, I'm writing about my bulk procurement request ${data.reference}.`
  );

  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      {submitted && (
        <p role="status" className="mb-8 border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          Your request has been received. We'll review it and send you a quotation. Keep the reference below.
        </p>
      )}

      <p className="text-xs uppercase tracking-[0.2em] text-accent">Bulk procurement request</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{data.reference}</h1>
      <p className="mt-2 text-sm text-muted">Submitted {formatWhen(data.createdAt)}</p>

      <div className="mt-4">
        <StatusBadge tone={bulkTone(status)}>{BULK_LABELS[status] || status}</StatusBadge>
      </div>

      {quote && status !== "closed" && (
        <section className="mt-8 border border-gold bg-white p-5 sm:p-6">
          <h2 className="font-serif text-xl">Your quotation</h2>
          <p className="mt-3 font-serif text-3xl">{formatNaira(quote.amountNgn)}</p>
          {quote.amountUsd != null && (
            <p className="mt-1 text-sm text-muted">{formatUsd(quote.amountUsd)} (reference price)</p>
          )}
          {quote.note && <p className="mt-4 whitespace-pre-line text-sm text-muted">{quote.note}</p>}
          <p className="mt-4 text-xs text-muted">
            You pay the full procurement amount in Naira before procurement begins. Shipping is quoted and paid
            separately.
          </p>
        </section>
      )}

      {status === "new" || status === "reviewing" ? (
        <p className="mt-8 border border-dashed border-border bg-white p-4 text-sm text-muted">
          We're reviewing your request. Your quotation will appear on this page, and we'll also contact you.
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-serif text-xl">Your request</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <Detail label="Name">{customer.fullName}</Detail>
          <Detail label="Business">{customer.businessName}</Detail>
          <Detail label="Quantity">{request.quantity}</Detail>
          <Detail label="Estimated budget">{budget}</Detail>
          <Detail label="Delivery location">{request.deliveryLocation}</Detail>
          <Detail label="Preferred currency">{request.currency === "USD" ? "US Dollar ($)" : "Naira (₦)"}</Detail>
        </dl>
        <dl className="mt-5 space-y-5">
          <Detail label="Product description">{request.productDescription}</Detail>
          {request.referenceImageUrl && (
            <Detail label="Reference image">
              <a
                href={request.referenceImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline hover:text-accent"
              >
                {request.referenceImageUrl}
              </a>
            </Detail>
          )}
        </dl>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        {photosLink && (
          <ButtonLink href={photosLink} variant="gold">
            <MessageCircle size={16} className="mr-2" /> Send photos on WhatsApp
          </ButtonLink>
        )}
        {replyLink && quote && (
          <ButtonLink href={replyLink} variant="outline">Reply about this quotation</ButtonLink>
        )}
      </section>

      {/* Temporary: replaced by online payment of the quotation in the payment step */}
      {status === "quoted" && (
        <p className="mt-8 border border-dashed border-border bg-white p-4 text-sm text-muted">
          To go ahead, reply to us on WhatsApp. Online payment of quotations is coming soon.
        </p>
      )}
    </Container>
  );
}