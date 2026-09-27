"use client";

import { useRef } from "react";
import ProductCard from "./ProductCard";
import type { P } from "@/mtg/data/catalog";

export default function RelatedRow({ items }: { items: P[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: 1 | -1) => ref.current?.scrollBy({ left: d * 660, behavior: "smooth" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#16243d]">Related Product</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="w-8 h-8 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-[#F27F20] transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
