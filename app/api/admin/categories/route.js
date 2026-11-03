import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/server/adminAuth";
import { createCategory, errorResponse } from "@/lib/server/adminCatalog";

export async function POST(request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const id = await createCategory(body);
    revalidatePath("/");
    revalidatePath("/marketplace");
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}