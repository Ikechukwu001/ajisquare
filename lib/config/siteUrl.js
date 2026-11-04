// The public address of the site, used for link previews, robots.txt, and the sitemap.
// Set NEXT_PUBLIC_SITE_URL on Vercel to your live address, e.g. https://ajisquare.vercel.app
export function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim().replace(/\/$/, "");
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:3000";
  }
}