// Make an existing Firebase user an admin:
//   node --env-file=.env.local scripts/make-admin.mjs owner@example.com
// Remove admin access:
//   node --env-file=.env.local scripts/make-admin.mjs owner@example.com remove

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin variables. Run with: node --env-file=.env.local scripts/make-admin.mjs <email>");
  process.exit(1);
}

const email = process.argv[2];
const remove = process.argv[3] === "remove";

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/make-admin.mjs <email> [remove]");
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, remove ? null : { admin: true });
  console.log(
    remove
      ? `${email} is no longer an admin.`
      : `${email} is now an admin. They must sign in again for it to take effect.`
  );
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}