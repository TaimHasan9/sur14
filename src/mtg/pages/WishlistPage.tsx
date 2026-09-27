"use client";

import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import ProductCard from "@/mtg/components/ProductCard";
import { useShop } from "@/mtg/store/shop";
import { allProducts } from "@/mtg/data/catalog";

export default function WishlistPage() {
  const { wishlist } = useShop();
  const items = allProducts.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#16243d]">
          My Wishlist <span className="text-[16px] font-medium text-gray-500">({items.length} Items)</span>
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
            <p className="text-4xl mb-3">🤍</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">Your wishlist is empty</h2>
            <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-[13px]">Browse Products</Link>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
