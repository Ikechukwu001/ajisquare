import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/adminCatalog";
import {
  clearOrderAttention,
  updateDeliveryFee,
  updateFulfillmentStatus,
} from "@/lib/server/adminOrders";

export async function PATCH(request, { params }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { reference } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    if (body?.type === "fulfillment") {
      await updateFulfillmentStatus(reference, body.status);
    } else if (body?.type === "delivery_fee") {
      await updateDeliveryFee(reference, { action: body.action, amount: body.amount });
    } else if (body?.type === "attention") {
      await clearOrderAttention(reference);
    } else {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}