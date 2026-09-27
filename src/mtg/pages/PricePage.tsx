"use client";
import Link from "@/mtg/components/Link";
import Seo from "@/mtg/components/Seo";
import { useParams } from "next/navigation";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import ProductCard from "@/mtg/components/ProductCard";
import { allProducts } from "@/mtg/data/catalog";

export default function PriceRangePage() {
  const { range = "" } = (useParams() as { range: string });
  const [minS, maxS] = range.split("-");
  const min = Number(minS) || 0;
  const max = Number(maxS) || 9999999;
  const items = allProducts.filter((p) => p.price >= min && p.price <= max);

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`Gadgets between ৳${min.toLocaleString("en-US")} – ৳${max.toLocaleString("en-US")} | Mr Tom Gadgets`} />
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Price Range</span>
        </nav>
        <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#16243d]">
          ৳ {min.toLocaleString("en-US")} – ৳ {max.toLocaleString("en-US")}{" "}
          <span className="bg-gradient-to-r from-[#F27F20] to-[#8b5cf6] bg-clip-text text-transparent">Price Range</span>
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">{items.length} products in this budget</p>

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
            <p className="text-4xl mb-3">💸</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">No products in this range</h2>
            <Link href="/offers" className="btn-primary inline-block px-6 py-2.5 text-[13px]">See Offers</Link>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
