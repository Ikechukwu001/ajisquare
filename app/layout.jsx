import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import { siteConfig } from "@/lib/config/site";
import { CartProvider } from "@/context/CartContext";
import StoreChrome from "@/components/layout/StoreChrome";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <CartProvider>
          <StoreChrome footer={<Footer />}>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}