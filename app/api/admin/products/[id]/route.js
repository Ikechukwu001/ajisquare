import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/server/adminAuth";
import { deleteProduct, errorResponse, updateProduct } from "@/lib/server/adminCatalog";

function refreshStore(id) {
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${id}`);
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
    await updateProduct(id, body);
    refreshStore(id);
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
    await deleteProduct(id);
    refreshStore(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}