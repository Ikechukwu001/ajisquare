"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartSync from "@/components/cart/CartSync";

export default function StoreChrome({ children, footer }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <CartSync />
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}