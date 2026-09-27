"use client";

import { useRef, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { formatBDT, type P, type SectionDef } from "@/mtg/data/catalog";
import { useShop } from "@/mtg/store/shop";

/* Home carousel card — 1:1 with applegadgetsbd.com:
   rounded-3xl card, soft shadow, 4:3 photo, 2-line name, bold price,
   strike + green OFF pill, "Shop Now" (turns orange on hover) + round cart button */
function DealCard({ p }: { p: P }) {
  const off = p.oldPrice ? p.oldPrice - p.price : 0;
  const { add } = useShop();
  const pre = p.status === "pre-order";
  return (
    <Link
      href={`/product/${p.slug}`}
      className="ag-card w-[72%] sm:w-[46%] lg:w-[31.5%] xl:w-[calc(25%-12px)] shrink-0 bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col group shadow-[0_2px_14px_rgba(0,0,0,0.06)]"
    >
      <div className="relative w-full" style={{ paddingBottom: "76.25%" }}>
        <Img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover px-2 pt-2 bg-white rounded-t-3xl group-hover:scale-[1.03] transition-transform duration-500" />
        {pre && <span className="absolute top-3 left-3 bg-[#1d1d1f] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">PRE-ORDER</span>}
        {!pre && off > 0 && <span className="absolute top-3 left-3 bg-[#FD5B67] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">SAVE ৳{off.toLocaleString("en-US")}</span>}
      </div>
      <h3 className="px-4 pt-2 text-[14px] sm:text-[17px] leading-6 text-gray-900 font-semibold line-clamp-2 min-h-[48px] group-hover:text-[#F27F20] transition-colors">{p.name}</h3>
      <div className="mt-auto px-4 pt-2">
        <p className="text-[16px] sm:text-[20px] text-gray-900 leading-6 font-semibold">{pre ? "Pre-order @ " : ""}{formatBDT(p.price)}</p>
        <div className="flex items-center gap-2 mt-1 min-h-[20px] flex-wrap">
          {p.oldPrice && (
            <>
              <span className="text-[13px] text-gray-400 line-through">{formatBDT(p.oldPrice)}</span>
              <span className="text-[11px] font-bold text-[#39B667] bg-[#39B667]/10 px-2 py-0.5 rounded">৳ {off.toLocaleString("en-US")} OFF</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-4">
        <span className="flex-1 h-10 rounded-lg border border-gray-300 inline-flex items-center justify-center text-[14px] font-semibold text-gray-800 transition-colors group-hover:border-transparent group-hover:bg-[#F27F20] group-hover:text-white">
          {pre ? "Pre Order" : "Shop Now"}
        </span>
        <button
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add(p.slug);
          }}
          className="w-10 h-10 shrink-0 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#F27F20] hover:text-[#F27F20] hover:bg-orange-50 transition"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19a2 2 0 104 0 2 2 0 00-4 0zm11 0a2 2 0 104 0 2 2 0 00-4 0zM17 17H6V3H4M6 5l14 1-1 7H6" /></svg>
        </button>
      </div>
    </Link>
  );
}

export default function ProductCarousel({ section }: { section: SectionDef }) {
  const [tab, setTab] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const items = section.tabs ? section.tabs[tab].items : section.items ?? [];

  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 900, behavior: "smooth" });
  };

  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-14">
      {/* header row */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <h2 className="text-[38px] sm:text-[56px] font-extrabold text-[#1d1d1f] leading-none">
          {section.title}{" "}
          <span className="bg-gradient-to-r from-[#F27F20] via-[#e8632c] to-[#8b5cf6] bg-clip-text text-transparent">
            {section.highlight}
          </span>
        </h2>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-[#F27F20] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* tabs */}
      {section.tabs && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {section.tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              className={`shrink-0 text-[12.5px] font-bold px-4 py-1.5 rounded-full border transition ${
                i === tab
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* scroller — 4 big cards per view on desktop */}
      <div ref={scroller} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
        {items.length > 0 ? (
          items.map((item) => <DealCard key={`${section.key}-${tab}-${item.id}`} p={item} />)
        ) : (
          <div className="w-full bg-white border border-dashed border-gray-200 rounded-lg py-14 text-center">
            <p className="text-sm text-gray-500">Products coming soon in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
