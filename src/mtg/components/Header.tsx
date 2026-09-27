"use client";

import { useState } from "react";
import Link from "@/mtg/components/Link";
import SearchBar from "./SearchBar";
import { headerMenus } from "@/mtg/data/catalog";
import { useShop } from "@/mtg/store/shop";
const mrTomLogo = "/mr-tom-256.jpg";

/* Mr Tom Gadgets mark: round "Mr Tom" mascot + wordmark */
export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Mr Tom Gadgets home">
      <img
        src={mrTomLogo}
        alt="Mr Tom"
        width={44}
        height={44}
        className={`w-11 h-11 rounded-full object-cover shrink-0 ring-2 ${dark ? "ring-[#F27F20]/70" : "ring-[#F27F20]/50"} shadow-[0_2px_10px_rgba(242,127,32,0.35)]`}
      />
      <span className="leading-none">
        <span className={`block text-[22px] font-black tracking-tight ${dark ? "text-white" : "text-[#1d1d1f]"}`}>
          Mr <span className="text-[#F27F20]">Tom</span>
        </span>
        <span className={`block text-[10px] font-semibold tracking-[0.26em] mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>GADGETS</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [drawer, setDrawer] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { cartCount } = useShop();

  return (
    <header className="sticky top-0 z-50 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      {/* ---- Top black bar ---- */}
      <div className="bg-[#0b0b0c]">
        <div className="max-w-[1300px] mx-auto px-4 h-[64px] flex items-center gap-4">
          {/* hamburger (mobile) */}
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="lg:hidden text-white p-1 -ml-1 hover:text-[#F27F20] transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Logo />
          <SearchBar />

          <div className="flex items-center gap-4 ml-auto">
            <Link href="/blog" className="text-[14px] font-medium text-white hover:text-[#F27F20] transition hidden md:block">Blog</Link>
            <Link href="/pre-order" className="text-[14px] font-medium text-white hover:text-[#F27F20] transition hidden md:block">Pre-order</Link>
            <Link href="/offers" className="flex items-center gap-1.5 text-[14px] font-bold text-[#F27F20] hover:opacity-80 transition">
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7h-1.2V5a1 1 0 00-1-1H6.2a1 1 0 00-1 1v2H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM12 15.5s-3.5-2.1-3.5-4.4c0-1.2 1-2.1 2.1-2.1.6 0 1.1.3 1.4.7.3-.4.8-.7 1.4-.7 1.2 0 2.1.9 2.1 2.1 0 2.3-3.5 4.4-3.5 4.4z" />
              </svg>
              Offers
            </Link>
            <Link href="/compare" className="hidden lg:flex items-center gap-1.5 text-[14px] font-medium text-white hover:text-[#F27F20] transition">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Compare
            </Link>
            <Link href="/cart" className="relative text-white hover:text-[#F27F20] transition p-1" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#F27F20] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }}>{cartCount}</span>
            </Link>
            <Link href="/account" className="w-10 h-10 rounded-full bg-[#F27F20] flex items-center justify-center text-white hover:bg-[#d96d12] hover:scale-105 transition" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="sm:hidden px-4 pb-3">
          <SearchBar always />
        </div>
      </div>

      {/* ---- Desktop nav row with animated hover dropdowns ---- */}
      <nav className="bg-white border-b border-gray-200 hidden lg:block relative z-40">
        <div className="max-w-[1300px] mx-auto px-4">
          <ul className="flex items-center gap-0.5 h-[46px]">
            {headerMenus.map((menu) => (
              <li key={menu.label} className="relative group h-full">
                <Link
                  href={menu.href}
                  className="flex items-center gap-1.5 px-3 h-full text-[14px] font-semibold text-gray-800 group-hover:text-[#F27F20] transition-colors"
                >
                  {menu.label}
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#F27F20] group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* animated dropdown */}
                <div className="absolute left-0 top-full pt-1 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-200 ease-out z-50">
                  <div className={`bg-[#f7f7f8] rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.14)] py-2.5 ${menu.children.length > 12 ? "min-w-[540px] grid grid-cols-2" : "min-w-[270px]"}`}>
                    {menu.children.map((c) => (
                      <Link key={c.label} href={c.href} className="flex items-center justify-between px-6 py-[9px] text-[15px] text-gray-800 hover:text-[#F27F20] hover:bg-white/70 transition-colors">
                        {c.label}
                        {c.nested && (
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ---- Mobile drawer ---- */}
      {drawer && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-[fadeUp_0.2s_ease-out]" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[310px] max-w-[85vw] bg-white shadow-2xl animate-drawer flex flex-col">
            <div className="flex items-center justify-between px-4 h-[60px] bg-[#0b0b0c]">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="text-white p-1 hover:text-[#F27F20] transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <SearchBar always />
              </div>

              <ul className="py-2">
                {headerMenus.map((m) => (
                  <li key={m.label} className="border-b border-gray-50">
                    <button
                      onClick={() => setOpenMenu((v) => (v === m.label ? null : m.label))}
                      className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-semibold text-gray-800 hover:text-[#F27F20] transition"
                    >
                      {m.label}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openMenu === m.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openMenu === m.label ? "max-h-[420px]" : "max-h-0"}`}>
                      <ul className="pb-2 bg-[#fafafa]">
                        {m.children.map((c) => (
                          <li key={c.label}>
                            <Link href={c.href} onClick={() => setDrawer(false)} className="flex items-center justify-between pl-7 pr-4 py-2.5 text-[14px] text-gray-600 hover:text-[#F27F20] transition">
                              {c.label}
                              {c.nested && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-2 p-4">
                <Link href="/info/blog" className="btn-outline py-2.5 text-center text-[13px]">Blog</Link>
                <Link href="/pre-order" className="btn-outline py-2.5 text-center text-[13px]">Pre-order</Link>
                <Link href="/offers" className="btn-outline py-2.5 text-center text-[13px] !text-[#F27F20] !border-[#F27F20]">Offers</Link>
                <Link href="/compare" className="btn-outline py-2.5 text-center text-[13px]">Compare</Link>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <Link href="/account" className="btn-primary w-full py-3 text-center text-[14px] block">Login / Register</Link>
            </div>
          </div>
        </div>
      )}

      {/* ---- Mobile bottom navigation (like the live site) ---- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 h-[60px]">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => (document.querySelector<HTMLInputElement>("input[placeholder='Search...']")?.focus()), 350); }} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#F27F20]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
            Search
          </button>
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#F27F20]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" /></svg>
            Home
          </Link>
          <button onClick={() => setDrawer(true)} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#F27F20]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" /></svg>
            Category
          </button>
          <Link href="/offers" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#F27F20]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-1.2V5a1 1 0 00-1-1H6.2a1 1 0 00-1 1v2H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM12 4v16" /></svg>
            Offer
          </Link>
          <Link href="/account" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#F27F20]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" /></svg>
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
