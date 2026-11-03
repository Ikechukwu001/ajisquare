import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/adminAuthService";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/server/adminAuth";

export async function POST(request) {
  let idToken;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const auth = adminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    if (decoded.admin !== true) {
      return NextResponse.json({ error: "This account does not have admin access." }, { status: 403 });
    }

    // Only accept a fresh sign-in (within the last 5 minutes)
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } catch (err) {
    console.error("Admin session error:", err.message);
    return NextResponse.json({ error: "Could not sign you in. Please try again." }, { status: 401 });
  }
}