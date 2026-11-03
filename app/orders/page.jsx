import Container from "@/components/ui/Container";
import MyOrders from "@/components/orders/MyOrders";
import TrackOrderForm from "@/components/orders/TrackOrderForm";

export const metadata = { title: "My orders" };

export default function OrdersPage() {
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-serif text-3xl sm:text-4xl">My orders</h1>
      <p className="mt-2 max-w-xl text-muted">
        See the orders you've placed and where they are.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="recent-orders">
          <h2 id="recent-orders" className="mb-4 font-serif text-2xl">Your recent orders</h2>
          <MyOrders />
          <p className="mt-4 text-xs text-muted">
            This list is saved on this phone or browser only.
          </p>
        </section>

        <section aria-labelledby="find-order">
          <h2 id="find-order" className="mb-4 font-serif text-2xl">Find an order</h2>
          <TrackOrderForm />
        </section>
      </div>
    </Container>
  );
}