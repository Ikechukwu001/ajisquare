import Link from "next/link";
import { PolicyContact, PolicyPage, PolicySection } from "@/components/policy/PolicyPage";
import { policies } from "@/lib/config/policies";

export const metadata = { title: "Delivery and Shipping" };

export default function DeliveryAndShippingPage() {
  const { deliveryTimeframe, procurementTimeframe } = policies;

  return (
    <PolicyPage
      title="Delivery and shipping"
      intro="How your order gets from our suppliers to you, and how shipping is charged."
    >
      <PolicySection title="Two separate payments">
        <p>
          When you place an order, you first pay the full amount for your items online, in Naira. Shipping is not
          included in that amount. It is calculated separately and paid separately.
        </p>
        <ul>
          <li>Pay for your items from your order page, using Paystack.</li>
          <li>We confirm your order and begin procurement.</li>
          <li>We work out your shipping fee and contact you on the phone number you gave at checkout.</li>
          <li>Your shipping fee appears on your order page, where you can pay it online in Naira.</li>
          <li>We arrange delivery once your shipping fee has been paid, and keep you updated.</li>
        </ul>
      </PolicySection>

      <PolicySection title="How your shipping fee is worked out">
        <p>
          Shipping depends on where your goods are going, how big and heavy they are, and how they are sent. That is
          why it is not a single fixed price. Sometimes shipping is free, and if so we'll tell you.
        </p>
      </PolicySection>

      <PolicySection title="Delivery area and timing">
        <p>We currently deliver within Nigeria. Please give a complete, correct address and a working phone number.</p>
        {deliveryTimeframe ? (
          <p>{deliveryTimeframe}</p>
        ) : (
          <p>We'll tell you the expected delivery timing when we confirm your shipping.</p>
        )}
      </PolicySection>

      <PolicySection title="Pre-orders and bulk procurement">
        <p>
          Pre-order items and bulk procurement orders are sourced for you after payment, so they take longer than
          items we already have in stock.
        </p>
        {procurementTimeframe ? (
          <p>{procurementTimeframe}</p>
        ) : (
          <p>We'll confirm the expected timing with you once your payment is received.</p>
        )}
      </PolicySection>

      <PolicySection title="Following your order">
        <p>
          Open <Link href="/orders">My Orders</Link> to see the status of your order. On a different phone or
          browser, use "Find an order" with your order reference and the phone number you used at checkout.
        </p>
      </PolicySection>

      <PolicySection title="Questions about delivery">
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}