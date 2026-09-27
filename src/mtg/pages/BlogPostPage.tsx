"use client";
import Link from "@/mtg/components/Link";
import { useRouter, useParams } from "next/navigation";
import Seo from "@/mtg/components/Seo";
import NotFoundPage from "./NotFoundPage";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { posts } from "@/mtg/data/blog";

export default function BlogPostPage() {
  const router = useRouter();
  const { slug = "" } = (useParams() as { slug: string });
  const post = posts.find((p) => p.slug === slug);
  if (!post) return <NotFoundPage />;

  const others = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${post.title} | MrTomGadgets Blog`} description={post.excerpt} />
      <Header />
      <div className="max-w-[860px] mx-auto px-4 py-6">
        {/* ---- back button ---- */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-[13px] font-semibold text-[#16243d] hover:border-[#F27F20] hover:text-[#F27F20] transition group"
            aria-label="Go back"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-[#F27F20] transition"
          >
            Back to Blog
          </Link>
        </div>

        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <Link href="/blog" className="hover:text-[#F27F20]">Blog</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f] truncate">{post.title}</span>
        </nav>

        <span className="text-[12px] font-bold text-[#F27F20] bg-orange-50 px-3 py-1 rounded-full">{post.tag}</span>
        <h1 className="text-[28px] sm:text-[38px] font-black text-[#16243d] leading-tight mt-3">{post.title}</h1>
        <p className="text-[12.5px] text-gray-400 mt-2">{post.date} · Mr Tom Gadgets Editorial</p>

        <div className="mt-6 space-y-4">
          {post.body.map((b, i) => (
            <p key={i} className="text-[14.5px] leading-relaxed text-gray-600">{b}</p>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <h3 className="text-[18px] font-extrabold text-[#16243d] mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/blog/${o.slug}`} className="border border-gray-100 rounded-lg p-4 hover:border-[#F27F20]/40 hover:shadow-md transition">
                <p className="text-[11px] text-gray-400">{o.date}</p>
                <p className="text-[14px] font-bold text-[#16243d] leading-snug mt-1 line-clamp-2">{o.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
