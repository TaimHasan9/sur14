/* Catalog data mirroring the Mr Tom Gadgets BD homepage layout.
   ALL images are remote CDN URLs so the project works anywhere (zip/local/preview). */

import { extraProducts, extraBySlug } from "./extraCatalog";
import {
  appleExclusive,
  realExclusiveDeals,
  realFans,
  realAgComputers,
  realFeaturedProducts,
  realNewArrival,
  realHomeAppliances,
  realTopBrands,
  realCategoryTiles,
  realHeaderMenus,
} from "./realHome";

export const pexelsUrl = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

const u = pexelsUrl;

export interface Crop {
  size: string;
  pos: string;
}

export interface P {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  img: string;
  crop?: Crop;
  hot?: boolean;
  brand?: string;
  /** extra photos from the live site (product gallery) */
  gallery?: string[];
  /** "pre-order" for upcoming products */
  status?: "pre-order" | "in-stock";
  color?: string;
  colorCode?: string;
}

export interface Tab {
  label: string;
  items: P[];
}

export interface SectionDef {
  key: string;
  title: string;
  highlight: string;
  tabs?: Tab[];
  items?: P[];
}

const PX = {
  phoneDark: u(18311092),
  phoneColor: u(9403817),
  phoneCam: u(11120516),
  phonePink: u(29765803),
  phonesMany: u(36680544),
  tablet: u(12716745),
  tabletKb: "/img/crops/watches-3.jpg",
  lapFlat: u(18311088),
  lapDesk: u(2657669),
  hpWhite: "/img/crops/earbuds-1.jpg",
  hpWhite2: "/img/crops/earbuds-2.jpg",
  hpWhite3: "/img/crops/earbuds-3.jpg",
  watchWhite: "/img/crops/watches-1.jpg",
  watchOrange: "/img/crops/watches-2.jpg",
  spk: "/img/crops/watches-4.jpg",
  spkDark: u(31592148),
  flat1: u(3568521),
  flat2: u(4765366),
  kbMouse: "/img/crops/computers-3.jpg",
  deck: u(14005916),
  desk: "/img/crops/computers-4.jpg",
  circuit: "/img/crops/computers-1.jpg",
  sdcard: "/img/crops/computers-2.jpg",
  earModel: "/img/crops/earbuds-4.jpg",
  kitchen1: "/img/crops/fans-3.jpg",
  kitchen2: "/img/crops/fans-2.jpg",
  kitchen3: "/img/crops/fans-1.jpg",
  kitchen4: "/img/crops/fans-4.jpg",
  tv: u(9646752),
  power: "/img/banner-power.jpg",
  handPhone: u(8833425),
};

let uid = 1;
const p = (name: string, price: number, img: string, extra: Partial<P> = {}): P => ({
  id: uid++,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  price,
  img,
  ...extra,
});

/* ---------------- Exclusive Deals ---------------- */
export const sampleExclusiveDeals: P[] = [
  p("MacBook Neo", 87999, PX.lapFlat, { brand: "Apple" }),
  p("Galaxy S26 Ultra 5G", 114999, PX.phoneDark, { oldPrice: 117000, brand: "Samsung" }),
  p("iPhone 17 Pro Max", 154999, PX.phoneColor, { oldPrice: 158000, brand: "Apple" }),
  p("Galaxy S25 Ultra 5G", 98999, PX.phoneCam, { oldPrice: 101000, brand: "Samsung" }),
  p("Apple iPhone 15 128GB", 95999, PX.phonesMany, { oldPrice: 98000, brand: "Apple" }),
  p("iPhone 13 128GB Official", 65999, PX.phonePink, { oldPrice: 68000, brand: "Apple" }),
];

/* ---------------- Mr Tom Computers ---------------- */
const gpu1 = p("Manli Nebula GeForce RTX 5090 8GB GDDR6 Graphics Card", 43000, PX.circuit, { brand: "Manli" });
const gpu2 = p("MSI GeForce RTX 5060 Ti 8G VENTUS 2X PLUS 8GB Graphics Card", 72900, PX.sdcard, { brand: "MSI" });
const mouseV = p("Micropack MP-V03W Ergo Lift Wireless Vertical Mouse", 1990, PX.kbMouse, { brand: "Micropack" });
const mouseG = p("Micropack MP-752W Speedy Pro Wireless Mouse", 1190, PX.kbMouse, { brand: "Micropack" });
const kb1 = p("Micropack Mecha MK-87 RGB Mechanical Keyboard", 11990, PX.desk, { brand: "Micropack" });

