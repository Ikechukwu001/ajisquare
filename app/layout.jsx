import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import { siteConfig } from "@/lib/config/site";
import { getSiteUrl } from "@/lib/config/siteUrl";
import { CartProvider } from "@/context/CartContext";
import StoreChrome from "@/components/layout/StoreChrome";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const defaultTitle = `${siteConfig.name} | ${siteConfig.tagline}`;

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_NG",
    title: defaultTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-NG">
      <body className="flex min-h-screen flex-col antialiased">
        <CartProvider>
          <StoreChrome footer={<Footer />}>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}