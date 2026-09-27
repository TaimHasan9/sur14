"use client";

import { useMemo, useRef, useState } from "react";
import Link from "@/mtg/components/Link";
import { useRouter } from "next/navigation";
import Img from "./Img";
import { allProducts, formatBDT } from "@/mtg/data/catalog";

export default function SearchBar({ always = false }: { always?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const submit = () => {
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return allProducts.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 7);
  }, [q]);

  return (
    <div ref={boxRef} className={`relative flex-1 ${always ? "block w-full max-w-none" : "max-w-[600px] hidden sm:block"}`} onBlur={(e) => {
      if (!boxRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
    }}>
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
      </svg>
      <input
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search..."
        className="w-full bg-[#26262a] border border-[#333338] rounded-full py-2.5 pl-10 pr-4 text-[14px] font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#F27F20] transition"
      />

      {/* suggestions dropdown */}
      {open && q.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <ul className="py-1.5">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/product/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2 hover:bg-orange-50 transition"
                    >
                      <span className="w-10 h-10 rounded-md border border-gray-100 overflow-hidden shrink-0 bg-white">
                        <Img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-semibold text-[#1d1d1f] truncate">{r.name}</span>
                        {r.brand && <span className="block text-[11px] text-gray-400">{r.brand}</span>}
                      </span>
                      <span className="text-[13px] font-extrabold text-[#F27F20] shrink-0">{formatBDT(r.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 bg-gray-50 px-3.5 py-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{results.length}+ products found</span>
                <Link
                  href={`/search?q=${encodeURIComponent(q.trim())}`}
                  onClick={() => setOpen(false)}
                  className="text-[12px] font-bold text-[#F27F20] hover:underline"
                >
                  View all results →
                </Link>
              </div>
            </>
          ) : (
            <p className="px-4 py-5 text-[13px] text-gray-500 text-center">
              No product found for “{q}” — try “iphone”, “fan”, “air fryer”...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
