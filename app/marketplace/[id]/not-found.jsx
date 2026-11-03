import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export default function ProductNotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="font-serif text-3xl">Product not found</h1>
      <p className="mt-3 text-muted">This product doesn't exist or is no longer available.</p>
      <div className="mt-8">
        <ButtonLink href="/marketplace">Back to Marketplace</ButtonLink>
      </div>
    </Container>
  );
}