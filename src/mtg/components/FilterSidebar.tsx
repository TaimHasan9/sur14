"use client";

import { useState } from "react";
import type { FilterGroup } from "@/mtg/data/categoryMeta";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

export interface FilterState {
  priceMax: number;
  exclude: boolean;
  brands: string[];
}

export default function FilterSidebar({
  groups,
  maxPrice,
  state,
  onChange,
}: {
  groups: FilterGroup[];
  maxPrice: number;
  state: FilterState;
  onChange: (s: FilterState) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<string>(String(maxPrice));

  const toggle = (t: string) => setOpenGroups((s) => ({ ...s, [t]: !s[t] }));
  const isOpen = (t: string) => openGroups[t] !== false;

  const brandGroup = groups.find((g) => g.title === "Brands");
  const otherGroups = groups.filter((g) => g.title !== "Brands");

  return (
    <aside>
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 mb-3 text-[15px] font-bold text-[#1d1d1f]"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
          </svg>
          Filters
        </span>
        <Chevron open={mobileOpen} />
      </button>

      <div className={`${mobileOpen ? "block" : "hidden"} lg:block bg-white border border-gray-200 rounded-lg`}>
        <h3 className="text-[17px] font-bold text-[#1d1d1f] px-4 pt-4 pb-3">Filters</h3>

        {/* Price Range */}
        <div className="px-4 pb-4 border-b border-gray-100">
          <button onClick={() => toggle("price")} className="w-full flex items-center justify-between py-1.5">
            <span className="text-[14px] font-semibold text-[#1d1d1f]">Price Range</span>
            <Chevron open={isOpen("price")} />
          </button>
          {isOpen("price") && (
            <div className="flex items-center gap-2 mt-2">
              <input defaultValue={0} className="w-full min-w-0 border border-gray-200 rounded-md px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-[#F27F20]" />
              <span className="text-gray-400">-</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full min-w-0 border border-gray-200 rounded-md px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-[#F27F20]"
              />
              <button
                aria-label="Apply price filter"
                onClick={() => onChange({ ...state, priceMax: Number(draft) || maxPrice })}
                className="shrink-0 w-9 h-8 border border-[#F27F20] text-[#F27F20] rounded-md flex items-center justify-center hover:bg-[#F27F20] hover:text-white transition"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
              </button>
            </div>
          )}
          <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.exclude}
              onChange={(e) => onChange({ ...state, exclude: e.target.checked })}
              className="w-4 h-4 accent-[#F27F20]"
            />
            <span className="text-[13.5px] text-gray-700">Exclude Out of Stock</span>
          </label>
        </div>

        {/* dynamic groups */}
        {otherGroups.map((g) => (
          <div key={g.title} className="px-4 py-3.5 border-b border-gray-100">
            <button onClick={() => toggle(g.title)} className="w-full flex items-center justify-between py-1">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">{g.title}</span>
              <Chevron open={isOpen(g.title)} />
            </button>
            {isOpen(g.title) && (
              <div className="mt-2 space-y-2">
                {g.searchable && (
                  <input placeholder={`Search ${g.title}`} className="w-full bg-gray-100 rounded-md px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#F27F20]" />
                )}
                {g.options.map((o) => (
                  <label key={o} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#F27F20]" />
                    <span className="text-[13.5px] text-gray-700">{o}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Brands — actually filters the list */}
        {brandGroup && (
          <div className="px-4 py-3.5">
            <button onClick={() => toggle("Brands")} className="w-full flex items-center justify-between py-1">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">Brands</span>
              <Chevron open={isOpen("Brands")} />
            </button>
            {isOpen("Brands") && (
              <div className="mt-2 space-y-2">
                {["Apple", "Samsung", "Xiaomi", "Other"].map((b) => (
                  <label key={b} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={state.brands.includes(b)}
                      onChange={() =>
                        onChange({
                          ...state,
                          brands: state.brands.includes(b)
                            ? state.brands.filter((x) => x !== b)
                            : [...state.brands, b],
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 accent-[#F27F20]"
                    />
                    <span className="text-[13.5px] text-gray-700">{b}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
