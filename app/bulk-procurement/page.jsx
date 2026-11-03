import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import BulkRequestForm from "@/components/bulk/BulkRequestForm";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "Bulk Procurement" };

export default function BulkProcurementPage() {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">Bulk procurement</p>
      <h1 className="mt-3 font-serif text-4xl uppercase leading-tight sm:text-5xl">
        Your business. Your quantity. Our procurement support.
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
        <p>
          Are you a retailer, wholesaler, entrepreneur or business owner looking to purchase products in larger
          quantities?
        </p>
        <p>{siteConfig.name} helps coordinate bulk procurement from international markets.</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="#request" variant="gold">Request Bulk Procurement</ButtonLink>
        <ButtonLink href="/how-it-works" variant="outline">How it works</ButtonLink>
      </div>

      <section id="request" className="mt-14 scroll-mt-24 border border-border bg-white p-5 sm:p-8">
        <h2 className="font-serif text-2xl sm:text-3xl">Request bulk procurement</h2>
        <p className="mt-2 text-sm text-muted">
          Tell us what you need. We'll review your request and send you an individual quotation.
        </p>
        <div className="relative mt-6">
          <BulkRequestForm />
        </div>
      </section>
    </Container>
  );
}