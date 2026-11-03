import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { listOrders } from "@/lib/server/adminOrders";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils/inventory";

export async function getDashboardData() {
  const db = adminDb();

  const [orderCount, productCount, paidSnap, lowSnap, recentOrders] = await Promise.all([
    db.collection("orders").count().get(),
    db.collection("products").count().get(),
    // Only verified successful payments count as revenue
    db.collection("orders").where("paymentStatus", "==", "success").select("subtotal", "fulfillmentStatus").get(),
    db.collection("products").where("stock", "<=", LOW_STOCK_THRESHOLD).get(),
    listOrders(5),
  ]);

  // Cancelled orders are not counted as sales
  const paidOrders = paidSnap.docs.map((d) => d.data()).filter((o) => o.fulfillmentStatus !== "cancelled");
  const confirmedRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);

  const lowStock = lowSnap.docs
    .map((d) => {
      const p = d.data();
      return {
        id: d.id,
        name: p.name || d.id,
        stock: Number(p.stock) || 0,
        hidden: p.available === false,
      };
    })
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));

  return {
    totalOrders: orderCount.data().count,
    totalProducts: productCount.data().count,
    confirmedRevenue,
    paidOrderCount: paidOrders.length,
    lowStock,
    recentOrders,
  };
}