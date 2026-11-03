import Link from "next/link";
import Container from "@/components/ui/Container";
import LogoutButton from "@/components/admin/LogoutButton";
import { requireAdmin } from "@/lib/server/adminAuth";
import { countNewBulkRequests } from "@/lib/server/bulkRequests";
import { siteConfig } from "@/lib/config/site";
import {
  ArrowUpRight,
  Boxes,
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingBag,
  Store,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const navigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/admin/bulk-requests",
    label: "Bulk requests",
    icon: Boxes,
    badgeKey: "newRequests",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Shapes,
  },
];

export default async function AdminLayout({ children }) {
  const user = await requireAdmin();

  // A failed count should never break the admin area
  const newRequests = await countNewBulkRequests().catch(() => 0);
  const badges = { newRequests };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#292721]">
      {/* Main admin header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#25241f] text-white">
        <Container>
          <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-x-5 gap-y-3 py-3">
            {/* Brand */}
            <Link
              href="/admin"
              className="group flex shrink-0 items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center border border-[#b99a66]/50 font-serif text-lg text-[#d9bd88] transition-colors group-hover:border-[#d9bd88]">
                {siteConfig.name.charAt(0).toUpperCase()}
              </span>

              <span className="flex flex-col">
                <span className="font-serif text-base tracking-wide sm:text-lg">
                  {siteConfig.name}
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.24em] text-[#c5aa79]">
                  Administration
                </span>
              </span>
            </Link>

            {/* Account actions */}
            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2 lg:flex">
                <ShieldCheck
                  size={16}
                  strokeWidth={1.4}
                  className="text-[#d9bd88]"
                />
                <span className="max-w-[190px] truncate text-xs text-white/65">
                  {user.email}
                </span>
              </div>

              <Link
                href="/"
                className="group flex items-center gap-1.5 text-xs text-white/75 transition-colors hover:text-[#e2c997] sm:text-sm"
              >
                <Store size={15} strokeWidth={1.5} />
                <span>View store</span>
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <LogoutButton />
            </div>
          </div>
        </Container>

        {/* Admin navigation */}
        <div className="border-t border-white/[0.08]">
          <Container>
            <nav
              className="flex items-center gap-1 overflow-x-auto"
              aria-label="Admin navigation"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const badge = item.badgeKey ? badges[item.badgeKey] : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-xs text-white/55 transition-colors hover:text-white sm:px-5 sm:text-sm"
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.5}
                      className="transition-colors group-hover:text-[#d9bd88]"
                    />
                    <span>{item.label}</span>

                    {badge > 0 && (
                      <span
                        className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d9bd88] px-1 text-[10px] font-medium text-[#25241f]"
                        aria-label={`${badge} new`}
                      >
                        {badge}
                      </span>
                    )}

                    <span className="absolute inset-x-3 bottom-0 h-px origin-center scale-x-0 bg-[#d9bd88] transition-transform duration-200 group-hover:scale-x-100 sm:inset-x-5" />
                  </Link>
                );
              })}
            </nav>
          </Container>
        </div>
      </header>

      {/* Workspace context strip */}
      <div className="border-b border-[#292721]/[0.06] bg-white/60">
        <Container className="flex min-h-11 items-center justify-between gap-3">
          <p className="truncate text-[10px] uppercase tracking-[0.16em] text-[#777168] sm:text-[11px] sm:tracking-[0.2em]">
            {siteConfig.name}
            <span className="mx-2 text-[#b99a66]">/</span>
            Private workspace
          </p>

          <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#777168]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9b7a48]" />
            Admin
          </span>
        </Container>
      </div>

      {/* Page content */}
      <main className="min-h-[calc(100vh-120px)]">{children}</main>
    </div>
  );
}