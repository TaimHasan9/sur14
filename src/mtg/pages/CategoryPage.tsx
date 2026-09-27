"use client";
import Link from "@/mtg/components/Link";
import Seo from "@/mtg/components/Seo";
import { useParams } from "next/navigation";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import CatalogView from "@/mtg/components/CatalogView";
import Img from "@/mtg/components/Img";
import { allProducts, categoryTiles } from "@/mtg/data/catalog";
import { getCategoryMeta, getSeoBlocks, getFaq } from "@/mtg/data/categoryMeta";
import { extraBySlug, extraItemsFor } from "@/mtg/data/extraCatalog";

/* map every nav / tile slug to a product-name matcher */
const R = {
  phones: /iphone|galaxy s|galaxy a|moto g|redmi 13|note 60/i,
  tabs: /tab s10|ipad/i,
  laptops: /macbook|laptop|notebook|nitro|aspire|inspiron|vostro|thinkpad|ideapad|legion|loq|victus|pavilion|omen|envy|probook|qbits|vivobook|zenbook|rog/i,
  desktop: /rtx|geforce|processor|ryzen|intel core|motherboard|nvme|sn580|ripjaws|cooler|power supply|casing|keyboard|mouse/i,
  audio: /buds|bullets|speaker|headphone|ear \(a\)|wh-ch520|flip 7/i,
  watches: /watch/i,
  appliances: /fryer|led tv|google tv|smart tv|blender|microwave|rice cooker|induction|kitchen hood|power station/i,
  fans: /fan/i,
  acc: /esr|case|trimmer/i,
};

const SLUG_MAP: Record<string, RegExp> = {
  "mobile-phone": R.phones,
  iphone: /iphone/i,
  samsung: /samsung|galaxy/i,
  google: /pixel/i,
  motorola: /moto/i,
  xiaomi: /redmi|xiaomi|mijia/i,
  honor: /honor/i,
  oneplus: /oneplus/i,
  iqoo: /iqoo/i,
  realme: /realme/i,
  phones: R.phones,
  "phone-cover": R.acc,
  "screen-protector": R.acc,
  "camera-protector": R.acc,
  "cover-cases": R.acc,
  "screen-protectors": R.acc,
  accessories: R.acc,
  ipad: R.tabs,
  "tablet-accessories": R.tabs,
  "xiaomi-pad": R.tabs,
  "samsung-tab": R.tabs,
  "amazon-tab": R.tabs,
  "honor-tab": R.tabs,
  "smart-pen": /pen/i,
  "hubs-docks": /mouse|keyboard|hub/i,
  desktop: R.desktop,
  "brand-pc": R.desktop,
  "all-in-one-pc": R.desktop,
  "mini-pc": R.desktop,
  "computer-components": R.desktop,
  motherboard: R.desktop,
  gaming: R.laptops,
  ultrabook: R.laptops,
  "business-class": R.laptops,
  macbook: R.laptops,
  imac: R.laptops,
  "mac-studio": R.laptops,
  laptop: R.laptops,
  audio: R.audio,
  airpods: R.audio,
  earpods: R.audio,
  "airpods-max": R.audio,
  "cover-protectors": R.acc,
  cables: /cable/i,
  chargers: /charger/i,
  adapter: /adapter|charger/i,
  "apple-adapter": /adapter|charger/i,
  "iphone-charger": /adapter|charger|cable/i,
  multiplugs: /plug|adapter/i,
  "power-bank": /power bank/i,
  "smart-tag": /tag|watch/i,
  "wireless-charger": /charger/i,
  "car-accessories": /car|case/i,
  "smart-tv-box": /tv/i,
  projector: /projector|tv/i,
  drone: /drone|camera/i,
  "gadgets-accessories": /buds|watch|fan|speaker|earbuds/i,
  "home-appliances": R.appliances,
  appliances: R.appliances,
  "air-conditioner": /air conditioner/i,
  clock: R.watches,
  "refrigerator-freezer": /refrigerator|fryer/i,
  "washing-machine": /washing|fryer/i,
  "solar-panel": /solar|power station/i,
  "charger-fan": R.fans,
  "water-purifier": /purifier|fryer/i,
  geyser: /geyser|fryer/i,
  "room-heater": /heater|fryer/i,
  iron: /iron|fryer/i,
  watch: R.watches,
  "smart-band": R.watches,
  "watch-accessories": R.watches,
  lifestyle: /fan|watch|bag/i,
  "action-camera": /camera/i,
  umbrella: /umbrella|fan/i,
  trimmer: /trimmer/i,
  "hair-dryer": /dryer|fan/i,
  straightener: /straightener|trimmer/i,
  bag: /bag|case/i,
  "wifi-router": /router|casing/i,
  starlink: /router|casing/i,
  nas: /nas|casing/i,
  "ip-camera": /camera/i,
  "wifi-camera": /camera/i,
  "hd-camera": /camera/i,
  nvr: /nvr|camera/i,
  dvr: /dvr|camera/i,
  "security-camera-package": /camera/i,
  "security-networking": /router|camera|casing/i,
  "apple-products": /iphone|ipad|macbook|watch|airpods|imac|mac mini|mac studio|airtag|apple/i,
  /* ---- extra slugs from the live mega-menu ---- */
  nothing: /nothing/i,
  huawei: /huawei/i,
  oppo: /oppo/i,
  vivo: /vivo/i,
  nokia: /nokia/i,
  asus: /asus|rog|zenbook|vivobook|tuf/i,
  msi: /msi/i,
  "tripod-monopod": /tripod|monopod|gimbal|selfie stick/i,
  gimbal: /gimbal|osmo mobile|smooth|tripod/i,
  "vacuum-cleaner": /vacuum|robot cleaner|mop/i,
  lighting: /light|lamp|bulb|led strip/i,
  "smart-scale": /scale|weight/i,
  "security-camera-accessories": /camera|cable|nvr|dvr|adapter/i,
  "access-control": /access|lock|door|attendance|camera/i,
  "hubs-and-docks": /hub|dock|mouse|keyboard/i,
  cable: /cable/i,
  router: /router|wifi|wi-fi|mesh|deco/i,
  tablet: /tab s10|tab s9|tab a9|ipad|pad|tablet/i,
  laptops: /macbook|laptop|notebook|nitro|aspire|inspiron|vostro|thinkpad|ideapad|legion|loq|victus|pavilion|omen|envy|probook|qbits|vivobook|zenbook|rog/i,
  "kitchen-appliances": /fryer|blender|grinder|microwave|oven|rice cooker|induction|hood|kettle|stove|toaster|juicer|chopper/i,
  tv: /\btv\b|television|google tv|smart tv|qled|oled/i,
  "power-station": /power station|river|delta|hithium|ecoflow|bluetti|jackery/i,
  "mac-mini": /mac mini/i,
  "apple-watch": /apple watch|watch ultra|watch series|watch se/i,
  airtag: /airtag|air tag|smart tag/i,
  speakers: /speaker|flip|charge|clip|go 4|boombox|soundbar/i,
  headphone: /headphone|wh-|over-ear|headset/i,
  "smart-watch": /watch|band/i,
};

