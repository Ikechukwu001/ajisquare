import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminUser } from "@/lib/server/adminAuth";
import { siteConfig } from "@/lib/config/site";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in as an admin? Go straight to the dashboard
  if (await getAdminUser()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-accent">{siteConfig.name}</p>
        <h1 className="mt-2 text-center font-serif text-3xl">Admin login</h1>

        <div className="mt-8 border border-border bg-white p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted hover:text-accent">Back to store</Link>
        </p>
      </div>
    </div>
  );
}