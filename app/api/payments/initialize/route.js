import { NextResponse } from "next/server";
import { paymentErrorResponse, startPayment } from "@/lib/server/payments";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = typeof body?.reference === "string" ? body.reference : "";
  const purpose = body?.purpose === "shipping" ? "shipping" : "items";

  try {
    const { authorizationUrl } = await startPayment(reference, purpose);
    return NextResponse.json({ authorizationUrl });
  } catch (err) {
    return paymentErrorResponse(err);
  }
}