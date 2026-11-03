import Link from "next/link";
import Container from "@/components/ui/Container";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getDashboardData } from "@/lib/server/adminDashboard";
import { formatNaira } from "@/lib/utils/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils/inventory";
import {
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  fulfillmentTone,
  paymentTone,
} from "@/lib/utils/orderStatus";

export const metadata = { title: "Dashboard" };

function StatCard({ label, value, note, href }) {
  const content = (
    <div className="h-full border border-border bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-colors hover:[&>div]:border-foreground">
      {content}
    </Link>
  ) : (
    content
  );
}

export default async function AdminDashboardPage() {
  // Every admin page checks access itself, not just the layout
  const user = await requireAdmin();
  const data = await getDashboardData();

  const outOfStock = data.lowStock.filter((p) => p.stock <= 0).length;

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Signed in as {user.email}.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={data.totalOrders} href="/admin/orders" />
        <StatCard
          label="Confirmed revenue"
          value={formatNaira(data.confirmedRevenue)}
          note={`From ${data.paidOrderCount} paid ${data.paidOrderCount === 1 ? "order" : "orders"}. Verified payments only, delivery fees not included.`}
        />
        <StatCard label="Total products" value={data.totalProducts} href="/admin/products" />
        <StatCard
          label="Low stock"
          value={data.lowStock.length}
          note={
            data.lowStock.length === 0
              ? "Everything is well stocked."
              : `${outOfStock} out of stock, ${data.lowStock.length - outOfStock} running low (${LOW_STOCK_THRESHOLD} or fewer).`
          }
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Recent orders */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-muted hover:text-accent">View all</Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="mt-4 border border-dashed border-border bg-white p-5 text-sm text-muted">
              No orders yet. Orders appear here when customers check out.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border border border-border bg-white">
              {data.recentOrders.map((o) => (
                <li key={o.reference}>
                  <Link href={`/admin/orders/${o.reference}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-background">
                    <div>
                      <p className="text-sm font-medium">{o.reference}</p>
                      <p className="text-xs text-muted">
                        {o.customerName} · {o.createdLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm">{formatNaira(o.subtotal)}</span>
                      <StatusBadge tone={paymentTone(o.paymentStatus)}>
                        {PAYMENT_LABELS[o.paymentStatus] || o.paymentStatus}
                      </StatusBadge>
                      <StatusBadge tone={fulfillmentTone(o.fulfillmentStatus)}>
                        {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
                      </StatusBadge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-muted hover:text-accent">All products</Link>
          </div>

          {data.lowStock.length === 0 ? (
            <p className="mt-4 border border-dashed border-border bg-white p-5 text-sm text-muted">
              All products are well stocked.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border border border-border bg-white">
              {data.lowStock.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className={`text-xs ${p.stock <= 0 ? "text-red-600" : "text-accent"}`}>
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                      {p.hidden && <span className="text-muted"> · Hidden</span>}
                    </p>
                  </div>
                  <Link href={`/admin/products/${p.id}/edit`} className="shrink-0 text-sm hover:underline">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {data.lowStock.length > 10 && (
            <p className="mt-2 text-xs text-muted">Showing 10 of {data.lowStock.length}.</p>
          )}
        </section>
      </div>
    </Container>
  );
}