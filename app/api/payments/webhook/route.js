import { NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/server/paystack";
import { PaymentError, verifyAndApplyPayment } from "@/lib/server/payments";

export async function POST(request) {
  // The signature is calculated over the raw body, so read it as text first
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Only successful charges matter here. Everything else is acknowledged and ignored.
  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  try {
    // Verified again with Paystack, and safe to receive more than once
    await verifyAndApplyPayment(event?.data?.reference);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // A reference we never created (another payment on the same Paystack account) is not an error
    if (err instanceof PaymentError && err.status === 404) {
      return NextResponse.json({ ok: true });
    }
    // Anything else: tell Paystack to try again later
    console.error("Webhook processing failed:", err.message);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}