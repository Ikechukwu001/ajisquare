import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getCategories, getProduct } from "@/lib/server/catalog";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) notFound();

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="font-serif text-3xl">Edit product</h1>
      <p className="mt-1 text-sm text-muted">{product.name}</p>
      <div className="mt-8">
        <ProductForm mode="edit" productId={id} initial={product} categories={categories} />
      </div>
    </Container>
  );
}