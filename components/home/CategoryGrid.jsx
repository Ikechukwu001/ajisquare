import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

export default function CategoryGrid({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading title="Shop by category" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const src = c.image || "/products/placeholder.svg";
            return (
              <FadeIn key={c.id} delay={i * 0.05}>
                <Link href={`/marketplace?category=${c.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-border/40">
                    <Image
                      src={src}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized={src.endsWith(".svg")}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-serif text-xl">{c.name}</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}