export const sampleAgComputers: Tab[] = [
  { label: "Hot Deals", items: [gpu1, gpu2, mouseV, mouseG, kb1] },
  { label: "CPU", items: [p("Intel Core i5-14600K Processor", 32500, PX.sdcard, { brand: "Intel" }), p("AMD Ryzen 7 7800X3D Processor", 42900, PX.sdcard, { brand: "AMD" })] },
  { label: "Motherboard", items: [p("ASUS TUF GAMING B760M-PLUS WiFi", 18900, PX.circuit, { brand: "ASUS" }), p("MSI PRO B650M-A WiFi Motherboard", 16500, PX.circuit, { brand: "MSI" })] },
  { label: "SSD", items: [p("Samsung 990 PRO 1TB NVMe SSD", 21000, PX.sdcard, { brand: "Samsung" }), p("Western Digital Blue SN580 1TB SSD", 12500, PX.sdcard, { brand: "WD" })] },
  { label: "Casing", items: [p("Antec NX410 Mid Tower Gaming Casing", 6500, PX.deck, { brand: "Antec" })] },
  { label: "RAM", items: [p("G.Skill Ripjaws V 16GB 3200MHz RAM", 9800, PX.sdcard, { brand: "G.Skill" })] },
  { label: "CPU Cooler", items: [p("DeepCool AK400 Digital CPU Cooler", 4200, PX.circuit, { brand: "DeepCool" })] },
  { label: "Power Supply", items: [p("Corsair CV650 650W 80+ Bronze PSU", 7900, PX.circuit, { brand: "Corsair" })] },
  { label: "Graphics Card", items: [gpu1, gpu2] },
  { label: "Mouse", items: [mouseV, mouseG] },
  { label: "Keyboard", items: [kb1] },
];

/* ---------------- Featured Products ---------------- */
export const sampleFeaturedProducts: Tab[] = [
  {
    label: "BEST DEALS",
    items: [
      p("Galaxy Tab S10 FE", 45499, PX.tablet, { oldPrice: 48000, brand: "Samsung" }),
      p("Galaxy Tab S10 Lite", 37499, PX.tabletKb, { brand: "Samsung" }),
      p("iPad Air M4 - 2026", 93999, PX.tablet, { brand: "Apple" }),
      p("iPad Pro M5 2025", 148999, PX.tabletKb, { brand: "Apple" }),
      p("MacBook Pro 14 M4", 198100, PX.lapFlat, { brand: "Apple" }),
    ],
  },
  {
    label: "TOP SELLING",
    items: [
      p("iPad Air M4 - 2026", 93999, PX.tablet, { brand: "Apple" }),
      p("Galaxy Tab S10 FE", 45499, PX.tablet, { oldPrice: 48000, brand: "Samsung" }),
      p("MacBook Air 13 M3", 149999, PX.lapDesk, { oldPrice: 169999, brand: "Apple" }),
      p("Galaxy Tab S10 Lite", 37499, PX.tabletKb, { brand: "Samsung" }),
    ],
  },
];

/* ---------------- New Arrival ---------------- */
export const sampleNewArrival: Tab[] = [
  {
    label: "Gadgets",
    items: [
      p("Redmi Watch Move AMOLED Bluetooth Calling", 2750, PX.watchWhite, { brand: "Redmi" }),
      p("realme Buds Air 8 Pro ANC TWS Earbuds", 9499, PX.hpWhite, { brand: "realme" }),
      p("OnePlus Nord Buds 4 Pro ANC TWS Earbuds", 4750, PX.hpWhite2, { oldPrice: 6000, brand: "OnePlus" }),
      p("Anker Soundcore R60i NC TWS Earbuds", 3099, PX.hpWhite3, { oldPrice: 3500, brand: "Anker" }),
      p("QCY Melobuds Pro ANC Earbuds", 2540, PX.earModel, { oldPrice: 3000, brand: "QCY" }),
    ],
  },
  {
    label: "Device",
    items: [
      p("Redmi 13C 8/256GB Official", 11999, PX.phonesMany, { brand: "Xiaomi" }),
      p("Samsung Galaxy A16 5G", 18499, PX.phoneCam, { brand: "Samsung" }),
      p("realme Note 60x 4/64GB", 10999, PX.phonePink, { brand: "realme" }),
      p("iPhone 16e 128GB Official", 82999, PX.phoneDark, { brand: "Apple" }),
    ],
  },
];

