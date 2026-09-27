"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, ShoppingBag, Package, Users, AlertTriangle, Flame, History } from "lucide-react";
import { formatBDT, formatDateTime, orderStatusBn } from "@/lib/utils";

type Stats = {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  categories?: number;
  reviews?: number;
  lowStock: Array<{ id: string; nameBn: string | null; name: string; stock: number; emoji: string | null }>;
  recentOrders: Array<{ orderNumber: string; customerName: string; total: number; orderStatus: string; createdAt: string }>;
  topProducts: Array<{ nameBn: string | null; name: string; totalSold: number; price: number; emoji: string | null }>;
  statusGroups: Array<{ status: string; c: number }>;
  recentLogs?: Array<{ id: string; actorName: string; actorRole: string; action: string; summary: string; createdAt: string }>;
};

export default function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setS)
      .catch(() => {});
  }, []);

  if (!s) return <p className="py-16 text-center text-slate-400">লোড হচ্ছে...</p>;

  const cards = [
    { icon: <Banknote className="h-6 w-6" />, label: "মোট রেভিনিউ", value: formatBDT(s.revenue), bg: "from-emerald-500 to-teal-600" },
    { icon: <ShoppingBag className="h-6 w-6" />, label: "মোট অর্ডার", value: String(s.orders), bg: "from-blue-500 to-indigo-600" },
    { icon: <Package className="h-6 w-6" />, label: "মোট পণ্য", value: String(s.products), bg: "from-amber-500 to-orange-600" },
    { icon: <Users className="h-6 w-6" />, label: "মোট ইউজার", value: String(s.users), bg: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg ${c.bg}`}>
            <span className="opacity-80">{c.icon}</span>
            <p className="mt-3 text-2xl font-black">{c.value}</p>
            <p className="text-xs font-bold opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* status overview */}
      <div className="rounded-3xl border bg-white p-5">
        <h3 className="font-black">📊 অর্ডার স্ট্যাটাস</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.statusGroups.map((g) => (
            <Link
              key={g.status}
              href={`/admin/orders?status=${g.status}`}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black hover:bg-emerald-100"
            >
              {orderStatusBn(g.status)}: <span className="text-emerald-700">{g.c}</span>
            </Link>
          ))}
          {s.statusGroups.length === 0 && <p className="text-sm text-slate-400">এখনো অর্ডার নেই</p>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recent orders */}
        <div className="rounded-3xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black">🧾 সাম্প্রতিক অর্ডার</h3>
            <Link href="/admin/orders" className="text-xs font-black text-emerald-700 hover:underline">
              সব দেখুন
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {s.recentOrders.map((o) => (
              <div key={o.orderNumber} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-bold">
                  {o.orderNumber}
                  <span className="block truncate text-xs font-normal text-slate-500">
                    {o.customerName} • {formatDateTime(o.createdAt)}
                  </span>
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-black">{orderStatusBn(o.orderStatus)}</span>
                <span className="font-black text-emerald-700">{formatBDT(o.total)}</span>
              </div>
            ))}
            {s.recentOrders.length === 0 && <p className="py-6 text-center text-sm text-slate-400">অর্ডার নেই</p>}
          </div>
        </div>

        <div className="space-y-5">
          {/* low stock */}
          <div className="rounded-3xl border border-red-100 bg-white p-5">
            <h3 className="flex items-center gap-1.5 font-black text-red-700">
              <AlertTriangle className="h-4 w-4" /> স্টক কম (&lt;২০)
            </h3>
            <div className="mt-3 space-y-2">
              {s.lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-sm">
                  <span className="text-xl">{p.emoji || "📦"}</span>
                  <span className="flex-1 truncate font-bold">{p.nameBn || p.name}</span>
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">{p.stock}টি</span>
                </div>
              ))}
              {s.lowStock.length === 0 && <p className="py-4 text-center text-sm text-slate-400">সব পণ্যের স্টক ঠিক আছে ✅</p>}
            </div>
          </div>

          {/* top products */}
          <div className="rounded-3xl border bg-white p-5">
            <h3 className="flex items-center gap-1.5 font-black">
              <Flame className="h-4 w-4 text-orange-500" /> টপ বিক্রিত পণ্য
            </h3>
            <div className="mt-3 space-y-2">
              {s.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-sm">
                  <span className="font-black text-slate-400">#{i + 1}</span>
                  <span className="text-xl">{p.emoji || "📦"}</span>
                  <span className="flex-1 truncate font-bold">{p.nameBn || p.name}</span>
                  <span className="text-xs font-black text-emerald-700">{p.totalSold} বিক্রি</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Activity Logs */}
      <div className="rounded-3xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-black">
            <History className="h-4 w-4 text-indigo-600" /> সাম্প্রতিক অ্যাডমিন অ্যাক্টিভিটি লগ (Audit Trail)
          </h3>
          <Link href="/admin/more" className="text-xs font-black text-emerald-700 hover:underline">
            সব লগ দেখুন
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {(s.recentLogs || []).map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
              <div>
                <span className="rounded bg-slate-900 px-2 py-0.5 font-black text-white mr-2">{l.action}</span>
                <span className="font-bold text-slate-800">{l.summary}</span>
              </div>
              <span className="text-slate-500">
                by <b>{l.actorName}</b> ({l.actorRole}) • {formatDateTime(l.createdAt)}
              </span>
            </div>
          ))}
          {(!s.recentLogs || s.recentLogs.length === 0) && (
            <p className="py-4 text-center text-sm text-slate-400">এখনো কোনো অ্যাক্টিভিটি লগ নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}
