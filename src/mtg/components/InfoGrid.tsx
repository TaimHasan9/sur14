"use client";
import { useEffect, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { seoTexts, seoImages } from "@/mtg/data/realHome";

const BG = ["bg-[#FDEEE3]", "bg-[#E8F1FB]", "bg-[#FDEEE3]", "bg-[#FBE4E4]", "bg-[#E6F4E9]"];

/* The live site's bottom SEO grid: 5 text cards + a 1×1 image slider
   (MacBook Pro M5 / Hithium & EcoFlow) in the middle of the first row. */
export default function InfoGrid() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % seoImages.length), 4000);
    return () => clearInterval(t);
  }, []);

  const Card = ({ idx }: { idx: number }) => (
    <article className={`${BG[idx % BG.length]} rounded-2xl p-6`}>
      <h3 className="text-[17px] font-extrabold text-[#1d1d1f] mb-2.5 leading-snug">{seoTexts[idx].title}</h3>
      <p className="text-[13.5px] leading-relaxed text-gray-700">{seoTexts[idx].body}</p>
    </article>
  );

  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-12 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card idx={0} />

        {/* 1×1 image slider */}
        <article className="relative rounded-2xl overflow-hidden bg-[#101828] min-h-[260px] group">
          {seoImages.map((s, k) => (
            <Link
              key={s.img}
              href={s.href}
              className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <Img src={s.img} alt="Featured offer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
            </Link>
          ))}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {seoImages.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-[#F27F20]" : "w-1.5 bg-white/70"}`} />
            ))}
          </div>
        </article>

        <Card idx={1} />
        <Card idx={2} />
        <Card idx={3} />
        <Card idx={4} />
      </div>
    </section>
  );
}
