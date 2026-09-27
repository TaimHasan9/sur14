"use client";

import { useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "@/mtg/components/Img";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { useShop } from "@/mtg/store/shop";
import { allProducts, formatBDT } from "@/mtg/data/catalog";

export default function CartPage() {
  const { cart, setQty, remove, toggleWish } = useShop();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const lines = cart
    .map((l) => ({ line: l, product: allProducts.find((p) => p.slug === l.slug) }))
    .filter((x) => x.product);

  const subtotal = lines.reduce((s, x) => s + (x.product?.price ?? 0) * x.line.qty, 0);
  const delivery = subtotal >= 2000 || subtotal === 0 ? 0 : 120;
  const total = Math.max(0, subtotal - discount + delivery);

  const applyCoupon = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validate: true, code: c, subtotal }),
      });
      const d = await res.json();
      if (!res.ok) {
        setApplied(null);
        setDiscount(0);
        setCouponMsg(d.error || "Invalid coupon code");
      } else {
        setApplied(d.code);
        setDiscount(d.discount);
        setCouponMsg(`Coupon ${d.code} applied: ${formatBDT(d.discount)} off!`);
      }
    } catch {
      setCouponMsg("Could not validate coupon");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Shopping Cart</span>
        </nav>
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#16243d]">
          Shopping Cart <span className="text-[16px] font-medium text-gray-500">({lines.length} Items)</span>
        </h1>

        {lines.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg mt-6">
            <p className="text-5xl mb-4"></p>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Your cart is empty</h2>
            <p className="text-[13px] text-gray-500 mb-6">Add products from the homepage or category pages.</p>
            <Link href="/" className="btn-primary inline-block px-8 py-3 text-[14px]">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-6 items-start">
            <div className="space-y-4">
              {lines.map(({ line, product }) => (
                <div key={line.slug} className="ag-card bg-white border border-gray-100 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                  <Link href={`/product/${product!.slug}`} className="w-full sm:w-24 h-40 sm:h-24 shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                    <Img src={product!.img} alt={product!.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product!.slug}`} className="text-[15px] font-semibold text-[#1d1d1f] hover:text-[#F27F20] transition line-clamp-2">
                      {product!.name}
                    </Link>
                    <p className="text-[12px] text-gray-400 mt-0.5">Brand: {product!.brand ?? "—"}</p>
                    <p className="text-[14px] font-bold text-[#1d1d1f] mt-1.5">{formatBDT(product!.price)}</p>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button onClick={() => setQty(line.slug, line.qty - 1)} className="w-8 h-8 text-gray-500 hover:bg-gray-100" aria-label="Decrease">−</button>
                        <span className="w-10 text-center text-[13px] font-semibold border-x border-gray-200 h-8 leading-8">{line.qty}</span>
                        <button onClick={() => setQty(line.slug, line.qty + 1)} className="w-8 h-8 text-gray-500 hover:bg-gray-100" aria-label="Increase">+</button>
                      </div>
                      <button
                        onClick={() => {
                          toggleWish(line.slug);
                          remove(line.slug);
                        }}
                        className="btn-outline px-4 py-1.5 text-[12.5px]"
                      >
                        Save for Later
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    <p className="text-[17px] font-black text-[#16243d]">{formatBDT(product!.price * line.qty)}</p>
                    <button onClick={() => remove(line.slug)} aria-label="Remove item" className="text-gray-300 hover:text-[#FD5B67] transition p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#F27F20] hover:underline">
                ← Continue Shopping
              </Link>
            </div>

            <aside className="bg-white border border-gray-200 rounded-lg p-5 lg:sticky lg:top-24">
              <h3 className="text-[17px] font-bold text-[#16243d] mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-[14px]">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatBDT(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="font-semibold text-[#39B667]">− {formatBDT(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-semibold text-[#39B667]">{delivery === 0 ? "Free" : formatBDT(delivery)}</span></div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-[#16243d]">Total</span>
                  <span className="text-[22px] font-black text-[#F27F20]">{formatBDT(total)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon Code (try AG500)"
                  className="flex-1 min-w-0 border border-gray-200 rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#F27F20]"
                />
                <button onClick={applyCoupon} className="btn-outline px-4 py-2.5 text-[13px]">Apply</button>
              </div>
              {couponMsg && (
                <p className={`text-[12px] mt-1.5 ${applied ? "text-[#39B667]" : "text-[#FD5B67]"}`}>{couponMsg}</p>
              )}

              <Link href="/checkout" className="btn-primary w-full py-3.5 text-[15px] mt-4 block text-center">
                Proceed to Checkout
              </Link>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {["bkash", "Nagad", "Rocket", "VISA", "Mastercard", "COD"].map((p) => (
                  <span key={p} className="text-[10.5px] font-bold text-gray-500 border border-gray-200 rounded px-2 py-1">{p}</span>
                ))}
              </div>
              <p className="text-[11.5px] text-gray-400 mt-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                100% secure SSL encrypted checkout
              </p>
            </aside>
          </div>
        )}
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
