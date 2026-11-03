import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/adminCatalog";
import { saveBulkQuote, updateBulkStatus } from "@/lib/server/bulkRequests";

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
    if (body?.type === "status") {
      await updateBulkStatus(reference, body.status);
    } else if (body?.type === "quote") {
      await saveBulkQuote(reference, { amount: body.amount, amountUsd: body.amountUsd, note: body.note });
    } else {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}