import { PolicyContact, PolicyPage, PolicySection } from "@/components/policy/PolicyPage";
import { policies } from "@/lib/config/policies";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const businessName = policies.legalName || siteConfig.name;

  return (
    <PolicyPage
      title="Privacy policy"
      intro={`This explains what personal information ${businessName} collects when you use this website, why, and how it is handled.`}
    >
      <PolicySection title="What we collect">
        <ul>
          <li>
            <strong>For orders:</strong> your name, phone number, email address, delivery address, delivery notes, and
            the items you order.
          </li>
          <li>
            <strong>For bulk procurement requests:</strong> your name, business name, phone number, email address,
            what you want to buy, quantity, budget, and delivery location.
          </li>
          <li>
            <strong>Payment records:</strong> the payment reference, amount, date, and payment method (such as card
            or bank transfer). We do not see or store your card number or PIN. Payments are handled by Paystack.
          </li>
          <li>
            <strong>Messages:</strong> anything you send us through WhatsApp, phone, or email.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How we use it">
        <ul>
          <li>To process and deliver your orders and to confirm payments.</li>
          <li>To contact you about your order, shipping fee, quotation, or delivery.</li>
          <li>To send receipts and order updates.</li>
          <li>To keep records of our sales, as the business needs and the law requires.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Who we share it with">
        <p>We only share what is needed to run the service:</p>
        <ul>
          <li>Paystack, to take and confirm your payment.</li>
          <li>Google Firebase, which stores our order and product records.</li>
          <li>Vercel, which hosts this website.</li>
          <li>Delivery partners, who receive your name, phone number, and address so they can deliver to you.</li>
          <li>WhatsApp, only when you choose to message us there.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </PolicySection>

      <PolicySection title="Information stored in your browser">
        <p>
          To work properly, the site stores a few things in your own browser: the items in your cart, and a list of
          your recent order references so "My Orders" can show them. This stays on your device. We don't use
          advertising or tracking cookies. If that changes, we'll update this page.
        </p>
      </PolicySection>

      <PolicySection title="How long we keep it">
        <p>
          We keep order and payment records for as long as we need them for our business, accounting, and legal
          obligations. Bulk procurement requests are kept so we can follow up and for our records.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You can ask us to show you the information we hold about you, correct it, or delete it where we are able
          to, in line with Nigerian data protection law. Some records may need to be kept for legal or accounting
          reasons. Contact us with your request.
        </p>
      </PolicySection>

      <PolicySection title="Contact us">
        {policies.registeredAddress && <p>{businessName}, {policies.registeredAddress}</p>}
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}