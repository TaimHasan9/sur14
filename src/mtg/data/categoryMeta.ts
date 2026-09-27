/* Per-category banner / filter / SEO metadata replicating applegadgetsbd.com listing pages */
// banner images use local cutouts with remote fallback (see IMG_FALLBACK)

export interface FilterGroup {
  title: string;
  options: string[];
  searchable?: boolean;
}

export interface CatMeta {
  banner: { bg: string; dark?: boolean; title: string; tagline: string; img?: string };
  filters: FilterGroup[];
}

const brandsApple: FilterGroup = { title: "Brands", options: ["Apple"] };

const specific: Record<string, CatMeta> = {
  iphone: {
    banner: { bg: "bg-gradient-to-r from-[#f3e7dc] via-[#f8efe7] to-[#fdf6f0]", title: "The Latest.", tagline: "Take a look at what's new, right now.", img: "/img/crops/earbuds-2.jpg" },
    filters: [
      { title: "Series", options: ["17 Series", "16 Series", "15 Series", "14 Series", "13 Series", "Air Series"], searchable: true },
      { title: "Display Size", options: ["6.1 - 6.4 Inch", "6.5 - 6.9 Inch"] },
      { title: "Storage", options: ["128GB", "256GB", "512GB", "1TB & Above"] },
      { title: "Processor", options: ["A Series Bionic", "A Pro Series Bionic"] },
      { title: "Battery Capacity", options: ["2000 - 2999mAh", "3000 - 3999mAh", "4000 - 4999mAh", "5000mAh & Above"] },
      brandsApple,
    ],
  },
  ipad: {
    banner: { bg: "bg-gradient-to-r from-[#dceafd] via-[#e7f0fe] to-[#f2f7ff]", title: "iPad", tagline: "Lovable. Drawable. Magical.", img: "/img/crops/watches-1.jpg" },
    filters: [
      { title: "Display Size", options: ["8 - 9 inch", "9.1 - 10 inch", "10.1 - 11 inch", "11.1 - 13 inch"] },
      { title: "RAM", options: ["4GB", "8GB", "6GB", "12GB & Above"] },
      { title: "Storage", options: ["64GB", "128GB", "256GB", "512GB & Above"] },
      { title: "Processor", options: ["M Series (M1, M2, M3, M4)", "Bionic (A12 to above)"] },
      { title: "Connectivity", options: ["Wi-Fi + Cellular / LTE / 5G", "Wi-Fi"] },
      brandsApple,
    ],
  },
  macbook: {
    banner: { bg: "bg-gradient-to-r from-[#e3f1fb] via-[#eef6fd] to-[#f7fbff]", title: "Macbook", tagline: "Built for Apple Intelligence", img: "/img/crops/computers-4.jpg" },
    filters: [
      { title: "Storage", options: ["8/256 GB", "8/512 GB", "16/256 GB", "16/512 GB", "24/512 GB", "16/1 TB", "24/1 TB"], searchable: true },
      { title: "Size", options: ["13 Inch", "14 Inch", "15 Inch", "16 Inch"] },
      { title: "Series", options: ["Neo Series", "Air Series", "Pro Series"] },
      { title: "Processor", options: ["M1 Chip", "M2 Chip", "M3 Chip", "M4 Chip", "M5 Chip", "M4 Pro Chip", "M5 Pro Chip", "M5 Max Chip"], searchable: true },
      brandsApple,
    ],
  },
  airpods: {
    banner: { bg: "bg-gradient-to-r from-[#e8f0fb] via-[#f0f5fc] to-[#f8fbff]", title: "AirPods", tagline: "Iconic. Now supersonic.", img: "/img/crops/earbuds-3.jpg" },
    filters: [
      { title: "Series", options: ["Regular Series", "Pro Series"] },
      { title: "Connector Type", options: ["Type C", "Lightning", "Wireless (MagSafe/Qi)"] },
      { title: "Model/Generation", options: ["1st Gen", "2nd Gen", "3rd Gen", "4th Gen"] },
      brandsApple,
    ],
  },
  earpods: {
    banner: { bg: "bg-gradient-to-r from-[#e6eefb] via-[#eef4fc] to-[#f7faff]", title: "EarPods", tagline: "Feel Every Beat", img: "/img/crops/earbuds-4.jpg" },
    filters: [brandsApple],
  },
  "airpods-max": {
    banner: { bg: "bg-gradient-to-r from-[#ece9f7] via-[#f1eef9] to-[#f8f6fc]", title: "The ultimate over-ear listening experience.", tagline: "AirPods Max", img: "/img/crops/earbuds-1.jpg" },
    filters: [brandsApple],
  },
  "mac-studio": {
    banner: { bg: "bg-gradient-to-r from-[#efeff2] via-[#f4f4f6] to-[#fafafa]", title: "Mac Studio", tagline: "More power to you.", img: "/img/crops/computers-2.jpg" },
    filters: [
      { title: "Processor", options: ["M3 Ultra", "M4 Max"] },
      { title: "RAM", options: ["24GB", "36GB", "48GB", "64GB"] },
      { title: "Storage", options: ["512GB", "1TB", "2TB", "4TB"] },
      brandsApple,
    ],
  },
  imac: {
    banner: { bg: "bg-gradient-to-r from-[#f5ede6] via-[#f9f2ec] to-[#fdf9f5]", title: "iMac", tagline: "Brilliant.", img: "/img/crops/computers-1.jpg" },
    filters: [
      { title: "Size", options: ["24 inch"] },
      { title: "Processor", options: ["M4 Chip"] },
      { title: "Storage", options: ["8/256 GB", "8/512 GB", "16/256 GB", "16/512 GB", "24/512 GB", "16/1 TB", "24/1 TB"], searchable: true },
      brandsApple,
    ],
  },
};

