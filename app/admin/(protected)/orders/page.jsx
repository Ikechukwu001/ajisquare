import Container from "@/components/ui/Container";
import OrdersTable from "@/components/admin/OrdersTable";
import { requireAdmin } from "@/lib/server/adminAuth";
import { listOrders } from "@/lib/server/adminOrders";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrders();

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Newest first. Click an order to see the details and update it.</p>
      <OrdersTable orders={orders} />
    </Container>
  );
}