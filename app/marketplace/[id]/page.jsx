import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductGallery from "@/components/store/ProductGallery";
import AddToCart from "@/components/store/AddToCart";
import { getCategories, getProduct } from "@/lib/server/catalog";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { getAvailability, getMinQty, isPreorder } from "@/lib/utils/product";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);
  return { title: product?.name || "Product" };
}

const STATUS_COLOR = {
  in: "text-green-700",
  low: "text-accent",
  preorder: "text-accent",
  out: "text-red-600",
};

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product || !product.available) notFound();

  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.id === product.categoryId);

  const images = [product.image, ...(product.images || [])].filter(Boolean);
  const uniqueImages = [...new Set(images)];

  const availability = getAvailability(product);
  const minQty = getMinQty(product);

  return (
    <Container className="py-8 sm:py-12">
      <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ChevronLeft size={16} /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductGallery images={uniqueImages} name={product.name} />

        <div>
          {category && (
            <Link
              href={`/marketplace?category=${category.id}`}
              className="text-xs uppercase tracking-[0.2em] text-accent hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{product.name}</h1>

          <p className="mt-3 text-2xl">{formatNaira(product.price)}</p>
          {product.priceUsd != null && (
            <p className="mt-1 text-sm text-muted">{formatUsd(product.priceUsd)} (reference price)</p>
          )}

          <p className={`mt-3 text-sm font-medium ${STATUS_COLOR[availability.key]}`}>{availability.label}</p>
          {minQty > 1 && <p className="mt-1 text-sm text-muted">Minimum order: {minQty}</p>}

          {product.description && <p className="mt-6 leading-relaxed text-muted">{product.description}</p>}

          {isPreorder(product) && (
            <p className="mt-6 border border-border bg-white p-4 text-sm text-muted">
              This is a pre-order item. It is procured for you after payment, and we'll confirm the expected
              timing with you.
            </p>
          )}

          <AddToCart product={product} />

          <p className="mt-8 border-t border-border pt-4 text-sm text-muted">
            You pay for your items in Naira. Shipping is calculated separately and confirmed with you after your
            order.
          </p>
        </div>
      </div>
    </Container>
  );
}