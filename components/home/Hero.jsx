import Image from "next/image";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import { siteConfig } from "@/lib/config/site";

export default function Hero() {
  const { hero } = siteConfig;
  const pillars = siteConfig.services.split("|").map((s) => s.trim());

  return (
    <section className="border-b border-border">
      <Container className="grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
        <div className="order-2 md:order-1">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">{siteConfig.services}</p>
          <h1 className="mt-4 font-serif text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-lg text-muted">{hero.subtext}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/marketplace">Shop Now</ButtonLink>
            <ButtonLink href="/bulk-procurement" variant="gold">Bulk Procurement</ButtonLink>
          </div>
        </div>

        <div className="relative order-1 aspect-[4/3] overflow-hidden md:order-2 md:aspect-[4/5]">
          {hero.image ? (
            <Image
              src={hero.image}
              alt={`${siteConfig.name} global sourcing`}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            // Shown until a real hero image is added in site.js
            <div className="flex h-full flex-col items-center justify-center gap-5 bg-foreground px-6 text-center text-white">
              <span className="font-serif text-3xl tracking-[0.3em] text-gold">{siteConfig.name}</span>
              <span className="h-px w-16 bg-gold" />
              {pillars.map((p) => (
                <span key={p} className="text-xs uppercase tracking-[0.3em] text-white/80">{p}</span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}