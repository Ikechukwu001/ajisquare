import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Hosting dashboards often keep the quotes you paste around a value,
// and may store line breaks as the two characters \n
function stripQuotes(value) {
  let v = String(value || "").trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

export function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = stripQuotes(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = stripQuotes(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = stripQuotes(process.env.FIREBASE_ADMIN_PRIVATE_KEY).replace(/\\n/g, "\n");

  const missing = [];
  if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");

  if (missing.length) {
    throw new Error(
      `Firebase Admin is missing: ${missing.join(", ")}. Add them in your hosting dashboard (Environment Variables), then redeploy.`
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// Database only. The login (auth) library is kept in its own file so public pages never load it.
export const adminDb = () => getFirestore(getAdminApp());