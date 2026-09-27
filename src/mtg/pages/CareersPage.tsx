"use client";

import { useState } from "react";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";

const JOBS = [
  ["Sales Executive", "Bashundhara City, Dhaka", "Full-time"],
  ["Gadget Technician", "Mr Tom Care, Bashundhara City", "Full-time"],
  ["Digital Marketing Executive", "Head Office, Dhaka", "Full-time"],
  ["Customer Support Agent", "Hotline Team", "Shift"],
  ["Warehouse Officer", "Mirpur DOHS", "Full-time"],
];

export default function CareersPage() {
  const [applied, setApplied] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Careers</span>
        </nav>
        <h1 className="text-[30px] sm:text-[40px] font-black text-[#16243d]">Careers at Mr Tom Gadgets</h1>
        <p className="text-[14px] text-gray-500 mt-1">Grow with Bangladesh&apos;s most loved tech retail brand.</p>

        <div className="mt-8 space-y-3">
          {JOBS.map(([role, loc, type]) => (
            <div key={role} className="border border-gray-100 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#F27F20]/40 transition">
              <div>
                <p className="text-[16px] font-extrabold text-[#16243d]">{role}</p>
                <p className="text-[12.5px] text-gray-500 mt-0.5">{loc} · {type}</p>
              </div>
              {applied === role ? (
                <span className="text-[13px] font-bold text-[#39B667]">Applied ✓</span>
              ) : (
                <button onClick={() => setApplied(role)} className="btn-primary px-6 py-2.5 text-[13px] shrink-0">Apply Now</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
