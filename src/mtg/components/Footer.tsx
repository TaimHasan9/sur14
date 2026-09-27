"use client";
import Link from "@/mtg/components/Link";
import { Logo } from "./Header";

const locations = [
  ["Mr Tom Gadgets - Basement 2, Shop 26, Bashundhara City Shopping Complex", "Basement 2, Shop 26"],
  ["Mr Tom Gadgets - Level-5, Block-A, Shop-6, 7, 8, Bashundhara City Shopping Complex", "Level-5, Block- A, Shop- 6, 7, 8"],
  ["Mr Tom Gadgets - Level 4, Zone A (West Court), Shop 280, Jamuna Future Park", "Level 4, Zone A (West Court), Shop 280"],
  ["Mr Tom Computers - Level 5, Shop 545-546, Multiplan Center, New Elephant Road, Dhaka", "Level- 5, Shop- 545-546"],
  ["Mr Tom Care | Bashundhara City Shopping Complex", "Level- 5, Block- B, Shop- 07"],
];

const aboutUs = ["About Us", "Corporate", "Order Tracking", "Blog", "Press Coverage", "Careers", "Complaint / Advice", "Contact Us", "FAQs"];
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ABOUT_OVERRIDE: Record<string, string> = {
  Blog: "/blog",
  "Order Tracking": "/track-order",
  Careers: "/careers",
  "Contact Us": "/contact",
};
const policies = ["Privacy Policy", "EMI and Payment Policy", "Warranty Policy", "Exchange Policy", "Delivery Policy", "Pre-Order Policy", "Refund Policy", "Return Policy"];