function titleFromSlug(slug: string) {
  const extra = extraBySlug[slug];
  if (extra) return extra.title;
  const tile = categoryTiles.find((c) => c.slug === slug);
  if (tile) return tile.name;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CategoryPage() {
  const { slug = "" } = (useParams() as { slug: string });
  const title = titleFromSlug(slug);
  const extra = extraBySlug[slug];
  const baseMeta = getCategoryMeta(slug, title);
  const matcher = SLUG_MAP[slug];

  /* regex matches from the homepage catalog + real scraped products for this category (deduped) */
  const regexItems = matcher ? allProducts.filter((p) => matcher.test(p.name)) : allProducts.filter((p) => p.slug.startsWith(slug));
  const scraped = extraItemsFor(slug);
  const seen = new Set<number>();
  /* exact scraped category → show exactly what the real listing shows; parent/alias categories → merge both */
  const items = (extra ? scraped : [...regexItems, ...scraped]).filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  /* brand filter should list the brands that actually exist in this listing */
  const brandOptions = Array.from(new Set(items.map((p) => p.brand).filter((b): b is string => !!b)));
  const meta = {
    ...baseMeta,
    banner: extra ? { ...baseMeta.banner, title: extra.title, tagline: extra.tagline } : baseMeta.banner,
    filters: brandOptions.length
      ? baseMeta.filters.map((g) => (g.title === "Brands" ? { ...g, options: brandOptions, searchable: brandOptions.length > 6 } : g))
      : baseMeta.filters,
  };
  const seo = getSeoBlocks(title);
  const faq = getFaq(title);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${title} Price in Bangladesh | Mr Tom Gadgets`}
        description={`Latest ${title} collection in Bangladesh with official warranty, EMI & home delivery. Compare prices and buy online from Mr Tom Gadgets.`}
      />
      <Header />

      {/* ---- category banner ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pt-4">
        {extra?.banner && (
          /* real full-width listing banner from applegadgetsbd.com (1500×323) */
          <div className="hidden md:block relative rounded-2xl overflow-hidden bg-[#f5f5f7] mb-4" style={{ paddingBottom: "21.5%" }}>
            <Img src={extra.banner} alt={`${title} banner`} loading="eager" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
        <div className={`relative rounded-lg overflow-hidden ${meta.banner.bg} h-[160px] sm:h-[220px] ${extra?.banner ? "md:hidden" : ""}`}>
          <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-14 gap-4">
            <div className="max-w-[60%]">
              <h2 className="text-[24px] sm:text-[40px] font-extrabold leading-tight text-[#1d1d1f]">{meta.banner.title}</h2>
              <p className="text-[13px] sm:text-[16px] text-gray-600 mt-1">{meta.banner.tagline}</p>
            </div>
            {meta.banner.img && (
              <Img src={meta.banner.img} alt={title} className="h-[85%] w-auto max-w-[45%] object-contain mix-blend-multiply drop-shadow-xl" />
            )}
          </div>
        </div>
      </div>

      {/* ---- breadcrumb + title ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pt-4">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">{title}</span>
        </nav>
        <h1 className="text-[30px] sm:text-[38px] font-extrabold text-[#16243d] mt-2">{title}</h1>
      </div>

      {/* ---- filters + listing (working sort & filters) ---- */}
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <CatalogView key={slug} items={items} groups={meta.filters} />
      </div>

      {/* ---- SEO content ---- */}
      <div className="max-w-[1300px] mx-auto px-4 pb-10 space-y-7">
        {seo.map((b) => (
          <section key={b.h2}>
            <h2 className="text-[22px] sm:text-[27px] font-extrabold text-[#16243d] mb-3">{b.h2}</h2>
            {b.paras.map((p, i) => (
              <p key={i} className="text-[14px] leading-relaxed text-gray-600 mb-3">{p}</p>
            ))}
            {b.bullets && (
              <ul className="space-y-2 mt-3">
                {b.bullets.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[13.5px] text-gray-600">
                    <span className="text-gray-300 mt-0.5">•</span>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#16243d] mb-4">FAQ</h2>
          <div className="space-y-4">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#16243d]">{f.q}</h3>
                <p className="text-[13.5px] text-gray-600 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
