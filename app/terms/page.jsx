import Link from "next/link";
import { PolicyContact, PolicyPage, PolicySection } from "@/components/policy/PolicyPage";
import { policies } from "@/lib/config/policies";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  const businessName = policies.legalName || siteConfig.name;

  return (
    <PolicyPage
      title="Terms of use"
      intro={`By using this website or placing an order, you agree to these terms with ${businessName}.`}
    >
      <PolicySection title="About us">
        <p>
          {siteConfig.name} is a global sourcing, procurement, and importation brand. Through this website we sell
          selected products from international markets and offer bulk procurement support.
        </p>
      </PolicySection>

      <PolicySection title="Prices and payment">
        <ul>
          <li>Prices are in Nigerian Naira. Any US Dollar price shown is for reference only. You always pay in Naira.</li>
          <li>You pay the full amount for your items before we begin procurement.</li>
          <li>
            Shipping is calculated and paid separately. See{" "}
            <Link href="/delivery-and-shipping">Delivery and shipping</Link>.
          </li>
          <li>Payments are processed securely by Paystack. Your payment fees, if shown at checkout, are part of the amount you pay.</li>
          <li>An order is confirmed once your payment has been verified.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Availability and changes">
        <p>
          Stock and prices can change. If an item you paid for turns out to be unavailable, we'll contact you and
          refund you if we cannot supply it. Timing for pre-order items is an estimate, not a guarantee.
        </p>
      </PolicySection>

      <PolicySection title="Bulk procurement">
        <p>
          Sending a bulk procurement request does not create an order. A request becomes an order only after we send
          you a quotation, you accept it, and the full procurement amount has been paid.
        </p>
      </PolicySection>

      <PolicySection title="Returns and refunds">
        <p>
          Please read our <Link href="/returns-and-refunds">Returns and refunds</Link> policy.
        </p>
      </PolicySection>

      <PolicySection title="Using the website">
        <p>
          Please give accurate information when you order or send a request, and don't misuse the website, for
          example by trying to interfere with it or access areas that are not meant for customers.
        </p>
      </PolicySection>

      <PolicySection title="Our responsibility">
        <p>
          We take care to describe products accurately, but photos and descriptions may differ slightly from what
          you receive. To the extent the law allows, we are not responsible for delays or losses caused by events
          outside our control, such as customs, carriers, or supplier delays.
        </p>
      </PolicySection>

      <PolicySection title="Privacy">
        <p>
          See our <Link href="/privacy">Privacy policy</Link> for how we handle your information.
        </p>
      </PolicySection>

      <PolicySection title="Governing law and changes">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. We may update them from time to
          time. The date at the top shows when they were last changed.
        </p>
      </PolicySection>

      <PolicySection title="Contact us">
        {policies.registeredAddress && <p>{businessName}, {policies.registeredAddress}</p>}
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}