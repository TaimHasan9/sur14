"use client";

import { useEffect, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { allProducts, formatBDT } from "@/mtg/data/catalog";

/** Records the visited product slug into localStorage */
export function RecordView({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = "ag_recent";
      const list: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [slug]);
  return null;
}

/** Shows the last viewed products (like applegadgetsbd "Recently Viewed") */
export default function RecentlyViewed({ current }: { current: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("ag_recent") || "[]");
      setSlugs(list.filter((s) => s !== current).slice(0, 4));
    } catch {
      /* ignore */
    }
  }, [current]);

  const items = slugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (items.length === 0) return null;

  return (
    <aside>
      <h3 className="text-[22px] font-extrabold text-[#16243d] mb-4">Recently Viewed</h3>
      <div className="space-y-3">
        {items.map((r) => {
          const off = r.oldPrice ? r.oldPrice - r.price : 0;
          return (
            <Link key={r.id} href={`/product/${r.slug}`} className="flex gap-3 bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition">
              <span className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gray-50">
                <Img src={r.img} alt={r.name} className="w-full h-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-[#1d1d1f] truncate">{r.name}</span>
                <span className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] font-extrabold text-[#1d1d1f]">{formatBDT(r.price)}</span>
                  {r.oldPrice && <span className="text-[12px] text-gray-400 line-through">{formatBDT(r.oldPrice)}</span>}
                </span>
                {r.oldPrice && (
                  <span className="inline-block mt-1 text-[10.5px] font-bold text-[#39B667] bg-[#39B667]/10 px-1.5 py-0.5 rounded">
                    ৳ {off.toLocaleString("en-US")} OFF
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
