import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export default function OrderNotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="font-serif text-3xl">Order not found</h1>
      <p className="mt-3 text-muted">Check the order reference in your link and try again.</p>
      <div className="mt-8">
        <ButtonLink href="/marketplace">Back to Marketplace</ButtonLink>
      </div>
    </Container>
  );
}