/* ---------------- Rechargeable Fan ---------------- */
export const sampleFans: P[] = [
  p("Xundd XDOT-06S Folding High Speed Handheld Fan", 1950, PX.kitchen3, { oldPrice: 2290, brand: "Xundd" }),
  p("Xiaomi Solove F5 Pro 5W 4000mAh Rechargeable Fan", 3000, PX.kitchen2, { brand: "Xiaomi" }),
  p("Hoco HX602 Portable Handheld Fan", 1100, PX.kitchen1, { brand: "Hoco" }),
  p("JYSUPER JY-2320 Portable Handheld Mini Fan with LED", 400, PX.kitchen4, { brand: "JYSUPER" }),
  p("WIWU Cooling Turbo Handheld Fan", 1800, PX.kitchen3, { oldPrice: 2100, brand: "WIWU" }),
];

/* ---------------- Home Appliances ---------------- */
const fryerL = p("Philips NA231 Air Fryer - 6.2L", 12500, "/img/crops/appliances-1.jpg", { oldPrice: 16000, hot: true, brand: "Philips" });
const fryerS = p("PHILIPS NA120/00 Air Fryer 4.2L", 7600, "/img/crops/appliances-3.jpg", { oldPrice: 12000, hot: true, brand: "Philips" });
const tv65 = p('TCL 65C6K5 65" Premium QD-Mini LED TV', 123999, "/img/crops/appliances-2.jpg", { oldPrice: 146000, brand: "TCL" });
const tv32 = p("Haier H32S80GFX 32 Inch QLED FHD Android Google TV", 27999, "/img/crops/appliances-4.jpg", { oldPrice: 29000, brand: "Haier" });
const tv4k = p("TOSHIBA 55 Inch 4K Ultra HD Smart TV", 89500, "/img/crops/appliances-2.jpg", { oldPrice: 94000, brand: "Toshiba" });

export const sampleHomeAppliances: Tab[] = [
  { label: "Hot Deals", items: [fryerL, fryerS, tv65, tv32, tv4k] },
  { label: "Air Fryer", items: [fryerL, fryerS] },
  { label: "Mixer Grinder & Blender", items: [p("Philips HR2041 Blender 2L 450W", 4500, "/img/crops/appliances-3.jpg", { brand: "Philips" })] },
  { label: "Microwave Oven", items: [p("Sharp R-2100 Microwave Oven 20L", 12000, "/img/crops/appliances-3.jpg", { brand: "Sharp" })] },
  { label: "Air Conditioner", items: extraBySlug["air-conditioner"]?.items.slice(0, 6) ?? [] },
  { label: "Rice Cooker", items: [p("Xiaomi Mijia Smart Rice Cooker 3L", 3900, "/img/crops/appliances-1.jpg", { brand: "Xiaomi" })] },
  { label: "Power Station", items: [p("EcoFlow RIVER 2 Pro Power Station", 89000, PX.power, { oldPrice: 95000, brand: "EcoFlow" })] },
  { label: "Induction Cooker", items: [p("Philips HD4928 Induction Cooker", 3500, "/img/crops/appliances-3.jpg", { brand: "Philips" })] },
  { label: "Kitchen Hood", items: [p("Vision Premium Kitchen Hood 90cm", 15500, "/img/crops/appliances-3.jpg", { brand: "Vision" })] },
];

