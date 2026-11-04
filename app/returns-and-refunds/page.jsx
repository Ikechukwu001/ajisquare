import { PolicyContact, PolicyPage, PolicySection } from "@/components/policy/PolicyPage";
import { policies } from "@/lib/config/policies";

export const metadata = { title: "Returns and Refunds" };

export default function ReturnsAndRefundsPage() {
  const { returnWindowDays, returnShippingPaidBy } = policies;

  return (
    <PolicyPage
      title="Returns and refunds"
      intro="What to do if something isn't right with your order."
    >
      <PolicySection title="Check your order when it arrives">
        <p>
          Please check your items as soon as they arrive. If something is damaged, faulty, or not what you ordered,
          contact us
          {returnWindowDays ? ` within ${returnWindowDays} days of delivery` : " as soon as possible"}, with your
          order reference and clear photos.
        </p>
      </PolicySection>

      <PolicySection title="Before you pay">
        <p>
          Pre-order items and bulk procurement orders are sourced specially for you after payment. Please check the
          product details, quantities, and your delivery information carefully before you pay, because it may not be
          possible to change an order once procurement has started.
        </p>
      </PolicySection>

      <PolicySection title="Returns">
        <p>When we agree that an item can be returned, we'll tell you how and where to send it.</p>
        {returnShippingPaidBy === "customer" && (
          <p>If you return an item because you changed your mind, you pay for the return shipping.</p>
        )}
        {returnShippingPaidBy === "business" && (
          <p>We cover the return shipping for items that we agree can be returned.</p>
        )}
        {!returnShippingPaidBy && <p>We'll confirm with you who covers the return shipping when we agree to a return.</p>}
      </PolicySection>

      <PolicySection title="Refunds">
        <ul>
          <li>Approved refunds are sent back to you through the original payment method.</li>
          <li>The time it takes to reach your account depends on your bank or card provider.</li>
          <li>Shipping fees are handled case by case, and we'll tell you before anything is decided.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Cancelling an order">
        <p>
          To cancel, contact us as soon as possible with your order reference. Once procurement or shipping has
          started, it may not be possible to cancel. If we cancel an order that you have already paid for, for
          example because an item is no longer available, you'll be refunded.
        </p>
      </PolicySection>

      <PolicySection title="Contact us">
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}