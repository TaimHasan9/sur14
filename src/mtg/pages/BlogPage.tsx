"use client";
import Link from "@/mtg/components/Link";
import Img from "@/mtg/components/Img";
import Seo from "@/mtg/components/Seo";
import { useRouter, useSearchParams } from "next/navigation";
import { posts, BLOG_TAGS } from "@/mtg/data/blog";
import { allProducts } from "@/mtg/data/catalog";

const PER_PAGE = 10;

export default function BlogPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const tag = sp.get("tag") ?? undefined;
  const page = sp.get("page") ?? undefined;
  const pageNum = Math.max(1, Number(page) || 1);
  const filtered = tag ? posts.filter((p) => p.tag === tag) : posts;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = filtered.slice((pageNum - 1) * PER_PAGE, pageNum * PER_PAGE);
  const trending = allProducts.slice(0, 3);
  const recent = posts.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Seo
        title="Blog — Tech News, Reviews & Buying Guides | MrTomGadgets Blog"
        description="Latest tech trends, product reviews, comparisons, buying guides and tech tutorials in English & Bangla from the MrTomGadgets editorial team."
      />
      {/* ---- blog black header ---- */}
      <header className="bg-[#0b0b0c]">
        <div className="max-w-[1300px] mx-auto px-4 h-[64px] flex items-center gap-4 sm:gap-6">
          {/* ---- back button ---- */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/15 text-[12.5px] font-semibold text-gray-200 hover:border-[#F27F20] hover:text-[#F27F20] transition group shrink-0"
            aria-label="Go back"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/blog" className="flex items-center gap-2.5 shrink-0">
            <span className="w-10 h-10 rounded-lg bg-[#F27F20] flex items-center justify-center text-white font-black text-[15px] leading-none">
              ag
            </span>
            <span className="leading-none">
              <span className="block text-[10px] tracking-wide text-gray-400">MrTomGadgets</span>
              <span className="block text-[22px] font-bold text-white">
                b<span className="text-[#F27F20]">l</span>og
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 ml-auto">
            {BLOG_TAGS.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className={`text-[13px] font-medium transition ${
                  tag === t ? "text-[#F27F20]" : "text-gray-200 hover:text-[#F27F20]"
                }`}
              >
                {t}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="ml-auto lg:ml-4 flex items-center gap-2 border-2 border-[#F27F20] text-[#F27F20] font-bold text-[13px] px-5 py-2 rounded-md hover:bg-[#F27F20] hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Shop
          </Link>
        </div>
      </header>

      {/* ---- content ---- */}
      <div className="max-w-[1300px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* articles grid */}
        <div>
          {tag && (
            <p className="mb-5 text-[14px] text-gray-600">
              Category: <b className="text-[#F27F20]">{tag}</b> · {filtered.length} posts ·{" "}
              <Link href="/blog" className="underline">clear</Link>
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            {current.map((p) => (
              <article key={p.slug} className="flex flex-col">
                <Link href={`/blog/${p.slug}`} className="block overflow-hidden rounded-sm">
                  <Img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-[240px] sm:h-[260px] object-cover hover:scale-[1.04] transition-transform duration-500"
                  />
                </Link>
                <p className="mt-4 text-[11px] font-bold tracking-wide uppercase text-[#F27F20]">{p.tag}</p>
                <h2 className="mt-2 text-[21px] font-extrabold leading-snug text-[#16243d]">
                  <Link href={`/blog/${p.slug}`} className="hover:text-[#F27F20] transition-colors">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 text-[12px] text-gray-400">{p.date}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-gray-600 line-clamp-4">{p.excerpt}</p>
                <Link href={`/blog/${p.slug}`} className="mt-4 text-[12px] font-bold tracking-wide text-[#16243d] hover:text-[#F27F20] transition">
                  READ MORE →
                </Link>
              </article>
            ))}
          </div>

          {/* pagination — 1 2 3 … last ›  (like the live blog) */}
          <div className="flex items-center gap-2 mt-12">
            {(totalPages <= 4
              ? Array.from({ length: totalPages }, (_, i) => i + 1)
              : [1, 2, 3, "…", totalPages]
            ).map((n, idx) =>
              n === "…" ? (
                <span key={`e${idx}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-500">
                  …
                </span>
              ) : (
                <Link
                  key={n}
                  href={`/blog?page=${n}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-[13px] font-bold transition ${
                    n === pageNum ? "bg-[#F27F20] text-white" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {n}
                </Link>
              )
            )}
            {pageNum < totalPages && (
              <Link
                href={`/blog?page=${pageNum + 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="w-9 h-9 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
                aria-label="Next page"
              >
                ›
              </Link>
            )}
          </div>
        </div>

        {/* sidebar */}
        <aside className="space-y-7">
          {/* care ad */}
          <div className="rounded-md overflow-hidden bg-gradient-to-br from-[#1b2a6b] to-[#0e1a4a] p-5 text-white">
            <p className="text-[11px] text-gray-300">
              <span className="font-bold text-white"> Apple iPhone</span> রিপেয়ারে
            </p>
            <p className="text-[19px] font-extrabold leading-snug mt-1">
              আপনার গ্যাজেটে <span className="text-[#F27F20]">Mr Tom Gadgets Care</span>
            </p>
            <p className="text-[10.5px] text-gray-300 mt-2">সার্ভিসিং ও ওয়ারেন্টি সাপোর্টে যোগাযোগ করুন</p>
            <p className="mt-2 text-[15px] font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>
              09678-149 149
            </p>
          </div>

          {/* search */}
          <form action="/search" className="flex gap-2">
            <input
              name="q"
              placeholder=""
              className="flex-1 min-w-0 border border-gray-300 rounded-sm px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#F27F20]"
            />
            <button className="bg-[#F27F20] hover:bg-[#d96d12] transition text-white text-[13px] font-bold px-5 rounded-sm">
              Search
            </button>
          </form>

          {/* trending products */}
          <div>
            <h3 className="text-[20px] font-extrabold text-[#16243d] mb-4">Trending Products</h3>
            <ul className="space-y-4">
              {trending.map((t) => (
                <li key={t.id}>
                  <Link href={`/product/${t.slug}`} className="flex items-center gap-3 group">
                    <span className="w-12 h-12 rounded-sm overflow-hidden bg-white border border-gray-100 shrink-0">
                      <Img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                    </span>
                    <span className="text-[13.5px] font-medium text-[#F27F20] group-hover:underline leading-snug">
                      {t.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* recent posts */}
          <div>
            <h3 className="text-[20px] font-extrabold text-[#16243d] mb-4">Recent Posts</h3>
            <ul className="space-y-4">
              {recent.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="flex items-start gap-3 group">
                    <span className="w-12 h-12 rounded-sm overflow-hidden shrink-0">
                      <Img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                    </span>
                    <span className="text-[13px] font-medium text-[#16243d] group-hover:text-[#F27F20] leading-snug transition-colors">
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* blog sub-footer */}
      <footer className="bg-[#3d4450] text-gray-200">
        <div className="max-w-[1300px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-6 text-[13px]">
            <Link href="/info/about-us" className="hover:text-[#F27F20] transition">About Blog</Link>
            <Link href="/contact" className="hover:text-[#F27F20] transition">Contact Blog Team</Link>
          </div>
          <p className="text-[13px] text-gray-300">© 2026 MrTomGadgets Blog</p>
        </div>
      </footer>
    </div>
  );
}
