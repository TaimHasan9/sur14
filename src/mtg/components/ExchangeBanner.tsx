"use client";
import Link from "@/mtg/components/Link";
import Img from "./Img";
import { exchangeBanner } from "@/mtg/data/realHome";

/* The live site's exchange-offer banner (1500×323) */
export default function ExchangeBanner() {
  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-12">
      <Link href={exchangeBanner.href} className="block relative rounded-2xl overflow-hidden bg-[#FFD401] group" style={{ aspectRatio: "1500 / 323" }}>
        <Img
          src={exchangeBanner.img}
          alt="Exchange offer — পুরানো ফোন বদলে নিন নতুন ফোন"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
        />
      </Link>
    </section>
  );
}
