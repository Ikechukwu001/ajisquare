import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/adminAuthService";

export const SESSION_COOKIE = "fh_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 days

// Returns the verified admin user, or null. Use this in API routes (respond 401 when null).
export async function getAdminUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    // true = also check the session has not been revoked
    const decoded = await adminAuth().verifySessionCookie(token, true);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

// Use this at the top of every admin page. Sends visitors to the login page when not an admin.
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}