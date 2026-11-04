"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Something went wrong</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">We couldn't load this page</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        This is on our side, not yours. Please try again. If it keeps happening, contact us and we'll help.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-foreground px-7 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-accent"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="outline">Go to home</ButtonLink>
        <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
      </div>
    </Container>
  );
}