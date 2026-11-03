import { NextResponse } from "next/server";
import { paymentErrorResponse, verifyAndApplyPayment } from "@/lib/server/payments";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = typeof body?.reference === "string" ? body.reference : "";

  try {
    const result = await verifyAndApplyPayment(reference);
    return NextResponse.json({
      status: result.status,
      orderReference: result.orderReference,
      purpose: result.purpose,
    });
  } catch (err) {
    return paymentErrorResponse(err);
  }
}