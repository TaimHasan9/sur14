"use client";

import { useMemo, useState } from "react";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";

const TENORS = [3, 6, 9, 12, 18, 24, 36];
const BANKS = ["BRAC Bank", "City Bank", "EBL", "DBBL", "Mutual Trust", "IDLC", "IPDC"];

export default function EmiPage() {
  const [price, setPrice] = useState(90499);
  const [tenor, setTenor] = useState(12);
  const [bank, setBank] = useState(BANKS[0]);

  const monthly = useMemo(() => {
    const rate = 0.0025; // ~0.25% monthly processing
    const base = price / tenor;
    return Math.round(base + price * rate);
  }, [price, tenor]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">EMI Plans</span>
        </nav>
        <h1 className="text-[30px] sm:text-[40px] font-black text-[#16243d]">
          EMI Facility — <span className="text-[#F27F20]">Up to 36 Months</span>
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">Available on orders above ৳5,000 with all major banks & cards.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="border border-gray-200 rounded-lg p-6 space-y-5">
            <div>
              <label className="text-[13px] font-semibold text-[#1d1d1f]">Product Price (৳)</label>
              <input
                type="number"
                value={price}
                min={5000}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="mt-1.5 w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[15px] font-semibold focus:outline-none focus:border-[#F27F20]"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#1d1d1f]">Tenor</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TENORS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenor(t)}
                    className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition ${
                      tenor === t ? "border-[#F27F20] text-[#F27F20] bg-orange-50/60" : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {t} Mo
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#1d1d1f]">Bank / Provider</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-[#F27F20]"
              >
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#fff3e8] to-[#fdeee3] rounded-lg p-6 flex flex-col">
            <p className="text-[13px] font-semibold text-gray-600">Estimated Monthly Installment</p>
            <p className="text-[42px] font-black text-[#F27F20] leading-none mt-2">
              ৳ {monthly.toLocaleString("en-US")}
            </p>
            <p className="text-[13px] text-gray-600 mt-1">
              for {tenor} months with {bank}
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-gray-700">
              <li className="flex gap-2"><span className="text-[#39B667]">✓</span> No hidden charges</li>
              <li className="flex gap-2"><span className="text-[#39B667]">✓</span> Instant approval at outlet & online</li>
              <li className="flex gap-2"><span className="text-[#39B667]">✓</span> Credit & debit card both accepted</li>
            </ul>
            <Link href="/category/mobile-phone" className="btn-primary mt-auto pt-3 pb-3 text-center text-[14px] block">
              Shop on EMI
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