/* ---------------- Top Brand Products ---------------- */
const watchUltra = p("Apple Watch Ultra 3", 97500, PX.watchOrange, { oldPrice: 105000, brand: "Apple" });
const watchGalaxy = p("Galaxy Watch Ultra - 2025", 41500, PX.watchWhite, { oldPrice: 46500, brand: "Samsung" });
const bulletsZ3 = p("OnePlus Bullets Wireless Z3", 2000, PX.hpWhite2, { brand: "OnePlus" });
const jblFlip = p("JBL Flip 7 Portable Wireless Speaker", 12000, PX.spk, { brand: "JBL" });
const ankerPc = p("Anker Soundcore P20i TWS Earbuds", 5900, PX.hpWhite3, { oldPrice: 7500, brand: "Anker" });

export const sampleTopBrands: Tab[] = [
  { label: "All", items: [watchUltra, watchGalaxy, bulletsZ3, jblFlip, ankerPc, p("Redmi Watch Move", 2750, PX.watchWhite, { brand: "Xiaomi" }), p("Sony WH-CH520 Headphone", 6500, PX.hpWhite, { brand: "Sony" }), p("QCY Melobuds Pro", 2540, PX.earModel, { oldPrice: 3000, brand: "QCY" })] },
  { label: "Apple", items: [watchUltra] },
  { label: "Samsung", items: [watchGalaxy] },
  { label: "Xiaomi", items: [p("Redmi Watch Move", 2750, PX.watchWhite, { brand: "Xiaomi" })] },
  { label: "JBL", items: [jblFlip] },
  { label: "Anker", items: [ankerPc] },
  { label: "Nothing", items: [p("Nothing Ear (a) TWS Earbuds", 12500, PX.hpWhite2, { brand: "Nothing" })] },
  { label: "Sony", items: [p("Sony WH-CH520 Headphone", 6500, PX.hpWhite, { brand: "Sony" })] },
  { label: "Motorola", items: [p("Motorola moto g54 5G", 18999, PX.phonesMany, { brand: "Motorola" })] },
  { label: "OnePlus", items: [bulletsZ3] },
  { label: "Panasonic", items: [p("Panasonic ER-GB42 Trimmer", 2800, PX.hpWhite3, { brand: "Panasonic" })] },
  { label: "Philips", items: [fryerS] },
  { label: "ESR", items: [p("ESR MagSafe Phone Case", 1800, PX.flat2, { brand: "ESR" })] },
  { label: "QCY", items: [p("QCY Melobuds Pro", 2540, PX.earModel, { oldPrice: 3000, brand: "QCY" })] },
];

/* ---------------- Featured Categories (16 tiles) ---------------- */
export interface CatTile {
  name: string;
  slug: string;
  img: string;
  crop?: Crop;
}

export const sampleCategoryTiles: CatTile[] = [
  { name: "Mobile Phone", slug: "mobile-phone", img: PX.phoneCam },
  { name: "Home Appliances", slug: "home-appliances", img: "/img/crops/appliances-1.jpg" },
  { name: "Tablet & Accessories", slug: "tablet-accessories", img: PX.tablet },
  { name: "Laptop", slug: "laptop", img: PX.lapFlat },
  { name: "Airpods", slug: "airpods", img: "/img/crops/earbuds-2.jpg" },
  { name: "Power Bank", slug: "power-bank", img: PX.flat1 },
  { name: "Headphone", slug: "headphone", img: PX.hpWhite },
  { name: "Smart Watch", slug: "smart-watch", img: PX.watchWhite },
  { name: "Speakers", slug: "speakers", img: PX.spk },
  { name: "Motherboard", slug: "motherboard", img: "/img/crops/computers-2.jpg" },
  { name: "Adapter", slug: "adapter", img: PX.flat2 },
  { name: "Cables", slug: "cables", img: PX.kbMouse },
  { name: "Hubs & Docks", slug: "hubs-docks", img: PX.desk },
  { name: "Wi-Fi Router", slug: "wifi-router", img: PX.sdcard },
  { name: "Wireless Charger", slug: "wireless-charger", img: PX.tabletKb },
  { name: "Smart Pen", slug: "smart-pen", img: "/img/crops/computers-4.jpg" },
];

/* ---------------- Hero slides ---------------- */
export interface Slide {
  img: string;
  kicker: string;
  title: string;
  price: string;
  badge?: string;
  dark: boolean;
  href: string;
}

