import { getSiteUrl } from "@/lib/config/siteUrl";

export default function robots() {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or personal pages that should never appear in search results
        disallow: ["/admin", "/api/", "/order/", "/orders", "/payment/", "/bulk-procurement/request/", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}