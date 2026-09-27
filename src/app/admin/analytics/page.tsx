"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Eye, MousePointerClick, ShoppingCart, CreditCard, Banknote, LogIn, Search, Image as ImageIcon } from "lucide-react";
import { formatBDT } from "@/lib/utils";

type Analytics = {
  days: number;
  sessions: number;
  byType: Record<string, number>;
  revenue: number;
  ordersCount: number;
  funnel: { productViews: number; addToCart: number; checkoutStart: number; purchases: number };
  topViewed: Array<{ slug: string | null; views: number; visitors: number }>;
  topClicks: Array<{ label: string | null; c: number }>;
  topSearches: Array<{ label: string | null; c: number }>;
  recentLogins: Array<{ label: string | null; createdAt: string; sessionId: string }>;
  topBuyers: Array<{ phone: string; name: string; ordersCount: number; items: number; spent: number }>;
  recentEvents: Array<{ type: string; label: string | null; path: string | null; productSlug: string | null; createdAt: string }>;
  imgHealth: Array<{ type: string; c: number }>;
  imgErrors: Array<{ src: string | null; c: number }>;
  daily: Array<{ day: string; views: number; carts: number }>;
  topPages: Array<{ path: string | null; c: number }>;
  devices: Array<{ device: string | null; c: number }>;
};

