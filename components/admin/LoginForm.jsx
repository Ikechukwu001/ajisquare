"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase/client";

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    default:
      return "Could not sign you in. Please try again.";
  }
}

const inputClass =
  "w-full border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await credential.user.getIdToken(true);

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));

      // The server cookie is what protects /admin, so the browser-side Firebase session isn't needed
      await signOut(auth).catch(() => {});

      if (!res.ok) {
        setError(data.error || "Could not sign you in. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(friendlyError(err?.code));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 bg-foreground py-3 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}