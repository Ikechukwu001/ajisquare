"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/config/site";
import { useCart } from "@/context/CartContext";

// Split around the centered brand so neither side overflows
const leftLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Shop Products" },
  { href: "/bulk-procurement", label: "Bulk Procurement" },
];

const rightLinks = [
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
];

// Mobile and tablet menu shows everything in one list
const mobileLinks = [
  ...leftLinks,
  ...rightLinks,
  { href: "/orders", label: "My Orders" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href) =>
    `group relative inline-flex items-center whitespace-nowrap py-2 text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 ${
      isActive(href)
        ? "text-[#9a7945]"
        : "text-[#55514a] hover:text-[#9a7945]"
    }`;

  const renderDesktopLink = (link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={isActive(link.href) ? "page" : undefined}
      className={linkClass(link.href)}
    >
      {link.label}
      <span
        className={`absolute bottom-0 left-0 h-px bg-[#9a7945] transition-all duration-200 ${
          isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6] text-[#24221f]">
      {/* Announcement: wraps on narrow screens instead of being cut off */}
      <div className="flex min-h-8 items-center justify-center bg-[#24221f] px-4 py-1.5 text-center text-[10px] leading-snug tracking-[0.12em] text-[#f7f3eb] text-balance sm:text-[11px] sm:tracking-[0.2em]">
        A NEW EXPRESSION OF EVERYDAY LUXURY
      </div>

      <Container>
        {/* Three columns keep the brand centered; each side holds its own links */}
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[#24221f]/10 sm:h-[76px] xl:h-[84px]">
          {/* Left: desktop links, or the menu button on smaller screens */}
          <div className="flex min-w-0 items-center">
            <nav
              className="hidden items-center gap-6 xl:flex"
              aria-label="Main navigation"
            >
              {leftLinks.map(renderDesktopLink)}
            </nav>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-start transition-colors hover:text-[#9a7945] xl:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? (
                <X size={21} strokeWidth={1.4} />
              ) : (
                <Menu size={22} strokeWidth={1.4} />
              )}
            </button>
          </div>

          {/* Center: brand */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex min-w-0 max-w-[48vw] flex-col items-center text-center sm:max-w-none"
            aria-label={`${siteConfig.name} home`}
          >
            <span className="whitespace-nowrap font-serif text-[17px] font-medium leading-tight tracking-[0.06em] sm:text-xl sm:tracking-[0.1em] md:text-2xl xl:text-[26px]">
              {siteConfig.name}
            </span>
            <span className="mt-1 whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-[#9a7945] sm:text-[9px] sm:tracking-[0.3em]">
              The Art of Dressing
            </span>
          </Link>

          {/* Right: remaining links, orders, and bag */}
          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            <nav
              className="mr-4 hidden items-center gap-6 xl:flex"
              aria-label="Secondary navigation"
            >
              {rightLinks.map(renderDesktopLink)}
            </nav>

            <Link
              href="/orders"
              aria-label="My Orders"
              title="My Orders"
              aria-current={isActive("/orders") ? "page" : undefined}
              className={`flex h-10 w-9 items-center justify-center transition-colors hover:text-[#9a7945] ${
                isActive("/orders") ? "text-[#9a7945]" : ""
              }`}
            >
              <PackageCheck size={19} strokeWidth={1.4} />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-9 items-center justify-end transition-colors hover:text-[#9a7945]"
              aria-label={`Shopping bag${
                hydrated && itemCount > 0 ? `, ${itemCount} items` : ""
              }`}
            >
              <ShoppingBag size={21} strokeWidth={1.4} />

              {hydrated && itemCount > 0 && (
                <span className="absolute right-[-3px] top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#9a7945] px-1 text-[9px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </Container>

      {/* Mobile and tablet navigation */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-b border-[#24221f]/10 bg-[#faf9f6] xl:hidden"
            aria-label="Mobile navigation"
          >
            <Container>
              {/* Scrolls inside itself on short screens */}
              <div className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-y-auto py-3">
                {mobileLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.035 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-[#24221f]/[0.07] py-[17px] text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-[#9a7945] ${
                        isActive(link.href)
                          ? "text-[#9a7945]"
                          : "text-[#38352f]"
                      }`}
                    >
                      {link.label}
                      <ArrowUpRight size={15} strokeWidth={1.3} />
                    </Link>
                  </motion.div>
                ))}

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-[17px] text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-[#9a7945] ${
                    isActive("/cart") ? "text-[#9a7945]" : ""
                  }`}
                >
                  Shopping Bag
                  <span className="flex items-center gap-2">
                    {hydrated && itemCount > 0 && (
                      <span className="text-[10px] text-[#9a7945]">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    )}
                    <ShoppingBag size={17} strokeWidth={1.3} />
                  </span>
                </Link>

                <p className="pb-3 pt-5 text-[10px] uppercase tracking-[0.24em] text-[#9a7945]">
                  Dress with intention.
                </p>
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}