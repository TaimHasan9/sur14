"use client";
import { useEffect, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { appleExclusive } from "@/mtg/data/realHome";
import { formatBDT } from "@/mtg/data/catalog";
import { useShop } from "@/mtg/store/shop";

/* "Apple Exclusive 2026" — the live site's pre-order block for the upcoming
   iPhone 18 / AirPods 5 / Watch line-up, with a launch countdown. */
const LAUNCH = new Date();
LAUNCH.setDate(LAUNCH.getDate() + 9);
LAUNCH.setHours(20, 0, 0, 0);

function useCountdown(target: Date) {
  const [left, setLeft] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(target.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.max(0, Math.floor(left / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function AppleExclusive() {
  const { add } = useShop();
  const c = useCountdown(LAUNCH);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-14">
      <div className="rounded-3xl bg-white border border-gray-200 p-5 sm:p-8 text-[#1d1d1f] relative overflow-hidden shadow-[0_2px_18px_rgba(0,0,0,0.05)]">
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
          <div>
            <p className="text-[12px] font-bold tracking-[0.25em] text-[#F27F20] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/></svg>
              APPLE EXCLUSIVE
            </p>
            <h2 className="text-[34px] sm:text-[52px] font-extrabold leading-none">
              Apple Exclusive{" "}
              <span className="bg-gradient-to-r from-[#F27F20] via-[#e8632c] to-[#8b5cf6] bg-clip-text text-transparent">2026</span>
            </h2>
            <p className="text-[14px] text-gray-500 mt-2">Pre-book the new iPhone 18 line-up, AirPods 5 &amp; Apple Watch Series 12 with only ৳10,000 advance.</p>
          </div>

          {/* countdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {[
              [c.d, "Days"],
              [c.h, "Hours"],
              [c.m, "Min"],
              [c.s, "Sec"],
            ].map(([v, l]) => (
              <div key={l} className="bg-[#f7f8fa] rounded-xl px-3 sm:px-4 py-2 text-center min-w-[62px] border border-gray-200">
                <p className="text-[22px] sm:text-[28px] font-extrabold tabular-nums leading-none">{pad(v as number)}</p>
                <p className="text-[10px] text-gray-500 mt-1 tracking-wide">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {appleExclusive.map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden text-[#1d1d1f] flex flex-col border border-gray-100 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="relative w-full" style={{ paddingBottom: "90%" }}>
                <Img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover p-2 group-hover:scale-[1.04] transition-transform duration-500" />
                <span className="absolute top-2 left-2 bg-[#1d1d1f] text-white text-[9px] font-bold px-2 py-1 rounded-full tracking-wide">PRE-ORDER</span>
              </div>
              <div className="px-3 pb-3 flex flex-col flex-1">
                <h3 className="text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-2 min-h-[36px] group-hover:text-[#F27F20] transition-colors">{p.name}</h3>
                <p className="text-[11px] text-gray-500 mt-1">Booking amount</p>
                <p className="text-[15px] font-extrabold">{formatBDT(p.price)}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    add(p.slug);
                  }}
                  className="mt-2 w-full h-8 rounded-lg bg-[#F27F20] hover:bg-[#d96d12] text-white text-[12px] font-bold transition"
                >
                  Pre Order
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
