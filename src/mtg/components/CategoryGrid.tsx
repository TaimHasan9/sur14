"use client";
import { useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { categoryTiles } from "@/mtg/data/catalog";

/* Featured Categories — the live site shows a plain product photo + label,
   no card, no border, no shadow. On mobile the grid clips to 2 rows with a
   "See more" toggle. */
export default function CategoryGrid() {
  const [more, setMore] = useState(false);
  return (
    <section className="bg-[#f7f8fa] py-12 sm:py-16 mt-8">
      <div className="max-w-[1300px] mx-auto px-4">
        <h2 className="text-[38px] sm:text-[56px] font-extrabold text-[#1d1d1f] leading-none">
          Featured{" "}
          <span className="bg-gradient-to-r from-[#F27F20] via-[#e8632c] to-[#8b5cf6] bg-clip-text text-transparent">
            Categories
          </span>
        </h2>

        <div
          className={`grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-x-3 gap-y-8 sm:gap-y-14 mt-8 sm:mt-14 overflow-hidden transition-all duration-500 ${
            more ? "max-h-full" : "max-h-[220px] sm:max-h-full"
          }`}
        >
          {categoryTiles.map((c) => (
            <Link key={c.name} href={`/category/${c.slug}`} className="flex flex-col items-center text-center group">
              <span className="h-[70px] sm:h-[86px] flex items-center justify-center">
                <Img
                  src={c.img}
                  alt={c.name}
                  className="max-h-[70px] sm:max-h-[86px] w-auto max-w-[110px] object-contain drop-shadow-sm group-hover:scale-[1.06] transition-transform duration-300"
                />
              </span>
              <span className="mt-4 text-[13px] sm:text-[15px] text-gray-800 leading-tight group-hover:text-[#F27F20] transition-colors">
                {c.name}
              </span>
            </Link>
          ))}
        </div>

        <button onClick={() => setMore((v) => !v)} className="sm:hidden mt-6 w-full text-[14px] font-semibold text-gray-900 flex items-center justify-center gap-1">
          {more ? "See less" : "See more"}
          <svg className={`w-4 h-4 transition-transform ${more ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
