import { NextResponse } from "next/server";
import { createBulkRequest } from "@/lib/server/bulkRequests";
import { errorResponse } from "@/lib/server/adminCatalog";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this hidden field, bots usually do
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ reference: "BR-AAAAA-AAAAA" }, { status: 201 });
  }

  try {
    const reference = await createBulkRequest(body);
    return NextResponse.json({ reference }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}