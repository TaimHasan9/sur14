"use client";
import { useState } from "react";
import { seoArticle } from "@/mtg/data/realHome";

/* The long "Top Gadget Shop in Bangladesh" SEO article shown collapsed at the
   very bottom of the live homepage with a Read more / Show less toggle. */
export default function SeoArticle() {
  const [open, setOpen] = useState(false);
  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-6 pb-12">
      <div className={`relative overflow-hidden transition-all duration-500 ${open ? "max-h-[6000px]" : "max-h-[230px]"}`}>
        <div className="space-y-3">
          {seoArticle.map((b, i) => {
            if (b.tag === "h1") return <h2 key={i} className="text-[26px] sm:text-[32px] font-extrabold text-[#16243d]">{b.text}</h2>;
            if (b.tag === "h2") return <h3 key={i} className="text-[20px] sm:text-[24px] font-extrabold text-[#16243d] pt-3">{b.text}</h3>;
            if (b.tag === "h3") return <h4 key={i} className="text-[17px] font-bold text-[#16243d] pt-2">{b.text}</h4>;
            if (b.tag === "li")
              return (
                <p key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-gray-600 pl-1">
                  <span className="text-[#F27F20] mt-0.5">•</span>
                  {b.text}
                </p>
              );
            return <p key={i} className="text-[14px] leading-relaxed text-gray-600">{b.text}</p>;
          })}
        </div>
        {!open && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />}
      </div>
      <button onClick={() => setOpen((v) => !v)} className="mt-3 text-[13px] font-bold text-[#F27F20] hover:underline flex items-center gap-1">
        {open ? "Show less" : "Read more"}
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
    </section>
  );
}
