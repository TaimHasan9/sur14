"use client";

import { useState } from "react";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";

const MODELS = ["iPhone 13", "iPhone 14", "iPhone 15", "Galaxy S22", "Galaxy S23", "MacBook Air M1", "iPad 9th Gen"];
const CONDITIONS = ["Like New", "Good", "Average", "Needs Repair"];

export default function ExchangePage() {
  const [model, setModel] = useState(MODELS[0]);
  const [condition, setCondition] = useState(CONDITIONS[1]);
  const [quote, setQuote] = useState<number | null>(null);

  const calc = (e: React.FormEvent) => {
    e.preventDefault();
    const base: Record<string, number> = {
      "iPhone 13": 38000, "iPhone 14": 48000, "iPhone 15": 62000,
      "Galaxy S22": 26000, "Galaxy S23": 34000, "MacBook Air M1": 55000, "iPad 9th Gen": 22000,
    };
    const mult: Record<string, number> = { "Like New": 1, Good: 0.85, Average: 0.65, "Needs Repair": 0.35 };
    setQuote(Math.round(((base[model] ?? 20000) * (mult[condition] ?? 0.7)) / 500) * 500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Exchange Offer</span>
        </nav>

        <div className="rounded-lg overflow-hidden bg-[#FFD401] px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-[#1d1d1f]">⇄ পুরানো ফোন</p>
            <p className="text-[30px] sm:text-[40px] font-extrabold text-[#1d3557] leading-tight">বদলে নিন</p>
            <p className="text-[16px] font-bold text-[#1d1d1f]">নতুন ফোন!</p>
          </div>
          <p className="text-[14px] font-bold text-[#1d3557] bg-white/80 px-4 py-2 rounded-full">Get up to ৳10,000 OFF</p>
        </div>

        <form onSubmit={calc} className="bg-white border border-gray-200 rounded-lg p-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] font-semibold text-[#1d1d1f]">Your Device</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]">
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-[#1d1d1f]">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]">
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full py-2.5 text-[14px]">Get Estimate</button>
          </div>
        </form>

        {quote !== null && (
          <div className="mt-6 border border-[#39B667]/40 bg-[#39B667]/5 rounded-lg p-6 text-center">
            <p className="text-[14px] text-gray-600">Estimated exchange value of your {model} ({condition})</p>
            <p className="text-[38px] font-black text-[#39B667] mt-1">৳ {quote.toLocaleString("en-US")}</p>
            <p className="text-[12.5px] text-gray-500 mt-2">Final value confirmed after physical inspection at any outlet.</p>
            <Link href="/category/mobile-phone" className="btn-primary inline-block px-8 py-3 text-[14px] mt-4">Exchange Now</Link>
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
