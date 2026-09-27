"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import FilterSidebar, { type FilterState } from "./FilterSidebar";
import type { FilterGroup } from "@/mtg/data/categoryMeta";
import { formatBDT, type P } from "@/mtg/data/catalog";

function ListingCard({ p }: { p: P }) {
  const off = p.oldPrice ? p.oldPrice - p.price : 0;
  const preOrder = p.status === "pre-order";
  return (
    <div className="ag-card group bg-white border border-gray-100 rounded-3xl p-4 flex flex-col shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
      <Link href={`/product/${p.slug}`} className="block aspect-square bg-white rounded-md overflow-hidden">
        <Img src={p.img} alt={p.name} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
      </Link>
      <Link href={`/product/${p.slug}`} className="mt-3 text-[14px] font-semibold leading-snug text-[#1d1d1f] line-clamp-2 min-h-[40px] hover:text-[#F27F20] transition-colors">
        {p.name}
      </Link>
      <p className="mt-1.5 text-[16px] font-extrabold text-[#1d1d1f]">{formatBDT(p.price)}</p>
      <div className="mt-1 flex items-center gap-2 min-h-[20px]">
        {p.oldPrice && (
          <>
            <span className="text-[12px] text-gray-400 line-through">{formatBDT(p.oldPrice)}</span>
            <span className="text-[11px] font-bold text-[#39B667] bg-[#39B667]/10 px-1.5 py-0.5 rounded">৳ {off.toLocaleString("en-US")} OFF</span>
          </>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link href={`/product/${p.slug}`} className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-[13px] font-semibold text-[#1d1d1f] transition-colors group-hover:border-transparent group-hover:bg-[#F27F20] group-hover:text-white">
          {preOrder ? "Pre Order" : "Shop Now"}
        </Link>
        <Link href="/cart" aria-label="Go to cart" className="w-10 h-10 shrink-0 border border-gray-200 hover:border-[#F27F20] hover:text-[#F27F20] transition rounded-full flex items-center justify-center text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const SORTS = [
  ["default", "Default sorting"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["name", "Name: A to Z"],
] as const;

export default function CatalogView({ items, groups }: { items: P[]; groups: FilterGroup[] }) {
  const maxPrice = items.length ? Math.max(...items.map((p) => p.price)) : 100000;
  const [f, setF] = useState<FilterState>({ priceMax: maxPrice, exclude: true, brands: [] });
  const [sort, setSort] = useState<(typeof SORTS)[number][0]>("default");
  const [sortOpen, setSortOpen] = useState(false);

  /* new listing → reset price cap & brand selection so nothing gets hidden by stale filters */
  useEffect(() => {
    setF({ priceMax: maxPrice, exclude: true, brands: [] });
  }, [maxPrice, items]);

  const shown = useMemo(() => {
    let list = items.filter((p) => p.price <= f.priceMax);
    if (f.brands.length) {
      list = list.filter((p) => {
        const b = p.brand ?? "Other";
        return f.brands.includes(b) || (b === "Other" && f.brands.includes("Other"));
      });
    }
    const out = [...list];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [items, f, sort]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[265px_1fr] gap-5 items-start">
      <FilterSidebar groups={groups} maxPrice={maxPrice} state={f} onChange={setF} />

      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-[14px] text-gray-600">
            Showing: <b className="text-[#1d1d1f]">({shown.length} Items)</b>
          </p>

          {/* working sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-[13px] font-semibold text-gray-700 hover:border-gray-400 transition"
            >
              Sort By
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v18m13.5-13.5L16.5 12m0 0L12 7.5m4.5 4.5V3" />
              </svg>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-[190px] bg-white border border-gray-100 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-1.5 z-40">
                {SORTS.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSort(id);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] transition ${
                      sort === id ? "text-[#F27F20] font-bold bg-orange-50/60" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {shown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {shown.map((p) => (
              <ListingCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
            <p className="text-4xl mb-3">📦</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">No products match your filters</h2>
            <p className="text-[13px] text-gray-500 mb-4">Try raising the price range or clearing brand filters.</p>
            <button onClick={() => setF({ priceMax: maxPrice, exclude: true, brands: [] })} className="btn-outline px-5 py-2 text-[13px]">
              Clear Filters
            </button>
          </div>
        )}

        {shown.length > 0 && (
          <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-5">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-md px-4 py-2 text-[13px] font-semibold text-gray-600 hover:border-gray-400 transition">
              ← Previous
            </button>
            <span className="w-8 h-8 bg-[#F27F20] text-white rounded-md flex items-center justify-center text-[13px] font-bold">1</span>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-md px-4 py-2 text-[13px] font-semibold text-gray-600 hover:border-gray-400 transition">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
