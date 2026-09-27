"use client";
import Seo from "@/mtg/components/Seo";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import HeroSlider from "@/mtg/components/HeroSlider";
import FeaturesStrip from "@/mtg/components/FeaturesStrip";
import CategoryGrid from "@/mtg/components/CategoryGrid";
import ProductCarousel from "@/mtg/components/ProductCarousel";
import ExchangeBanner from "@/mtg/components/ExchangeBanner";
import InfoGrid from "@/mtg/components/InfoGrid";
import ChatWidget from "@/mtg/components/ChatWidget";
import Reveal from "@/mtg/components/Reveal";
import AppleExclusive from "@/mtg/components/AppleExclusive";
import SeoArticle from "@/mtg/components/SeoArticle";
import {
  exclusiveDeals,
  agComputers,
  featuredProducts,
  newArrival,
  fans,
  homeAppliances,
  topBrands,
} from "@/mtg/data/catalog";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Smartphones, Gadgets & Premium Accessories | Mr Tom Gadgets"
        description="Bangladesh's trusted tech & lifestyle e-commerce store. Genuine iPhone, MacBook, iPad, Apple Watch, AirPods, Samsung, home appliances & accessories with official warranty, EMI and fastest home delivery."
      />
      <Header />

      <HeroSlider />

      <Reveal>
        <FeaturesStrip />
      </Reveal>

      <Reveal>
        <CategoryGrid />
      </Reveal>

      <Reveal>
        <AppleExclusive />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "exclusive", title: "Exclusive", highlight: "Deals", items: exclusiveDeals }} />
      </Reveal>

      <Reveal>
        <ExchangeBanner />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "agc", title: "Mr Tom", highlight: "Computers", tabs: agComputers }} />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "featured", title: "Featured", highlight: "Products", tabs: featuredProducts }} />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "new", title: "New", highlight: "Arrival", tabs: newArrival }} />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "fans", title: "Rechargeable", highlight: "Fan", items: fans }} />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "appliances", title: "Home", highlight: "Appliances", tabs: homeAppliances }} />
      </Reveal>

      <Reveal>
        <ProductCarousel section={{ key: "brands", title: "Top Brand", highlight: "Products", tabs: topBrands }} />
      </Reveal>

      <Reveal>
        <InfoGrid />
      </Reveal>

      <SeoArticle />

      <Footer />
      <ChatWidget />
    </div>
  );
}