export function getCategoryMeta(slug: string, title: string): CatMeta {
  if (specific[slug]) return specific[slug];
  return {
    banner: {
      bg: "bg-gradient-to-r from-[#fff3e8] via-[#fff8f1] to-[#fffdfb]",
      title,
      tagline: "Genuine products at the best price in Bangladesh.",
    },
    filters: [{ title: "Brands", options: ["Apple", "Samsung", "Xiaomi"] }],
  };
}

/* ---------- SEO content template (like the long articles on the real site) ---------- */
export interface SeoBlock {
  h2: string;
  paras: string[];
  bullets?: string[];
}

export function getSeoBlocks(title: string): SeoBlock[] {
  return [
    {
      h2: `${title} Price in Bangladesh`,
      paras: [
        `Looking for the latest ${title} price in Bangladesh? Mr Tom Gadgets brings you 100% genuine ${title} products with official warranty, competitive pricing and fast home delivery. Whether you shop online or visit our outlets at Bashundhara City, Jamuna Future Park or Multiplan Center, you always get the best deal.`,
        `Our ${title} collection is carefully curated so that every budget finds a perfect match. From entry-level options to premium flagship models, everything is available in one trusted place.`,
      ],
    },
    {
      h2: `Why Buy ${title} from Mr Tom Gadgets?`,
      paras: [
        `Mr Tom Gadgets is one of the largest gadget retail chains in Bangladesh. Every ${title} product sold here is authentic, MFI/officially certified where applicable, and backed by reliable after-sales support.`,
      ],
      bullets: [
        "100% genuine products with official warranty",
        "EMI facility up to 36 months with leading banks",
        "Fastest home delivery across Bangladesh",
        "Exchange facility & dedicated after-sales service",
        "Easy returns and transparent refund policy",
      ],
    },
    {
      h2: `How to Choose the Right ${title}?`,
      paras: [
        `Before buying, consider your usage, budget and ecosystem. Check the specifications table on every product page, compare models with our Compare tool, and read customer reviews. If you are still confused, our experts are available on WhatsApp and at every outlet to help you pick the perfect ${title}.`,
      ],
    },
  ];
}

export function getFaq(title: string): { q: string; a: string }[] {
  return [
    { q: `Where can I buy original ${title} in Bangladesh?`, a: `You can buy original ${title} from Mr Tom Gadgets online or from our physical outlets in Dhaka. Every product comes with proper authenticity and warranty.` },
    { q: `What is the ${title} price in Bangladesh?`, a: `The price depends on model, configuration and ongoing offers. Check the listing above for the live price with discounts and EMI options.` },
    { q: `Do you provide warranty and after-sales service?`, a: `Yes. All products come with official brand warranty plus our dedicated after-sales service and exchange facility.` },
    { q: `Is EMI available on ${title}?`, a: `Yes, EMI is available for orders above ৳ 5,000 with up to 36 months tenor from leading banks and card providers.` },
  ];
}
