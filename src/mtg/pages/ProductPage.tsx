"use client";
import { useEffect, useState } from "react";
import { track } from "@/mtg/utils/tracking";
import Link from "@/mtg/components/Link";

/** Reports a product_view analytics event (safe to render anywhere). */
function TrackProductView({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    track("product_view", { label: name.slice(0, 200), productSlug: slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return null;
}
import { useParams } from "next/navigation";
import Seo from "@/mtg/components/Seo";
import NotFoundPage from "./NotFoundPage";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import BuyBox from "@/mtg/components/product/BuyBox";
import DetailTabs from "@/mtg/components/product/DetailTabs";
import RelatedRow from "@/mtg/components/RelatedRow";
import Img from "@/mtg/components/Img";
import ZoomImage from "@/mtg/components/ZoomImage";
import RecentlyViewed, { RecordView } from "@/mtg/components/RecentlyViewed";
import { allProducts } from "@/mtg/data/catalog";
import { extraCategories } from "@/mtg/data/extraCatalog";

export default function ProductDetailPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const { slug = "" } = (useParams() as { slug: string });
  const product = allProducts.find((x) => x.slug === slug);
  if (!product) return <NotFoundPage />;

  /* breadcrumb: prefer the real category this product was listed under */
  const owner = extraCategories.find((c) => c.items.some((it) => it.id === product.id));
  const crumb = owner
    ? { href: `/category/${owner.slug}`, label: owner.title }
    : /iphone|galaxy|redmi|note|moto|pixel/.test(product.name.toLowerCase())
    ? { href: "/category/mobile-phone", label: "Mobile Phone" }
    : { href: "/category/gadgets-accessories", label: "Gadgets & Accessories" };

  /* related: same category first, then the rest of the catalog */
  const sameCat = owner ? owner.items.filter((x) => x.id !== product.id) : [];
  const others = allProducts.filter((x) => x.id !== product.id && !sameCat.some((s) => s.id === x.id));
  const related = [...sameCat, ...others].slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${product.name} Price in Bangladesh | Mr Tom Gadgets`}
        description={`Buy ${product.name} at the best price in Bangladesh. Genuine product with official warranty, EMI up to 36 months, exchange offer and fastest home delivery from Mr Tom Gadgets.`}
      />
      <Header />

      <div className="max-w-[1300px] mx-auto px-4 pt-4">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <Link href={crumb.href} className="hover:text-[#F27F20]">
            {crumb.label}
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f] truncate max-w-[220px]">{product.brand ?? product.name}</span>
        </nav>
      </div>

      {/* ---- gallery + buy box ---- */}
      <div className="max-w-[1300px] mx-auto px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <ZoomImage src={photo ?? product.img} alt={product.name} gallery={photo ? undefined : product.gallery} />
        </div>

        <BuyBox product={product} onPhoto={setPhoto} />
      </div>

      {/* ---- tabs + recently viewed (real, from localStorage) ---- */}
      <RecordView slug={product.slug} />
      <TrackProductView slug={product.slug} name={product.name} />
      <div className="max-w-[1300px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        <DetailTabs product={product} />
        <RecentlyViewed current={product.slug} />
      </div>

      {/* ---- Vertech / AG computers promo banner ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pb-10">
        <Link
          href="/category/desktop"
          className="relative block rounded-lg overflow-hidden h-[150px] sm:h-[190px] bg-gradient-to-r from-[#eef4fb] via-[#e9f1fb] to-[#dbe7f6] group"
        >
          <Img
            src="/img/crops/computers-2.jpg"
            alt="Mr Tom Computers"
            className="absolute right-0 inset-y-0 w-[55%] h-full object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute inset-y-0 left-0 w-[50%] flex items-center justify-center">
            <div className="text-center border-y-2 border-[#5b4bd5]/40 py-3 px-10">
              <p className="text-[15px] font-semibold text-[#1d1d1f]">Vertech এখন</p>
              <p className="text-[24px] font-extrabold text-[#1d1d1f] flex items-center justify-center gap-1">
                <span className="text-[#F27F20] font-black">AG</span> computers
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ---- related ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pb-12">
        <RelatedRow items={related} />
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
