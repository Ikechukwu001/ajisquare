import { NextResponse } from "next/server";
import { verifyOrderPhone } from "@/lib/server/orderLookup";
import { normalizeReference } from "@/lib/utils/orderReference";
import { normalizePhone } from "@/lib/validation/checkout";

const NOT_FOUND_MESSAGE =
  "We couldn't find an order with those details. Check the reference and phone number and try again.";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = normalizeReference(body?.reference);
  const phone = normalizePhone(body?.phone);

  // Same message for every failure, so nobody can use this to check which references exist
  if (!reference || !phone) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  try {
    const ok = await verifyOrderPhone(reference, phone);
    if (!ok) return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    return NextResponse.json({ reference });
  } catch (err) {
    console.error("Order tracking failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}