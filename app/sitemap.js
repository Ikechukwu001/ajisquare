import { getSiteUrl } from "@/lib/config/siteUrl";
import { getProducts } from "@/lib/server/catalog";

// Rebuilt at most once an hour
export const revalidate = 3600;

export default async function sitemap() {
  const base = getSiteUrl();
  const now = new Date();

  const pages = [
    "",
    "/marketplace",
    "/bulk-procurement",
    "/about",
    "/how-it-works",
    "/contact",
    "/delivery-and-shipping",
    "/returns-and-refunds",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: `${base}${path}`, lastModified: now }));

  let products = [];
  try {
    products = (await getProducts()).map((p) => ({
      url: `${base}/marketplace/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    }));
  } catch {
    // If the database can't be reached, the sitemap still lists the main pages
  }

  return [...pages, ...products];
}