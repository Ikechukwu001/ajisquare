import { NextResponse } from "next/server";
import { validateCheckout } from "@/lib/validation/checkout";
import { createOrder, OrderError } from "@/lib/server/orders";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { ok, errors, values } = validateCheckout(body?.customer);
  if (!ok) {
    return NextResponse.json({ error: "Please check your details.", fieldErrors: errors }, { status: 400 });
  }

  try {
    const { reference } = await createOrder({ customer: values, items: body?.items });
    return NextResponse.json({ reference }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message, ...err.extra }, { status: err.status });
    }
    console.error("Create order failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}