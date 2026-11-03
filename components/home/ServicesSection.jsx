import Link from "next/link";
import { ArrowRight, Boxes, ShoppingBag } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

const services = [
  {
    title: "Shop selected products",
    text: "Browse our carefully selected product catalogue.",
    href: "/marketplace",
    cta: "Shop now",
    Icon: ShoppingBag,
  },
  {
    title: "Bulk procurement",
    text: "Procurement support for businesses buying in larger quantities.",
    href: "/bulk-procurement",
    cta: "Learn more",
    Icon: Boxes,
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading title="Our services" />
        <div className="grid gap-6 md:grid-cols-2">
          {services.map(({ title, text, href, cta, Icon }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <Link
                href={href}
                className="group block h-full border border-border bg-white p-8 transition-colors hover:border-gold"
              >
                <span className="flex h-12 w-12 items-center justify-center bg-foreground text-gold">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-serif text-2xl uppercase">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-accent">
                  {cta}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}