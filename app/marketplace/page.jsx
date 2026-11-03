import Container from "@/components/ui/Container";
import MarketplaceClient from "@/components/store/MarketplaceClient";
import { getCategories, getProducts } from "@/lib/server/catalog";

export const metadata = { title: "Marketplace" };

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams;
  const initialCategory = typeof params?.category === "string" ? params.category : "all";

  let products = [];
  let categories = [];
  let failed = false;

  try {
    [categories, products] = await Promise.all([getCategories(), getProducts()]);
  } catch (err) {
    console.error("Marketplace data error:", err.message);
    failed = true;
  }

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl sm:text-4xl">Marketplace</h1>
      <p className="mt-2 mb-8 text-muted">Browse the full collection.</p>

      {failed ? (
        <p className="py-12 text-center text-muted">We couldn't load the products right now. Please refresh the page.</p>
      ) : (
        <MarketplaceClient products={products} categories={categories} initialCategory={initialCategory} />
      )}
    </Container>
  );
}