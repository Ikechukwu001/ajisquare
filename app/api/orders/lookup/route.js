import { NextResponse } from "next/server";
import { getOrderSummaries } from "@/lib/server/orderLookup";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const references = Array.isArray(body?.references)
    ? body.references.filter((r) => typeof r === "string").slice(0, 20)
    : [];

  if (references.length === 0) return NextResponse.json({ orders: [] });

  try {
    const orders = await getOrderSummaries(references);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Order lookup failed:", err);
    return NextResponse.json({ error: "Could not load your orders. Please try again." }, { status: 500 });
  }
}