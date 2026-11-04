import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/config/site";
import { whatsappLink } from "@/lib/utils/whatsapp";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Our Collections" },
  { href: "/cart", label: "Shopping Bag" },
  { href: "/orders", label: "My Orders" },
  { href: "/bulk-procurement", label: "Bulk Procurement" },
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Get in Touch" },
];

const policyLinks = [
  { href: "/delivery-and-shipping", label: "Delivery & Shipping" },
  { href: "/returns-and-refunds", label: "Returns & Refunds" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

export default function Footer() {
  const { contact, social } = siteConfig;
  const socials = Object.entries(social).filter(([, url]) => url);
  const hasContact = contact.lines.length > 0 || contact.email || contact.address;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 overflow-hidden bg-[#f6f3ed] text-[#292721] sm:mt-24">
      {/* Closing editorial statement */}
      <div className="border-b border-[#292721]/10">
        <Container className="py-14 text-center sm:py-20 md:py-24">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9b7a48] sm:text-[11px] sm:tracking-[0.35em]">
            A considered way to dress
          </span>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-3xl font-normal leading-[1.15] tracking-[-0.03em] sm:text-5xl md:text-6xl">
            Style is a language.
            <br />
            <span className="italic text-[#9b7a48]">
              Make yours unforgettable.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#777168]">
            Discover thoughtfully selected pieces that make every moment
            feel a little more extraordinary.
          </p>

          <Link
            href="/marketplace"
            className="group mt-8 inline-flex max-w-full items-center justify-center gap-3 border border-[#292721] px-6 py-3.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 hover:border-[#9b7a48] hover:bg-[#292721] hover:text-white sm:px-7 sm:text-[11px] sm:tracking-[0.2em]"
          >
            Explore the collection
            <ArrowRight
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Container>
      </div>

      {/* Main footer: stacked on phones, two columns on tablets, three on desktop */}
      <Container className="grid gap-12 py-12 sm:py-16 md:grid-cols-2 md:gap-x-10 lg:grid-cols-12">
        {/* Brand identity */}
        <div className="md:col-span-2 lg:col-span-5">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.08em] sm:text-3xl">
              {siteConfig.name}
            </span>
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#9b7a48]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9b7a48] sm:text-[11px] sm:tracking-[0.28em]">
              The Art of Dressing
            </span>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#777168]">
            {siteConfig.tagline ||
              "Discover timeless style, considered details, and pieces worth wearing."}
          </p>

          {socials.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {socials.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#625e55] transition-colors hover:text-[#9b7a48]"
                >
                  {name}
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.4}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="lg:col-span-3">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#9b7a48]">
            Discover
          </h3>

          <ul className="mt-6 space-y-4">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-2 text-sm text-[#625e55] transition-colors hover:text-[#9b7a48]"
                >
                  {item.label}
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.3}
                    className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-4">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-[#9b7a48]">
            We’re here for you
          </h3>

          <p className="mt-5 max-w-xs text-sm leading-6 text-[#777168]">
            Questions about an order or need a little assistance? We would love
            to hear from you.
          </p>

          <ul className="mt-6 space-y-5">
            {contact.lines.map((line) => (
              <li key={line.phone} className="flex items-start gap-3">
                <Phone
                  size={16}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#9b7a48]"
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#625e55]">
                  <a
                    href={`tel:${line.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-[#9b7a48]"
                  >
                    {line.phone}
                  </a>
                  <a
                    href={whatsappLink(line.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#9b7a48] transition-colors hover:text-[#292721]"
                  >
                    <MessageCircle size={14} strokeWidth={1.4} />
                    WhatsApp
                  </a>
                </div>
              </li>
            ))}

            {contact.email && (
              <li className="flex items-start gap-3">
                <Mail
                  size={16}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#9b7a48]"
                />
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all text-sm text-[#625e55] transition-colors hover:text-[#9b7a48]"
                >
                  {contact.email}
                </a>
              </li>
            )}

            {contact.address && (
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#9b7a48]"
                />
                <span className="text-sm leading-6 text-[#625e55]">
                  {contact.address}
                </span>
              </li>
            )}

            {!hasContact && (
              <li className="text-sm text-[#777168]">
                Contact details coming soon.
              </li>
            )}
          </ul>

          <Link
            href="/contact"
            className="group mt-7 inline-flex items-center gap-2 border-b border-[#9b7a48]/50 pb-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-[#292721] hover:text-[#9b7a48]"
          >
            Contact our team
            <ArrowRight
              size={13}
              strokeWidth={1.4}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-[#292721]/10">
        <Container className="space-y-4 py-5">
          <nav
            aria-label="Policies"
            className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.12em] text-[#625e55]"
          >
            {policyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#9b7a48]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] tracking-wide text-[#777168]">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>

            <p className="font-serif text-sm italic text-[#9b7a48]">
              Wear what feels like you.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}