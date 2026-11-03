import { BadgeCheck, Boxes, Eye, Globe, ShoppingCart } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/lib/config/site";

const reasons = [
  { text: "Access to international markets.", Icon: Globe },
  { text: "Carefully selected products.", Icon: BadgeCheck },
  { text: "Convenient ordering.", Icon: ShoppingCart },
  { text: "Bulk purchasing support.", Icon: Boxes },
  { text: "Transparent procurement process.", Icon: Eye },
];

export default function WhyChoose() {
  return (
    <section className="border-y border-border bg-white/60 py-16">
      <Container>
        <SectionHeading title={`Why choose ${siteConfig.name}?`} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map(({ text, Icon }, i) => (
            <li key={text}>
              <FadeIn delay={i * 0.05} className="h-full">
                <div className="h-full border border-border bg-background p-5 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-gold">
                    <Icon size={20} />
                  </span>
                  <p className="mt-4 text-sm font-medium">{text}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}