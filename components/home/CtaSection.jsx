import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import FadeIn from "@/components/ui/FadeIn";

export default function CtaSection() {
  return (
    <section className="bg-foreground py-16 text-white">
      <Container>
        <FadeIn className="text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">Ready to shop or procure in bulk?</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/marketplace" variant="gold">Shop Products</ButtonLink>
            <ButtonLink href="/contact" variant="outlineLight">Contact Us</ButtonLink>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}