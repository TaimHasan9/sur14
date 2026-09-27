"use client";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import ProductCard from "@/mtg/components/ProductCard";
import Link from "@/mtg/components/Link";
import { allProducts } from "@/mtg/data/catalog";

export default function PreOrderPage() {
  const items = allProducts.filter((p) => !p.oldPrice && p.price >= 70000);
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Pre-order</span>
        </nav>
        <h1 className="text-[30px] sm:text-[40px] font-extrabold text-[#16243d]">
          Pre-Order <span className="bg-gradient-to-r from-[#F27F20] to-[#8b5cf6] bg-clip-text text-transparent">Products</span>
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">Book upcoming & on-demand products now — delivery in 2-4 weeks.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-6">
          {items.map((p) => (
            <div key={p.id} className="[&>a]:w-full">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
