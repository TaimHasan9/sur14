"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { topSlides, heroPair } from "@/mtg/data/realHome";

/**
 * Hero — 1:1 with the live applegadgetsbd.com markup:
 *
 *   <section class="grid grid-cols-2 lg:grid-cols-10 gap-2 lg:gap-6">
 *     <div class="lg:row-span-2 col-span-2 lg:col-span-7 pb-[55.25%] lg:pb-0">  slider  </div>
 *     <a  class="lg:col-span-3 pb-[57.25%]"> banner 1 </a>
 *     <a  class="lg:col-span-3 pb-[57.25%]"> banner 2 </a>
 *   </section>
 *
 *  Desktop                                   Mobile
 *  ┌──────────────────────────┬─────────┐    ┌───────────────────┐
 *  │                          │ banner1 │    │      slider       │
 *  │        SLIDER            ├─────────┤    ├─────────┬─────────┤
 *  │  (fills both rows)       │ banner2 │    │ banner1 │ banner2 │
 *  └──────────────────────────┴─────────┘    └─────────┴─────────┘
 *
 *  Both right-hand banners are the SAME size (868×476 artwork) and the slider
 *  stretches to exactly the height of the two rows, so nothing overflows below.
 */
export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = topSlides.length;
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <section className="max-w-[1300px] mx-auto px-4 grid grid-cols-2 lg:grid-cols-10 gap-2 lg:gap-5 mt-3 lg:mt-6">
      {/* ---------- big slider (spans 7 cols + both rows on desktop) ---------- */}
      <div
        className="relative overflow-hidden rounded-lg lg:row-span-2 col-span-2 lg:col-span-7 pb-[55.25%] lg:pb-0 bg-[#f6f7fb] group select-none"
        aria-label="Hero Slider"
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || e.changedTouches.length === 0) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {/* mobile: absolutely fills the padding-box; desktop: static and fills the 2 grid rows */}
        <div className="absolute inset-0 lg:static lg:h-full overflow-hidden">
          <div
            className="flex h-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {topSlides.map((s, i) => (
              <Link
                key={s.img}
                href={s.href}
                aria-label={s.alt}
                className="relative w-full h-full shrink-0 block"
                tabIndex={i === index ? 0 : -1}
              >
                <figure className="relative h-full w-full m-0">
                  <Img
                    src={s.img}
                    alt={s.alt}
                    loading={i < 2 ? "eager" : "lazy"}
                    className={`absolute inset-0 w-full h-full object-cover object-center ${i === index ? "animate-hero-zoom" : ""}`}
                  />
                </figure>
              </Link>
            ))}
          </div>
        </div>

        {/* round arrow buttons (hidden on very small screens, like the live site) */}
        {[
          { d: -1, label: "Previous slide", pos: "left-2", path: "M15 19l-7-7 7-7" },
          { d: 1, label: "Next slide", pos: "right-2", path: "M9 5l7 7-7 7" },
        ].map((a) => (
          <button
            key={a.d}
            onClick={() => go(index + a.d)}
            aria-label={a.label}
            className={`absolute ${a.pos} top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white text-[#1d1d1f] shadow-[0_2px_10px_rgba(0,0,0,0.18)] hidden sm:flex items-center justify-center hover:bg-[#F27F20] hover:text-white transition`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={a.path} />
            </svg>
          </button>
        ))}

        {/* dots — active one is wider */}
        <div className="absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" role="navigation" aria-label="Carousel dots">
          {topSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-[#F27F20]" : "w-2 bg-white/80 shadow hover:bg-white"}`}
            />
          ))}
        </div>
      </div>

      {/* ---------- right column: two EQUAL banners (one per row) ---------- */}
      {heroPair.map((b, i) => (
        <Link
          key={b.img}
          href={b.href}
          aria-label={b.alt}
          className="lg:col-span-3 relative flex pb-[57.25%] rounded-lg overflow-hidden bg-[#f6f7fb] group"
        >
          <Img
            src={b.img}
            alt={b.alt}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 w-full h-full object-cover rounded-lg group-hover:scale-[1.03] transition-transform duration-700"
          />
        </Link>
      ))}
    </section>
  );
}
