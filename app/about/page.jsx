import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">About {siteConfig.name}</p>
      <h1 className="mt-3 font-serif text-4xl uppercase leading-tight sm:text-5xl">
        Connecting you to global markets.
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
        <p>
          {siteConfig.name} is a global sourcing, procurement and importation brand connecting individuals,
          entrepreneurs, retailers and businesses in Nigeria to selected products from international markets.
        </p>
        <p>
          Through our online product catalogue and bulk procurement services, we aim to make international
          purchasing more accessible, convenient and transparent.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/marketplace">Shop Products</ButtonLink>
        <ButtonLink href="/bulk-procurement" variant="outline">Bulk Procurement</ButtonLink>
      </div>
    </Container>
  );
}