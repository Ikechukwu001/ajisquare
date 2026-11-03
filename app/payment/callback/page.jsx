import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";
import VerifyPayment from "@/components/payment/VerifyPayment";

export const metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default async function PaymentCallbackPage({ searchParams }) {
  const { reference, trxref } = await searchParams;
  const paymentReference =
    typeof reference === "string" ? reference : typeof trxref === "string" ? trxref : "";

  return (
    <Container className="max-w-xl py-16">
      {paymentReference ? (
        <VerifyPayment reference={paymentReference} />
      ) : (
        <div className="py-8 text-center">
          <h1 className="font-serif text-3xl">No payment found</h1>
          <p className="mt-2 text-muted">This page needs a payment reference. Open your order to pay or check its status.</p>
          <div className="mt-8">
            <ButtonLink href="/orders">My orders</ButtonLink>
          </div>
        </div>
      )}
    </Container>
  );
}