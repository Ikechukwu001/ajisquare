import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getCategories, getProducts } from "@/lib/server/catalog";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { stockStatus } from "@/lib/utils/inventory";
import { getMinQty, isPreorder } from "@/lib/utils/product";

export const metadata = { title: "Products" };

function StockBadge({ product }) {
  if (isPreorder(product)) return <span className="text-accent">Pre-order</span>;
  const status = stockStatus(product.stock);
  if (status === "out") return <span className="text-red-600">Out of stock</span>;
  if (status === "low") return <span className="text-accent">Low ({product.stock})</span>;
  return <span>{product.stock}</span>;
}

export default async function AdminProductsPage() {
  await requireAdmin();

  const [products, categories] = await Promise.all([
    getProducts({ includeUnavailable: true }),
    getCategories(),
  ]);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  // Pre-order items don't track stock
  const tracked = products.filter((p) => !isPreorder(p));
  const outCount = tracked.filter((p) => stockStatus(p.stock) === "out").length;
  const lowCount = tracked.filter((p) => stockStatus(p.stock) === "low").length;

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-2 text-sm text-muted">
            {products.length} {products.length === 1 ? "product" : "products"}
            {lowCount > 0 && ` · ${lowCount} low on stock`}
            {outCount > 0 && ` · ${outCount} out of stock`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-foreground px-6 py-2.5 text-sm uppercase tracking-wider text-white hover:bg-accent"
        >
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-muted">No products yet. Add your first product to get started.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-border bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Stock</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const src = p.image || "/products/placeholder.svg";
                const minQty = getMinQty(p);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-[60px] w-12 shrink-0 overflow-hidden bg-border/40">
                          <Image src={src} alt="" fill sizes="48px" unoptimized={src.endsWith(".svg")} className="object-cover" />
                        </div>
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {minQty > 1 && <p className="text-xs text-muted">Minimum order: {minQty}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{categoryName.get(p.categoryId) || "None"}</td>
                    <td className="p-3">
                      <p>{formatNaira(p.price)}</p>
                      {p.priceUsd != null && <p className="text-xs text-muted">{formatUsd(p.priceUsd)}</p>}
                    </td>
                    <td className="p-3"><StockBadge product={p} /></td>
                    <td className="p-3 text-xs">
                      {!p.available && <span className="mr-2 border border-border px-2 py-0.5">Hidden</span>}
                      {p.featured && <span className="border border-accent px-2 py-0.5 text-accent">Featured</span>}
                      {p.available && !p.featured && <span className="text-muted">Visible</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-4">
                        <Link href={`/admin/products/${p.id}/edit`} className="hover:underline">Edit</Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}