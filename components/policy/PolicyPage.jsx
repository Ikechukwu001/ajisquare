import Container from "@/components/ui/Container";
import { policies } from "@/lib/config/policies";
import { siteConfig } from "@/lib/config/site";

export function PolicyPage({ title, intro, children }) {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">{siteConfig.name}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated: {policies.lastUpdated}</p>
      {intro && <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>}
      <div className="mt-10 space-y-10">{children}</div>
    </Container>
  );
}

export function PolicySection({ title, children }) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-muted [&_a:hover]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function PolicyContact() {
  const { contact } = siteConfig;
  return (
    <p>
      {contact.email && (
        <>
          Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <br />
        </>
      )}
      {contact.lines.map((line) => (
        <span key={line.phone}>
          Phone or WhatsApp: <a href={`tel:${line.phone.replace(/\s/g, "")}`}>{line.phone}</a>
          <br />
        </span>
      ))}
    </p>
  );
}