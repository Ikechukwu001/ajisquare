import "server-only";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

const PLACEHOLDER_IMAGE = "/products/placeholder.svg";

export class ValidationError extends Error {
  constructor(message, fieldErrors = {}, status = 400) {
    super(message);
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

export function errorResponse(err) {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message, fieldErrors: err.fieldErrors }, { status: err.status });
  }
  console.error("Admin catalog error:", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/* ---------- helpers ---------- */

const isAlreadyExists = (err) => err?.code === 6 || /ALREADY_EXISTS/.test(String(err?.message));
const isValidId = (id) => typeof id === "string" && /^[\w-]{1,100}$/.test(id);

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Whole numbers only. Returns null when the value is blank, negative, or not a whole number.
function toInt(value) {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : null;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

function isImagePath(value) {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    !value.includes("..") &&
    /^\/[A-Za-z0-9_\-./]+\.(jpe?g|png|webp|avif|gif|svg)$/i.test(value)
  );
}

// Accepts an array or a comma/newline separated string. Returns null when it breaks the limits.
function parseList(value, { max, maxLen }) {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\n]/) : [];
  const items = [...new Set(raw.map(clean).filter(Boolean))];
  if (items.length > max || items.some((item) => item.length > maxLen)) return null;
  return items;
}

async function getCategoryIds() {
  const snap = await adminDb().collection("categories").get();
  return snap.docs.map((d) => d.id);
}

/* ---------- products ---------- */

function validateProduct(input = {}, categoryIds) {
  const errors = {};

  const name = clean(input.name);
  if (name.length < 2 || name.length > 120) errors.name = "Enter a product name (2 to 120 characters).";

  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length > 2000) errors.description = "Description is too long (max 2000 characters).";

  const price = toInt(input.price);
  if (price === null || price < 1 || price > 100000000) {
    errors.price = "Enter the price as a whole number of naira, e.g. 45000.";
  }

  const image = (typeof input.image === "string" ? input.image.trim() : "") || PLACEHOLDER_IMAGE;
  if (!isImagePath(image)) {
    errors.image = "Use a path like /products/black-senator.jpg (starts with /, ends in .jpg, .png, .webp, etc).";
  }

  const extraImages = parseList(input.images, { max: 8, maxLen: 200 });
  if (extraImages === null || !extraImages.every(isImagePath)) {
    errors.images = "Up to 8 image paths, one per line, each like /products/photo.jpg.";
  }

  const categoryId = typeof input.categoryId === "string" ? input.categoryId : "";
  if (!categoryIds.includes(categoryId)) errors.categoryId = "Choose a category.";

  const sizes = parseList(input.sizes, { max: 20, maxLen: 30 });
  if (sizes === null) errors.sizes = "Up to 20 sizes, separated by commas.";

  const colors = parseList(input.colors, { max: 20, maxLen: 30 });
  if (colors === null) errors.colors = "Up to 20 colors, separated by commas.";

  const stock = toInt(input.stock);
  if (stock === null || stock > 100000) errors.stock = "Enter the stock as a whole number (0 or more).";

  return {
    errors,
    values: {
      name,
      description,
      price,
      image,
      images: extraImages || [],
      categoryId,
      sizes: sizes || [],
      colors: colors || [],
      stock,
      featured: input.featured === true,
      available: input.available === true,
    },
  };
}

export async function createProduct(input) {
  const { errors, values } = validateProduct(input, await getCategoryIds());
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);

  const db = adminDb();
  const base = slugify(values.name) || "product";
  const now = Timestamp.now();

  for (let i = 0; i < 20; i++) {
    const id = i === 0 ? base : `${base}-${i + 1}`;
    try {
      // create() fails if the id exists, so a product is never overwritten
      await db.collection("products").doc(id).create({ ...values, slug: id, createdAt: now, updatedAt: now });
      return id;
    } catch (err) {
      if (isAlreadyExists(err)) continue;
      throw err;
    }
  }
  throw new ValidationError("Could not create a unique link for this product. Try a different name.", {}, 409);
}

export async function updateProduct(id, input) {
  if (!isValidId(id)) throw new ValidationError("Product not found.", {}, 404);

  const ref = adminDb().collection("products").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ValidationError("Product not found.", {}, 404);

  const { errors, values } = validateProduct(input, await getCategoryIds());
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);

  // The link (id) never changes after creation. Editing also un-marks seeded sample data,
  // so the sample cleanup script can't delete a product the owner has taken over.
  await ref.update({ ...values, isSample: FieldValue.delete(), updatedAt: Timestamp.now() });
}

export async function deleteProduct(id) {
  if (!isValidId(id)) throw new ValidationError("Product not found.", {}, 404);

  const ref = adminDb().collection("products").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ValidationError("Product not found.", {}, 404);

  // Past orders keep their own copy of name and price, so they are not affected
  await ref.delete();
}

/* ---------- categories ---------- */

function validateCategory(input = {}) {
  const errors = {};

  const name = clean(input.name);
  if (name.length < 2 || name.length > 40) errors.name = "Enter a category name (2 to 40 characters).";

  const image = (typeof input.image === "string" ? input.image.trim() : "") || PLACEHOLDER_IMAGE;
  if (!isImagePath(image)) errors.image = "Use a path like /products/men.jpg, or leave it blank.";

  const order = toInt(input.order);
  if (order === null || order > 1000) errors.order = "Enter a whole number (0 or more) for the display order.";

  return { errors, values: { name, image, order } };
}

export async function createCategory(input) {
  const { errors, values } = validateCategory(input);
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);

  const db = adminDb();
  const base = slugify(values.name) || "category";

  for (let i = 0; i < 20; i++) {
    const id = i === 0 ? base : `${base}-${i + 1}`;
    try {
      await db.collection("categories").doc(id).create({ ...values, slug: id });
      return id;
    } catch (err) {
      if (isAlreadyExists(err)) continue;
      throw err;
    }
  }
  throw new ValidationError("Could not create this category. Try a different name.", {}, 409);
}

export async function updateCategory(id, input) {
  if (!isValidId(id)) throw new ValidationError("Category not found.", {}, 404);

  const ref = adminDb().collection("categories").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ValidationError("Category not found.", {}, 404);

  const { errors, values } = validateCategory(input);
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);

  await ref.update({ ...values, isSample: FieldValue.delete() });
}

export async function deleteCategory(id) {
  if (!isValidId(id)) throw new ValidationError("Category not found.", {}, 404);

  const db = adminDb();
  const ref = db.collection("categories").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ValidationError("Category not found.", {}, 404);

  const inUse = await db.collection("products").where("categoryId", "==", id).limit(1).get();
  if (!inUse.empty) {
    throw new ValidationError(
      "Some products still use this category. Move or delete those products first.",
      {},
      409
    );
  }

  await ref.delete();
}