export const heroSlides: Slide[] = [
  { img: "/img/hero-macmini.jpg", kicker: "The Mac Deal You Wanted", title: "Mac Mini M4", price: "95,999", badge: "Mac Mania", dark: true, href: "/category/laptop" },
  { img: "/img/banner-macbook.jpg", kicker: "Color Me Impressed", title: "MacBook Neo", price: "85,999", badge: "New Launch", dark: false, href: "/category/laptop" },
  { img: "/img/banner-airpods.jpg", kicker: "Silence The Noise", title: "AirPods Pro 3", price: "21,999", badge: "Pro Sound", dark: true, href: "/category/airpods" },
  { img: "/img/banner-exchange.jpg", kicker: "Exchange Offer", title: "পুরানো ফোন বদলে নিন", price: "নতুন ফোন", badge: "Exchange Now", dark: false, href: "/exchange" },
  { img: "/img/banner-power.jpg", kicker: "Load Shedding? Not Today", title: "Power Stations", price: "89,000", badge: "In Stock", dark: true, href: "/category/home-appliances" },
  { img: "/img/crops/watches-1.jpg", kicker: "Time To Upgrade", title: "Smart Watch", price: "2,750", badge: "New Arrival", dark: false, href: "/category/smart-watch" },
];

/* ---------------- Header mega-menu — EXACTLY as applegadgetsbd.com ---------------- */
export interface MenuChild {
  label: string;
  href: string;
  nested?: boolean;
}

export interface MenuDef {
  label: string;
  href: string;
  children: MenuChild[];
}