const linkColumns: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "MOBILE PHONES", links: [
    { label: "iPhone", href: "/category/iphone" }, { label: "Samsung", href: "/category/samsung" },
    { label: "Google", href: "/category/google" }, { label: "Motorola", href: "/category/mobile-phone" },
    { label: "Xiaomi", href: "/category/xiaomi" }, { label: "iQOO", href: "/category/iqoo" },
    { label: "Vivo", href: "/category/mobile-phone" }, { label: "Infinix", href: "/category/mobile-phone" },
    { label: "Honor", href: "/category/honor" }, { label: "OnePlus", href: "/category/mobile-phone" },
    { label: "Tablet", href: "/category/tablet-accessories" } ] },
  { title: "MOBILE ACCESSORIES", links: [
    { label: "AirPods", href: "/category/airpods" }, { label: "Earphone", href: "/category/earpods" },
    { label: "Neckband", href: "/category/airpods" }, { label: "Headphone", href: "/category/headphone" },
    { label: "Phone Cooler", href: "/category/gadgets-accessories" }, { label: "Mobile Charger", href: "/category/chargers" },
    { label: "Smart Watch", href: "/category/smart-watch" }, { label: "Phone Cover", href: "/category/phone-cover" },
    { label: "Power Bank", href: "/category/power-bank" }, { label: "Wireless Charger", href: "/category/wireless-charger" },
    { label: "JBL Speakers", href: "/category/speakers" } ] },
  { title: "TRENDING", links: [
    { label: "Laptop Bag", href: "/category/bag" }, { label: "Backpack", href: "/category/bag" },
    { label: "Travel Bag", href: "/category/bag" }, { label: "Curved Display Phone", href: "/category/mobile-phone" },
    { label: "Gaming Phone", href: "/category/mobile-phone" }, { label: "Charger Fan", href: "/category/charger-fan" },
    { label: "15000-20000 Price Range", href: "/price/15000-20000" }, { label: "10000-15000 Price Range", href: "/price/10000-15000" },
    { label: "20000-25000 Price Range", href: "/price/20000-25000" }, { label: "20000-30000 Price Range", href: "/price/20000-30000" } ] },
  { title: "BEST-SELLING", links: [
    { label: "MacBook", href: "/category/macbook" }, { label: "iMac", href: "/category/imac" },
    { label: "Folding Phone", href: "/category/samsung" }, { label: "CC Camera", href: "/category/security-camera-package" },
    { label: "Earbuds", href: "/category/airpods" }, { label: "Xiaomi Pad", href: "/category/xiaomi-pad" },
    { label: "Gaming Earphone", href: "/category/airpods" }, { label: "iPad", href: "/category/ipad" },
    { label: "Arctic Hunter Bag", href: "/category/bag" } ] },
  { title: "HOME-APPLIANCES", links: [
    { label: "Home Appliances", href: "/category/home-appliances" }, { label: "Smart Lighting", href: "/category/home-appliances" },
    { label: "Smart TV", href: "/category/tv" }, { label: "Android TV", href: "/category/tv" },
    { label: "Air Conditioner", href: "/category/air-conditioner" }, { label: "Gree Air Conditioner", href: "/category/air-conditioner" } ] },
  { title: "TOP-BRANDS", links: [
    { label: "Apple", href: "/brand/apple" }, { label: "Samsung", href: "/brand/samsung" },
    { label: "Honor", href: "/brand/honor" }, { label: "Gratmo", href: "/brand/gratmo" },
    { label: "JBL", href: "/brand/jbl" }, { label: "QCY", href: "/brand/qcy" },
    { label: "Amazfit", href: "/brand/amazfit" }, { label: "Anker", href: "/brand/anker" },
    { label: "Baseus", href: "/brand/baseus" } ] },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0c] text-white mt-14 relative overflow-hidden">
      {/* ---- main footer ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pt-12 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* brand */}
        <div>
          <Logo />
          <ul className="mt-5 space-y-3 text-[13px] text-gray-300">
            <li className="flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 text-[#F27F20]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span>
                <span className="block text-gray-500 text-[11px]">Phone Number</span>
                09678148148
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="w-4 h-4 mt-0.5 text-[#F27F20]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>
                <span className="block text-gray-500 text-[11px]">Email Address</span>
                contact@mrtomgadgets.com
              </span>
            </li>
          </ul>
          <div className="flex gap-2.5 mt-5">
            <a href="#" className="flex items-center gap-2 border border-gray-700 rounded-md px-3 py-1.5 hover:border-[#F27F20] transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              <span className="leading-none text-left">
                <span className="block text-[8px] text-gray-400">Download on the</span>
                <span className="block text-[12px] font-semibold">App Store</span>
              </span>
            </a>
            <a href="#" className="flex items-center gap-2 border border-gray-700 rounded-md px-3 py-1.5 hover:border-[#F27F20] transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.6 1.8L13.7 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1zm11.5 8.8l2.6-2.6 3.5 2c.8.5.8 1.5 0 2l-3.5 2-2.6-2.6zm-1 1l-9 9 12-6.9-3-2.1zm0-2l3-2.1L5.1 1l9 8.6z"/></svg>
              <span className="leading-none text-left">
                <span className="block text-[8px] text-gray-400">GET IT ON</span>
                <span className="block text-[12px] font-semibold">Google Play</span>
              </span>
            </a>
          </div>
        </div>

        {/* locations */}
        <div>
          <h4 className="text-[12px] font-bold tracking-wider text-gray-400 mb-4">LOCATION</h4>
          <ul className="space-y-3.5">
            {locations.map(([main, sub]) => (
              <li key={main} className="flex items-start gap-2.5 text-[12.5px] leading-snug">
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#F27F20]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-200">
                  {main}
                  <span className="block text-gray-500 text-[11px] mt-0.5">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* about */}
        <div>
          <h4 className="text-[12px] font-bold tracking-wider text-gray-400 mb-4">ABOUT US</h4>
          <ul className="space-y-2.5">
            {aboutUs.map((l) => (
              <li key={l}>
                <Link href={ABOUT_OVERRIDE[l] ?? `/info/${slugify(l)}`} className="text-[13.5px] font-medium text-gray-300 hover:text-[#F27F20] transition">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* policy */}
        <div>
          <h4 className="text-[12px] font-bold tracking-wider text-gray-400 mb-4">POLICY</h4>
          <ul className="space-y-2.5">
            {policies.map((l) => (
              <li key={l}>
                <Link href={`/info/${slugify(l)}`} className="text-[13.5px] font-medium text-gray-300 hover:text-[#F27F20] transition">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- copyright bar ---- */}
      <div className="border-t border-white/10">
        <div className="max-w-[1300px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400">
            © 2026 Mr Tom Gadgets. All Rights Reserved.{" "}
            <span className="text-gray-500">
              Developed by <a href="#" className="text-[#F27F20] font-semibold hover:underline">Nextlab</a>
            </span>{" "}
            <span className="inline-flex items-center gap-1 rounded-full border border-[#39B667]/40 bg-[#39B667]/10 px-2 py-0.5 text-[11px] font-bold text-[#7ce3a3]" title="Lazy-loaded images, zero heavy libraries, minimal carbon per visit">
              🌱 Eco-optimized
            </span>
          </p>
          <div className="flex items-center gap-2.5">
            <a href="#" className="flex items-center gap-1.5 bg-[#25D366] text-white text-[11px] font-bold px-3 py-1.5 rounded-full hover:brightness-110 transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm5.4 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-2.9-1.3-4.8-4.2-4.9-4.4-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1s.8-.9 1-1.2c.2-.3.4-.2.7-.1s1.7.8 2 1c.3.1.5.2.6.4 0 .1 0 .6-.2 1.2z"/></svg>
              WhatsApp
            </a>
            {["facebook", "instagram", "linkedin", "youtube"].map((s) => (
              <a key={s} href="#" aria-label={s} className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-300 hover:border-[#F27F20] hover:text-[#F27F20] transition">
                {s === "facebook" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>
                )}
                {s === "instagram" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.8a6 6 0 100 12 6 6 0 000-12zm0 2.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6zm6.2-2.5a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"/></svg>
                )}
                {s === "linkedin" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6.9 8.5H3.7V20h3.2V8.5zM5.3 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.3 13.4c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V8.5H10V20h3.2v-6.1c0-1.6.3-3.1 2.2-3.1 1.9 0 1.9 1.8 1.9 3.2V20h3.2v-6.6z"/></svg>
                )}
                {s === "youtube" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23 12s0-3.8-.5-5.6c-.3-1-1.1-1.8-2.1-2.1C18.6 3.8 12 3.8 12 3.8s-6.6 0-8.4.5c-1 .3-1.8 1.1-2.1 2.1C1 8.2 1 12 1 12s0 3.8.5 5.6c.3 1 1.1 1.8 2.1 2.1 1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5c-1 .3 1.8-1.1 2.1-2.1.5-1.8.5-5.6.5-5.6zM9.8 15.5v-7l6 3.5-6 3.5z"/></svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ---- mega link columns ---- */}
      <div className="bg-[#050506] border-t border-white/5">
        <div className="max-w-[1300px] mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h5 className="text-[11px] font-bold tracking-wider text-gray-500 mb-3">{col.title}</h5>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[12.5px] text-gray-400 hover:text-[#F27F20] transition leading-snug block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* watermark */}
       
      </div>
    </footer>
  );
}
