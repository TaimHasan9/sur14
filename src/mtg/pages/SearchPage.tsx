"use client";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import ProductCard from "@/mtg/components/ProductCard";
import Link from "@/mtg/components/Link";
import Seo from "@/mtg/components/Seo";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { allProducts } from "@/mtg/data/catalog";
import { track } from "@/mtg/utils/tracking";

export default function SearchPage() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const query = q.trim().toLowerCase();
  const items = query
    ? allProducts.filter((p) => p.name.toLowerCase().includes(query) || (p.brand ?? "").toLowerCase().includes(query))
    : [];

  useEffect(() => {
    if (query) track("search", { label: q.slice(0, 200), meta: { results: items.length } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`Search: ${q} | Mr Tom Gadgets`} />
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Search</span>
        </nav>
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#16243d]">
          Search results for “{q}” <span className="text-[16px] font-medium text-gray-500">({items.length} Items)</span>
        </h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-6">
            {items.map((p) => (
              <div key={p.id} className="[&>a]:w-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg mt-6">
            <p className="text-4xl mb-3">🔍</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">No products found</h2>
            <p className="text-[13px] text-gray-500 mb-5">Try different keywords like “iphone”, “fan”, “air fryer”.</p>
            <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-[13px]">Back to Home</Link>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