const TYPE_LABEL: Record<string, string> = {
  page_view: "👁️ Page view", product_view: "📱 Product view", click: "🖱️ Click", search: "🔍 Search",
  add_to_cart: "🛒 Add to cart", remove_from_cart: "🗑️ Remove", checkout_start: "💳 Checkout start",
  purchase: "✅ Purchase", login: "🔑 Login", register: "📝 Register", logout: "🚪 Logout",
  wishlist: "❤️ Wishlist", compare: "⚖️ Compare", img_impression: "🖼️ Img seen", img_load: "🖼️ Img loaded", img_error: "⚠️ Img error",
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [a, setA] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setA)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !a) return <p className="py-16 text-center text-slate-400">Loading analytics...</p>;

  const t = (k: string) => a.byType[k] ?? 0;
  const cards = [
    { icon: <Users className="h-5 w-5" />, label: "Visitors", value: String(a.sessions), bg: "from-blue-500 to-indigo-600" },
    { icon: <Eye className="h-5 w-5" />, label: "Page views", value: String(t("page_view")), bg: "from-slate-500 to-slate-700" },
    { icon: <Eye className="h-5 w-5" />, label: "Product views", value: String(t("product_view")), bg: "from-violet-500 to-purple-600" },
    { icon: <MousePointerClick className="h-5 w-5" />, label: "Button clicks", value: String(t("click")), bg: "from-pink-500 to-rose-600" },
    { icon: <ShoppingCart className="h-5 w-5" />, label: "Add to cart", value: String(t("add_to_cart")), bg: "from-amber-500 to-orange-600" },
    { icon: <CreditCard className="h-5 w-5" />, label: "Checkout starts", value: String(t("checkout_start")), bg: "from-cyan-500 to-blue-600" },
    { icon: <Banknote className="h-5 w-5" />, label: "Orders / Revenue", value: `${a.ordersCount} / ${formatBDT(a.revenue)}`, bg: "from-emerald-500 to-teal-600" },
    { icon: <LogIn className="h-5 w-5" />, label: "Logins / Registers", value: `${t("login")} / ${t("register")}`, bg: "from-orange-500 to-red-600" },
  ];

  const funnelMax = Math.max(1, a.funnel.productViews);
  const funnelSteps = [
    ["Product views", a.funnel.productViews],
    ["Add to cart", a.funnel.addToCart],
    ["Checkout start", a.funnel.checkoutStart],
    ["Purchases", a.funnel.purchases],
  ] as const;

  const maxDaily = Math.max(1, ...a.daily.map((d) => d.views));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black">📊 Site Analytics</h2>
        <div className="ml-auto flex gap-1.5">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`rounded-lg px-3 py-1.5 text-xs font-black ${days === d ? "bg-slate-900 text-white" : "border bg-white"}`}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-2xl bg-gradient-to-br p-4 text-white ${c.bg}`}>
            <span className="opacity-80">{c.icon}</span>
            <p className="mt-2 truncate text-xl font-black">{c.value}</p>
            <p className="text-xs font-bold opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* funnel + daily */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-black">🛒 কেনা-ফানেল (View → Cart → Checkout → Buy)</h3>
          <div className="mt-4 space-y-2.5">
            {funnelSteps.map(([label, v]) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-bold"><span>{label}</span><span>{v} ({Math.round((v / funnelMax) * 100)}%)</span></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${Math.max(2, (v / funnelMax) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Conversion: {a.funnel.productViews > 0 ? ((a.funnel.purchases / a.funnel.productViews) * 100).toFixed(1) : 0}% (view → buy) · Cart rate: {a.funnel.productViews > 0 ? ((a.funnel.addToCart / a.funnel.productViews) * 100).toFixed(1) : 0}%
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {a.devices.map((d) => (
              <span key={d.device} className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold">{d.device === "mobile" ? "📱" : d.device === "tablet" ? "📟" : "🖥️"} {d.device}: {d.c}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-black">📈 Last 14 days (views vs carts)</h3>
          <div className="mt-4 flex h-40 items-end gap-1">
            {a.daily.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
            {a.daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.views} views, ${d.carts} carts`}>
                <div className="flex w-full flex-1 flex-col justify-end gap-0.5">
                  <div className="w-full rounded-sm bg-orange-400" style={{ height: `${(d.carts / maxDaily) * 100}%`, minHeight: d.carts ? 3 : 0 }} />
                  <div className="w-full rounded-sm bg-slate-800" style={{ height: `${(d.views / maxDaily) * 100}%`, minHeight: d.views ? 3 : 0 }} />
                </div>
                <span className="text-[9px] font-bold text-slate-400">{d.day.slice(3)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500"><span className="font-bold text-slate-800">■</span> views <span className="font-bold text-orange-500">■</span> add-to-cart</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* top viewed products */}
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-black">🔥 Most viewed products (koita product deklo)</h3>
          <div className="mt-3 space-y-1.5">
            {a.topViewed.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-sm">
                <span className="w-6 font-black text-slate-400">#{i + 1}</span>
                <Link href={`/product/${p.slug}`} className="min-w-0 flex-1 truncate font-bold text-blue-700 hover:underline">{p.slug}</Link>
                <span className="text-xs font-bold text-slate-500">{p.visitors} visitors</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-black text-violet-700">{p.views} views</span>
              </div>
            ))}
            {a.topViewed.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No product views yet</p>}
          </div>
        </div>

        {/* top buyers */}
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-black">🏆 Top buyers (ke koita kinlo)</h3>
          <div className="mt-3 space-y-1.5">
            {a.topBuyers.map((b, i) => (
              <div key={b.phone} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-sm">
                <span className="w-6 font-black text-slate-400">#{i + 1}</span>
                <span className="min-w-0 flex-1"><b className="block truncate">{b.name}</b><span className="text-xs text-slate-500">📞 {b.phone} · {b.ordersCount} orders · {b.items} items</span></span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">{formatBDT(b.spent)}</span>
              </div>
            ))}
            {a.topBuyers.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No purchases yet</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* top clicks */}
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-black">🖱️ Most clicked buttons (kon button chaplo)</h3>
          <div className="mt-3 space-y-1.5">
            {a.topClicks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold">{c.label || "(no label)"}</span>
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-black text-pink-700">{c.c}×</span>
              </div>
            ))}
            {a.topClicks.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No clicks yet</p>}
          </div>
          {a.topSearches.length > 0 && (
            <>
              <h3 className="mt-5 flex items-center gap-1 font-black"><Search className="h-4 w-4" /> Top searches</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.topSearches.map((s, i) => (
                  <span key={i} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">🔍 {s.label} ({s.c})</span>
                ))}
              </div>
            </>
          )}
          {a.topPages.length > 0 && (
            <>
              <h3 className="mt-5 font-black">📄 Top pages</h3>
              <div className="mt-2 space-y-1">
                {a.topPages.slice(0, 6).map((p, i) => (
                  <p key={i} className="truncate text-xs"><span className="font-bold text-slate-500">{p.c}×</span> <span className="font-mono">{p.path}</span></p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* logins + img health */}
        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-black">🔑 Recent logins / registers (ke login korlo)</h3>
            <div className="mt-3 space-y-1.5">
              {a.recentLogins.map((l, i) => (
                <p key={i} className="truncate rounded-xl bg-slate-50 p-2.5 text-sm">
                  <b>{l.label}</b> <span className="text-xs text-slate-500">· {new Date(l.createdAt).toLocaleString("en-GB")}</span>
                </p>
              ))}
              {a.recentLogins.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No logins yet</p>}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="flex items-center gap-1.5 font-black"><ImageIcon className="h-4 w-4" /> 🖼️ Image health (img tracking)</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {a.imgHealth.map((h) => (
                <span key={h.type} className={`rounded-lg px-2.5 py-1 text-xs font-black ${h.type === "img_error" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                  {TYPE_LABEL[h.type] || h.type}: {h.c}
                </span>
              ))}
              {a.imgHealth.length === 0 && <p className="text-sm text-slate-400">No image events yet</p>}
            </div>
            {a.imgErrors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-black text-red-600">⚠️ Broken images (fix these!):</p>
                {a.imgErrors.map((e, i) => (
                  <p key={i} className="truncate rounded-lg bg-red-50 p-2 font-mono text-[11px] text-red-700">{e.src} ({e.c}×)</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* live feed */}
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-black">⚡ Live activity feed</h3>
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {a.recentEvents.map((e, i) => (
            <p key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-black text-white">{TYPE_LABEL[e.type] || e.type}</span>
              {e.label && <span className="max-w-[320px] truncate font-semibold">{e.label}</span>}
              {e.productSlug && <Link href={`/product/${e.productSlug}`} className="font-mono text-blue-600 hover:underline">/{e.productSlug.slice(0, 40)}</Link>}
              {e.path && !e.productSlug && <span className="font-mono text-slate-500">{e.path.slice(0, 60)}</span>}
              <span className="ml-auto text-slate-400">{new Date(e.createdAt).toLocaleString("en-GB")}</span>
            </p>
          ))}
          {a.recentEvents.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No activity yet — browse the site and come back!</p>}
        </div>
      </div>
    </div>
  );
}
