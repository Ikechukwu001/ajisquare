import {
  BadgeCheck,
  Boxes,
  Calculator,
  CreditCard,
  FileText,
  MapPin,
  Plane,
  Receipt,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata = { title: "How It Works" };

const shoppingSteps = [
  { text: "Browse selected products.", Icon: Search },
  { text: "Add products to cart.", Icon: ShoppingCart },
  { text: "Pay the full product amount.", Icon: CreditCard },
  { text: "AJISMART confirms procurement.", Icon: BadgeCheck },
  { text: "Shipping is calculated separately.", Icon: Calculator },
  { text: "Pay shipping and receive delivery updates.", Icon: Truck },
];

const bulkSteps = [
  { text: "Submit your bulk request.", Icon: FileText },
  { text: "Receive an individual quotation.", Icon: Receipt },
  { text: "Pay the full procurement amount.", Icon: CreditCard },
  { text: "Procurement begins.", Icon: Boxes },
  { text: "Receive a separate shipping quotation.", Icon: Plane },
  { text: "Follow your order through delivery.", Icon: MapPin },
];

function StepList({ title, steps }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="font-serif text-2xl uppercase sm:text-3xl">{title}</h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ text, Icon }, i) => (
          <li key={text} className="flex gap-4 border border-border bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-foreground text-gold">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-accent">Step {i + 1}</p>
              <p className="mt-1 text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="font-serif text-4xl uppercase sm:text-5xl">How it works</h1>
      <p className="mt-3 mb-12 max-w-xl text-muted">
        Two simple ways to buy through AJISMART: shop selected products, or request bulk procurement.
      </p>

      <StepList title="Shopping process" steps={shoppingSteps} />
      <StepList title="Bulk procurement process" steps={bulkSteps} />

      <div className="mt-14 flex flex-wrap gap-3">
        <ButtonLink href="/marketplace">Shop Products</ButtonLink>
        <ButtonLink href="/bulk-procurement" variant="outline">Bulk Procurement</ButtonLink>
      </div>
    </Container>
  );
}