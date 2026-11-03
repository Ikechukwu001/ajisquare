// Usage:
//   node --env-file=.env.local scripts/seed.mjs          (add sample data)
//   node --env-file=.env.local scripts/seed.mjs remove   (delete sample data)

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin variables. Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

const PLACEHOLDER = "/products/placeholder.svg";

const categories = [
  { slug: "men", name: "Men", order: 1 },
  { slug: "women", name: "Women", order: 2 },
  { slug: "accessories", name: "Accessories", order: 3 },
].map((c) => ({ ...c, image: PLACEHOLDER, isSample: true }));

const products = [
  {
    slug: "classic-senator-set",
    name: "Classic Senator Set",
    description: "A tailored two-piece senator set with clean stitching and a comfortable fit.",
    price: 45000,
    categoryId: "men",
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Navy"],
    stock: 12,
    featured: true,
    available: true,
  },
  {
    slug: "ankara-wrap-dress",
    name: "Ankara Wrap Dress",
    description: "A flattering wrap dress made from vibrant Ankara fabric.",
    price: 38000,
    categoryId: "women",
    sizes: ["S", "M", "L"],
    colors: ["Multicolor"],
    stock: 8,
    featured: true,
    available: true,
  },
  {
    slug: "tailored-linen-shirt",
    name: "Tailored Linen Shirt",
    description: "A breathable linen shirt for work or weekends.",
    price: 22000,
    categoryId: "men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Sky Blue"],
    stock: 20,
    featured: false,
    available: true,
  },
  {
    slug: "embroidered-kaftan",
    name: "Embroidered Kaftan",
    description: "A flowing kaftan with hand-finished embroidery around the neckline.",
    price: 35000,
    categoryId: "women",
    sizes: ["M", "L", "XL"],
    colors: ["Cream", "Emerald"],
    stock: 0, // deliberately out of stock, to test the out-of-stock UI
    featured: true,
    available: true,
  },
  {
    slug: "leather-belt",
    name: "Leather Belt",
    description: "A classic leather belt with a brushed metal buckle.",
    price: 12000,
    categoryId: "accessories",
    sizes: [],
    colors: ["Brown", "Black"],
    stock: 30,
    featured: false,
    available: true,
  },
  {
    slug: "beaded-necklace",
    name: "Beaded Necklace",
    description: "A handcrafted beaded necklace that pairs with any outfit.",
    price: 9500,
    categoryId: "accessories",
    sizes: [],
    colors: ["Gold"],
    stock: 15,
    featured: false,
    available: true,
  },
].map((p) => ({ ...p, image: PLACEHOLDER, images: [], isSample: true }));

async function seed() {
  const batch = db.batch();
  const now = Timestamp.now();

  for (const c of categories) {
    batch.set(db.collection("categories").doc(c.slug), c);
  }
  for (const p of products) {
    batch.set(db.collection("products").doc(p.slug), { ...p, createdAt: now, updatedAt: now });
  }

  await batch.commit();
  console.log(`Added ${categories.length} categories and ${products.length} products.`);
}

async function removeSamples() {
  let removed = 0;
  for (const name of ["products", "categories"]) {
    const snap = await db.collection(name).where("isSample", "==", true).get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    removed += snap.size;
  }
  console.log(`Removed ${removed} sample documents.`);
}

const mode = process.argv[2];
(mode === "remove" ? removeSamples() : seed()).catch((err) => {
  console.error(err);
  process.exit(1);
});