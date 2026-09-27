"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, Layers, BarChart3, Store, Shield } from "lucide-react";

const STAFF_ROLES = new Set(["super_admin", "admin", "manager", "staff"]);

const LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/orders", label: "অর্ডার • কুরিয়ার • রিফান্ড", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/products", label: "পণ্য • ছবি আপলোড", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/more", label: "ক্যাটাগরি • কুপন • রিভিউ • ইউজার • লগ", icon: <Layers className="h-4 w-4" /> },
  { href: "/admin/analytics", label: "অ্যানালিটিক্স", icon: <BarChart3 className="h-4 w-4" /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user && STAFF_ROLES.has(d.user.role)) {
          setAdminUser(d.user);
          setOk(true);
        } else {
          router.push("/account");
        }
      })
      .catch(() => router.push("/account"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main className="py-24 text-center font-bold text-slate-400">যাচাই হচ্ছে...</main>;
  if (!ok) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-900 p-5 text-white">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">🛡️ Admin Control Center</h1>
            {adminUser && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-xs font-black uppercase text-emerald-300">
                <Shield className="h-3 w-3" /> {adminUser.role.replace("_", " ")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mr Tom Gadgets Management · Logged in as {adminUser?.name} ({adminUser?.email})
          </p>
        </div>
        <Link href="/" className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
          <Store className="h-4 w-4" /> শপ দেখুন
        </Link>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black ${
              pathname === l.href ? "bg-emerald-600 text-white shadow" : "border bg-white hover:border-emerald-400"
            }`}
          >
            {l.icon} {l.label}
          </Link>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
