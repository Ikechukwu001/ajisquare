import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export default function PromoBanner() {
  const { promo } = siteConfig;
  if (!promo.text) return null;

  return (
    <div className="bg-accent text-white">
      <Link
        href={promo.link || "/marketplace"}
        className="mx-auto block max-w-6xl px-4 py-2.5 text-center text-sm tracking-wide hover:underline"
      >
        {promo.text}
      </Link>
    </div>
  );
}