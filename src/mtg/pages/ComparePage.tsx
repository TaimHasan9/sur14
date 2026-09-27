"use client";

import Link from "@/mtg/components/Link";
import Img from "@/mtg/components/Img";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { useShop } from "@/mtg/store/shop";
import { allProducts, formatBDT } from "@/mtg/data/catalog";

export default function ComparePage() {
  const { compare, toggleCompare } = useShop();
  const items = allProducts.filter((p) => compare.includes(p.slug)).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#16243d]">
          Compare Products <span className="text-[16px] font-medium text-gray-500">({items.length})</span>
        </h1>

        {items.length > 0 ? (
          <div className="overflow-x-auto mt-6 border border-gray-200 rounded-lg">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 bg-[#f7f8fa] w-[160px] text-gray-500 font-semibold">Product</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      <Img src={p.img} alt={p.name} className="w-24 h-24 object-cover rounded-md mx-auto" />
                      <Link href={`/product/${p.slug}`} className="block mt-2 font-semibold hover:text-[#F27F20] line-clamp-2">{p.name}</Link>
                      <button onClick={() => toggleCompare(p.slug)} className="mt-2 text-[11.5px] text-[#FD5B67] hover:underline">Remove</button>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 bg-[#f7f8fa] text-gray-500 font-semibold">Price</th>
                  {items.map((p) => <td key={p.id} className="p-4 text-center font-extrabold text-[#F27F20]">{formatBDT(p.price)}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 bg-[#f7f8fa] text-gray-500 font-semibold">Brand</th>
                  {items.map((p) => <td key={p.id} className="p-4 text-center">{p.brand ?? "—"}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 bg-[#f7f8fa] text-gray-500 font-semibold">Availability</th>
                  {items.map((p) => <td key={p.id} className="p-4 text-center text-[#39B667] font-semibold">In Stock</td>)}
                </tr>
                <tr>
                  <th className="text-left p-4 bg-[#f7f8fa] text-gray-500 font-semibold">Action</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      <Link href={`/product/${p.slug}`} className="btn-primary inline-block px-5 py-2 text-[12.5px]">View Details</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg mt-6">
            <p className="text-4xl mb-3">⚖️</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">Nothing to compare yet</h2>
            <p className="text-[13px] text-gray-500 mb-5">Use “Add to Compare” on any product page.</p>
            <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-[13px]">Browse Products</Link>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