const cat = (s: string) => `/category/${s}`;
const k = (s: string) => cat(s.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

export const sampleHeaderMenus: MenuDef[] = [
  {
    label: "Apple Products",
    href: cat("apple-products"),
    children: [
      { label: "iPhone", href: cat("iphone") },
      { label: "iPad", href: cat("ipad") },
      { label: "MacBook", href: cat("macbook"), nested: true },
      { label: "Mac mini", href: k("Mac mini"), nested: true },
      { label: "Apple Adapter", href: k("Apple Adapter") },
      { label: "AirPods", href: cat("airpods") },
      { label: "EarPods", href: k("EarPods") },
      { label: "Apple Watch", href: cat("apple-watch") },
      { label: "AirTag", href: k("AirTag") },
      { label: "iMac", href: k("iMac"), nested: true },
      { label: "Mac Studio", href: k("Mac Studio") },
      { label: "AirPods Max", href: k("AirPods Max") },
    ],
  },
  {
    label: "Phones",
    href: cat("phones"),
    children: [
      { label: "iPhone", href: cat("iphone") },
      { label: "Samsung", href: cat("samsung") },
      { label: "Google", href: k("Google") },
      { label: "Motorola", href: k("Motorola") },
      { label: "Xiaomi", href: k("Xiaomi") },
      { label: "Phone Cover", href: k("Phone Cover") },
      { label: "Screen Protector", href: k("Screen Protector") },
      { label: "Camera Protector", href: k("Camera Protector") },
      { label: "Honor", href: k("Honor") },
      { label: "OnePlus", href: k("OnePlus") },
      { label: "iqoo", href: k("iqoo") },
      { label: "realme", href: k("realme") },
    ],
  },
  {
    label: "Tablets & Accessories",
    href: cat("tablet-accessories"),
    children: [
      { label: "iPad", href: cat("ipad") },
      { label: "Xiaomi Pad", href: k("Xiaomi Pad") },
      { label: "Samsung Tab", href: k("Samsung Tab") },
      { label: "Amazon Tab", href: k("Amazon Tab") },
      { label: "HONOR Tab", href: k("HONOR Tab") },
      { label: "Smart Pen", href: cat("smart-pen") },
      { label: "Hubs & Docks", href: cat("hubs-docks") },
      { label: "Cover & Cases", href: k("Cover & Cases") },
      { label: "Screen Protectors", href: k("Screen Protectors") },
    ],
  },
  {
    label: "Desktop",
    href: cat("desktop"),
    children: [
      { label: "Brand PC", href: k("Brand PC"), nested: true },
      { label: "All-in-One PC", href: k("All-in-One PC") },
      { label: "Mini PC", href: k("Mini PC") },
      { label: "Computer Components", href: k("Computer Components"), nested: true },
    ],
  },
  {
    label: "Laptops",
    href: cat("laptops"),
    children: [
      { label: "Acer", href: k("Acer") },
      { label: "Asus", href: k("Asus") },
      { label: "Dell", href: k("Dell") },
      { label: "HP", href: k("HP") },
      { label: "Lenovo", href: k("Lenovo") },
      { label: "MSI", href: k("MSI") },
      { label: "Samsung", href: cat("samsung") },
      { label: "Qbits", href: k("Qbits") },
      { label: "Gaming", href: k("Gaming") },
      { label: "Ultrabook", href: k("Ultrabook") },
      { label: "Business Class", href: k("Business Class") },
    ],
  },
  {
    label: "Gadgets & Accessories",
    href: cat("gadgets-accessories"),
    children: [
      { label: "Audio", href: k("Audio"), nested: true },
      { label: "Cover & Protectors", href: k("Cover & Protectors"), nested: true },
      { label: "Cables", href: cat("cables"), nested: true },
      { label: "Chargers", href: k("Chargers") },
      { label: "Power Bank", href: cat("power-bank") },
      { label: "Smart Tag", href: k("Smart Tag") },
      { label: "Wireless Charger", href: cat("wireless-charger") },
      { label: "Multiplugs", href: k("Multiplugs") },
      { label: "Car Accessories", href: k("Car Accessories") },
      { label: "Gaming", href: k("Gaming"), nested: true },
      { label: "Smart TV Box", href: k("Smart TV Box") },
      { label: "Projector", href: k("Projector") },
      { label: "Drone", href: k("Drone") },
    ],
  },
  {
    label: "Appliances",
    href: cat("home-appliances"),
    children: [
      { label: "Kitchen Appliances", href: k("Kitchen Appliances"), nested: true },
      { label: "Air Conditioner", href: k("Air Conditioner"), nested: true },
      { label: "TV", href: k("TV"), nested: true },
      { label: "Clock", href: k("Clock"), nested: true },
      { label: "Refrigerator & Freezer", href: k("Refrigerator & Freezer") },
      { label: "Washing Machine", href: k("Washing Machine") },
      { label: "Power Station", href: k("Power Station") },
      { label: "Solar Panel", href: k("Solar Panel") },
      { label: "Charger Fan", href: k("Charger Fan") },
      { label: "Water Purifier", href: k("Water Purifier") },
      { label: "Geyser", href: k("Geyser") },
      { label: "Room Heater", href: k("Room Heater") },
      { label: "Iron", href: k("Iron") },
    ],
  },
  {
    label: "Lifestyle",
    href: cat("lifestyle"),
    children: [
      { label: "Smart Watch", href: cat("smart-watch"), nested: true },
      { label: "Watch", href: k("Watch"), nested: true },
      { label: "Smart Band", href: k("Smart Band") },
      { label: "Watch Accessories", href: k("Watch Accessories"), nested: true },
      { label: "Action Camera", href: k("Action Camera") },
      { label: "Umbrella", href: k("Umbrella") },
      { label: "Trimmer", href: k("Trimmer") },
      { label: "Hair Dryer", href: k("Hair Dryer") },
      { label: "Straightener", href: k("Straightener") },
      { label: "Bag", href: k("Bag"), nested: true },
    ],
  },
  {
    label: "Security & Networking",
    href: cat("security-networking"),
    children: [
      { label: "Wi-Fi Router", href: cat("wifi-router") },
      { label: "Starlink", href: k("Starlink") },
      { label: "NAS", href: k("NAS") },
      { label: "IP Camera", href: k("IP Camera"), nested: true },
      { label: "WiFi Camera", href: k("WiFi Camera"), nested: true },
      { label: "HD Camera", href: k("HD Camera"), nested: true },
      { label: "NVR", href: k("NVR"), nested: true },
      { label: "DVR", href: k("DVR"), nested: true },
      { label: "Security Camera Package", href: k("Security Camera Package"), nested: true },
    ],
  },
];

/* ---------------- LIVE DATA (applegadgetsbd.com) ---------------- */
export const exclusiveDeals: P[] = realExclusiveDeals;
export const agComputers: Tab[] = realAgComputers;
export const featuredProducts: Tab[] = realFeaturedProducts;
export const newArrival: Tab[] = realNewArrival;
export const fans: P[] = realFans;
export const homeAppliances: Tab[] = realHomeAppliances;
export const topBrands: Tab[] = realTopBrands;
export const categoryTiles: CatTile[] = realCategoryTiles;
export const headerMenus: MenuDef[] = realHeaderMenus;
export { appleExclusive };

export const formatBDT = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

/* flat list of every catalog product (for search + product detail pages) */
export const allProducts: P[] = (() => {
  const seen = new Set<number>();
  const out: P[] = [];
  const push = (item: P) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  };
  appleExclusive.forEach(push);
  exclusiveDeals.forEach(push);
  [...agComputers, ...featuredProducts, ...newArrival, ...homeAppliances, ...topBrands].forEach((t) =>
    t.items.forEach(push)
  );
  fans.forEach(push);
  extraProducts.forEach(push);
  /* hand-written sample catalog last — only slugs that don't already exist */
  const slugs = new Set(out.map((x) => x.slug));
  const pushSample = (item: P) => {
    if (!slugs.has(item.slug)) {
      slugs.add(item.slug);
      push(item);
    }
  };
  sampleExclusiveDeals.forEach(pushSample);
  [...sampleAgComputers, ...sampleFeaturedProducts, ...sampleNewArrival, ...sampleHomeAppliances, ...sampleTopBrands].forEach((t) =>
    t.items.forEach(pushSample)
  );
  sampleFans.forEach(pushSample);
  return out;
})();

