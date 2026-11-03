import Container from "@/components/ui/Container";
import CategoryManager from "@/components/admin/CategoryManager";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getCategories } from "@/lib/server/catalog";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <Container className="max-w-3xl py-10">
      <h1 className="font-serif text-3xl">Categories</h1>
      <p className="mt-2 mb-8 text-muted">Categories group your products in the store. Lower order numbers show first.</p>
      <CategoryManager categories={categories} />
    </Container>
  );
}