import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getCategories } from "@/lib/server/catalog";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="font-serif text-3xl">Add product</h1>

      {categories.length === 0 ? (
        <p className="mt-6 text-muted">
          You need at least one category first.{" "}
          <Link href="/admin/categories" className="underline hover:text-accent">Add a category</Link>
        </p>
      ) : (
        <div className="mt-8">
          <ProductForm mode="create" categories={categories} />
        </div>
      )}
    </Container>
  );
}