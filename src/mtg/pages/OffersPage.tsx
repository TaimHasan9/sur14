"use client";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import Countdown from "@/mtg/components/Countdown";
import Img from "@/mtg/components/Img";

interface Campaign {
  title: string;
  href: string;
  hours: number;
  art: { bg: string; kicker: string; big: string; sub?: string; img: string; badges?: string[] };
}

const CAMPAIGNS: Campaign[] = [
  {
    title: "AC Fest – Save Flat ৳2,000",
    href: "/category/air-conditioner",
    hours: 12.23,
    art: {
      bg: "bg-gradient-to-br from-[#0d2b6b] via-[#123a8a] to-[#0a1f52]",
      kicker: "AC কিনালেই",
      big: "৳2,000",
      sub: "ডিসকাউন্ট",
      img: "/img/crops/appliances-4.jpg",
      badges: ["Free Delivery", "Free Installation"],
    },
  },
  {
    title: "Enjoy Special Offers on Home Security",
    href: "/category/security-networking",
    hours: 227.2,
    art: {
      bg: "bg-gradient-to-br from-[#0a1a3c] via-[#10265c] to-[#081430]",
      kicker: "Smarter Vision. Stronger Protection.",
      big: "TK.2,550",
      sub: "Starts From",
      img: "/img/crops/computers-2.jpg",
    },
  },
  {
    title: "MacBook Mania – Up to ৳30,000 OFF",
    href: "/category/macbook",
    hours: 36.5,
    art: {
      bg: "bg-gradient-to-br from-[#1d1d1f] via-[#2b2b30] to-[#141416]",
      kicker: "The Mac Deal You Wanted",
      big: "৳30,000",
      sub: "Maximum Discount",
      img: "/img/crops/computers-4.jpg",
      badges: ["*T&C Apply"],
    },
  },
  {
    title: "AirPods Pro Week – Flat ৳2,001 OFF",
    href: "/category/airpods",
    hours: 72.75,
    art: {
      bg: "bg-gradient-to-br from-[#eef3fb] via-[#e4ecf8] to-[#d8e4f5]",
      kicker: "Pro Sound. Pro Price.",
      big: "৳2,001",
      sub: "Flat OFF",
      img: "/img/crops/earbuds-2.jpg",
    },
  },
  {
    title: "Fan Festival – Starting at ৳400",
    href: "/category/charger-fan",
    hours: 48.1,
    art: {
      bg: "bg-gradient-to-br from-[#0e7a4f] via-[#12915f] to-[#0a5c3c]",
      kicker: "গরমে স্বস্তি",
      big: "৳400",
      sub: "থেকে শুরু",
      img: "/img/crops/fans-2.jpg",
    },
  },
  {
    title: "Smart TV Bonanza – Save ৳22,001",
    href: "/category/tv",
    hours: 96.4,
    art: {
      bg: "bg-gradient-to-br from-[#4a1070] via-[#5c1489] to-[#360b52]",
      kicker: "Cinema at Home",
      big: "৳22,001",
      sub: "Maximum OFF",
      img: "/img/crops/appliances-2.jpg",
    },
  },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Header />

      <div className="max-w-[1300px] mx-auto px-4 pt-8 pb-4">
        <h1 className="text-[38px] sm:text-[52px] font-black text-[#1d1d1f] leading-none">Latest Offers</h1>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CAMPAIGNS.map((c) => (
            <div key={c.title} className="bg-white rounded-md shadow-[0_2px_14px_rgba(0,0,0,0.06)] p-5 flex flex-col">
              {/* campaign art */}
              <Link href={c.href} className={`relative block rounded-sm overflow-hidden h-[300px] ${c.art.bg}`}>
                <Img
                  src={c.art.img}
                  alt={c.title}
                  className="absolute right-0 bottom-0 w-[62%] h-[78%] object-contain opacity-95 drop-shadow-2xl"
                />
                <div className="absolute inset-0 p-6 flex flex-col">
                  <p className="text-[14px] font-semibold italic text-white/90">{c.art.kicker}</p>
                  <p className="mt-2 inline-block w-fit bg-[#F27F20] text-white px-4 py-2 rounded-md">
                    {c.art.sub && <span className="block text-[10px] font-semibold leading-none mb-1">{c.art.sub}</span>}
                    <span className="block text-[30px] font-black leading-none text-[#FFEB3B]">{c.art.big}</span>
                  </p>
                  {c.art.badges && (
                    <div className="mt-auto flex gap-2">
                      {c.art.badges.map((b) => (
                        <span key={b} className="text-[10px] font-bold bg-white/95 text-[#0d2b6b] px-2.5 py-1.5 rounded-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z"/></svg>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>

              <h2 className="text-[22px] font-medium text-[#1d1d1f] text-center leading-snug mt-5 mb-4">{c.title}</h2>

              <Countdown hoursFromNow={c.hours} />

              <Link href={c.href} className="btn-primary w-full py-3 text-[14px] mt-4 text-center block">
                View Details
              </Link>
            </div>
          ))}
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between mt-10 border-t border-gray-200 pt-6">
          <button className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-md px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:border-gray-400 transition">
            ← Previous
          </button>
          <span className="w-9 h-9 bg-[#F27F20] text-white rounded-md flex items-center justify-center text-[13px] font-bold">1</span>
          <button className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-md px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:border-gray-400 transition">
            Next →
          </button>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
