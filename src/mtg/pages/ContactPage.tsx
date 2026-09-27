"use client";

import { useState } from "react";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";

const OUTLETS = [
  ["Mr Tom Gadgets - Basement 2, Shop 26", "Bashundhara City Shopping Complex"],
  ["Mr Tom Gadgets - Level-5, Block-A, Shop-6, 7, 8", "Bashundhara City Shopping Complex"],
  ["Mr Tom Gadgets - Level 4, Zone A (West Court), Shop 280", "Jamuna Future Park"],
  ["Mr Tom Computers - Level 5, Shop 545-546", "Multiplan Center, New Elephant Road, Dhaka"],
  ["Mr Tom Care", "Bashundhara City Shopping Complex, Level-3, Block-B, Shop-07"],
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "Sales Inquiry", message: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Contact Us</span>
        </nav>
        <h1 className="text-[30px] sm:text-[40px] font-black text-[#16243d]">Contact Us</h1>
        <p className="text-[14px] text-gray-500 mt-1">Hotline: <b className="text-[#F27F20]">09678148148</b> · Email: contact@mrtomgadgets.com · Sat–Thu, 11AM–10PM</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="border border-gray-200 rounded-lg p-6 space-y-4"
          >
            <h3 className="text-[17px] font-bold text-[#16243d]">Send us a message</h3>
            {sent ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-[15px] font-bold text-[#16243d]">Message sent!</p>
                <p className="text-[13px] text-gray-500 mt-1">Our support team will reply within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your Name" className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]" />
                  <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" placeholder="Mobile Number" className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]" />
                </div>
                <input required value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="Email Address" className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]" />
                <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] text-gray-600 focus:outline-none focus:border-[#F27F20]">
                  <option>Sales Inquiry</option>
                  <option>Order Support</option>
                  <option>Warranty / Service</option>
                  <option>Complaint</option>
                  <option>Corporate / Bulk</option>
                </select>
                <textarea required value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} placeholder="Your Message" className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]" />
                <button disabled={busy} className="btn-primary w-full py-3 text-[14px] disabled:opacity-60">{busy ? "Sending..." : "Send Message"}</button>
              </>
            )}
          </form>

          <div className="space-y-3">
            <h3 className="text-[17px] font-bold text-[#16243d]">Our Outlets</h3>
            {OUTLETS.map(([main, sub]) => (
              <div key={main} className="flex gap-3 border border-gray-100 rounded-lg p-4 hover:border-[#F27F20]/40 transition">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#F27F20]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-[14px] font-bold text-[#1d1d1f]">{main}</p>
                  <p className="text-[12.5px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
