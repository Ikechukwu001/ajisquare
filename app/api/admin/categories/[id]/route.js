import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/server/adminAuth";
import { deleteCategory, errorResponse, updateCategory } from "@/lib/server/adminCatalog";

function refreshStore() {
  revalidatePath("/");
  revalidatePath("/marketplace");
}

export async function PUT(request, { params }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await updateCategory(id, body);
    refreshStore();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request, { params }) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteCategory(id);
    refreshStore();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}