import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Error 404</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">This page could not be found</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        The page may have moved or the link may be wrong. Let's get you back to something useful.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/">Go to home</ButtonLink>
        <ButtonLink href="/marketplace" variant="outline">Shop products</ButtonLink>
      </div>
    </Container>
  );
}