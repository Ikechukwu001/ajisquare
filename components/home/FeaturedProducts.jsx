import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ButtonLink from "@/components/ui/ButtonLink";
import FadeIn from "@/components/ui/FadeIn";
import ProductCard from "@/components/store/ProductCard";

export default function FeaturedProducts({ products }) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading title="Featured pieces" subtitle="Hand-picked favourites from our collection." />

        {products.length === 0 ? (
          <p className="text-muted">New pieces are on the way. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={(i % 4) * 0.05}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/marketplace" variant="outline">View all products</ButtonLink>
        </div>
      </Container>
    </section>
  );
}