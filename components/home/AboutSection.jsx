import Image from "next/image";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/lib/config/site";

export default function AboutSection() {
  const { about } = siteConfig;

  return (
    <section className="border-y border-border bg-white/50 py-16">
      <Container>
        <FadeIn className={about.image ? "grid items-center gap-10 md:grid-cols-2" : "mx-auto max-w-2xl text-center"}>
          {about.image && (
            <div className="relative aspect-[4/5] overflow-hidden bg-border/40">
              <Image
                src={about.image}
                alt={`About ${siteConfig.name}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl">{about.title}</h2>
            <p className="mt-4 leading-relaxed text-muted">{about.text}</p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}