/* If a local asset is missing (e.g. stripped zip), silently swap to a remote CDN image */
export const IMG_FALLBACK: Record<string, string> = {
  "/img/hero-macmini.jpg": u(2657669),
  "/img/banner-macbook.jpg": u(18311088),
  "/img/banner-airpods.jpg": u(3394650),
  "/img/banner-exchange.jpg": u(8833425),
  "/img/banner-power.jpg": u(9800022),
  "/img/crops/fans-1.jpg": u(35240184),
  "/img/crops/fans-2.jpg": u(37552794),
  "/img/crops/fans-3.jpg": u(36573009),
  "/img/crops/fans-4.jpg": u(16927367),
  "/img/crops/earbuds-1.jpg": u(3394650),
  "/img/crops/earbuds-2.jpg": u(3394653),
  "/img/crops/earbuds-3.jpg": u(3394648),
  "/img/crops/earbuds-4.jpg": u(3756985),
  "/img/crops/watches-1.jpg": u(12564670),
  "/img/crops/watches-2.jpg": u(31541678),
  "/img/crops/watches-3.jpg": u(12880803),
  "/img/crops/watches-4.jpg": u(29581125),
  "/img/crops/appliances-1.jpg": u(36573009),
  "/img/crops/appliances-2.jpg": u(9646752),
  "/img/crops/appliances-3.jpg": u(37552794),
  "/img/crops/appliances-4.jpg": u(9646752),
  "/img/crops/computers-1.jpg": u(14887613),
  "/img/crops/computers-2.jpg": u(27742572),
  "/img/crops/computers-3.jpg": u(12877898),
  "/img/crops/computers-4.jpg": u(20140155),
};

/** Resolve a local `/img/...` path to its CDN twin so nothing ever 404s
 *  (also used for CSS background-images where <img onError> can't help). */
export const resolveImg = (src: string): string => IMG_FALLBACK[src] ?? src;

/** Neutral inline placeholder shown if even the CDN image fails. */
export const IMG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='#f3f4f6'/><g fill='none' stroke='#c7cbd1' stroke-width='14' stroke-linecap='round' stroke-linejoin='round'><rect x='150' y='170' width='300' height='260' rx='28'/><circle cx='235' cy='250' r='28'/><path d='M170 400l95-95 70 70 55-55 90 90'/></g></svg>`
  );
