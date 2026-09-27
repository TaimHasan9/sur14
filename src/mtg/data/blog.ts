import { pexelsUrl as u } from "./catalog";

export interface Post {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  img: string;
  body: string[];
}

export const BLOG_TAGS = [
  "Techtrends",
  "Tech Tutorials",
  "Product Review",
  "Comparisons",
  "Buying Guides",
  "Newsroom",
  "বাংলা ব্লগ",
];

export const posts: Post[] = [
  {
    slug: "iphone-18-pro-max-design",
    title: "iPhone 18 Pro Max Design – Brand New Changes!",
    date: "September 7, 2026",
    tag: "Techtrends",
    img: u(18311092),
    excerpt: "Apple is making some notable changes for the upcoming top-tier iPhone 18 Pro Max design. From current 17 Pro Max's looks, users might expect noticeable differences in terms of weight...",
    body: [
      "Apple is making some notable changes for the upcoming top-tier iPhone 18 Pro Max design. From the current 17 Pro Max's looks, users might expect noticeable differences in terms of weight, camera plateau and antenna lines.",
      "Leaks suggest a slimmer camera plateau, ceramic shield 3 on both sides and a new vapour chamber cooling system for sustained A20 Pro performance.",
      "At Mr Tom Gadgets we will bring the iPhone 18 series with official warranty and pre-order facility — stay tuned to this blog for the latest price updates in Bangladesh.",
    ],
  },
  {
    slug: "best-wireless-gaming-mouse",
    title: "5 Best Wireless Gaming Mouse in Bangladesh",
    date: "September 7, 2026",
    tag: "Buying Guides",
    img: u(12877898),
    excerpt: "Wireless gaming mouse feel normal now. No cable pulling your hand mid-game. No tangle under the desk. Just smooth movement and quick response. Gamers still check a few things before...",
    body: [
      "Wireless gaming mice feel completely normal now. No cable pulling your hand mid-game, no tangle under the desk — just smooth movement and quick response.",
      "Our top 5 picks: Logitech G Pro X Superlight 2, Razer Viper V3 Pro, SteelSeries Aerox 5, Asus ROG Harpe Ace and Micropack MP-752W for budget buyers.",
      "Check sensor (26K+ DPI), weight (under 60g), battery (90+ hours) and switch rating before buying. All of these are available at Mr Tom Computers, Multiplan Center.",
    ],
  },
  {
    slug: "best-monitors-under-10k",
    title: "5 Best Monitors Under 10k in BD- Affordable Picks for Work, Study & Gaming",
    date: "September 6, 2026",
    tag: "Buying Guides",
    img: u(9646752),
    excerpt: "A few years ago, buying a monitor under ৳10,000 in Bangladesh often meant settling for a low-resolution display, washed-out colors, and noticeable eye strain after extended use. Fortunately, the market...",
    body: [
      "A few years ago, buying a monitor under ৳10,000 in Bangladesh often meant settling for a low-resolution display, washed-out colors and noticeable eye strain after extended use.",
      "Fortunately the market has changed: 24\" IPS 100Hz panels from Xiaomi, Vision, AOC and HP now start below ৳9,500 with flicker-free and low-blue-light certification.",
      "For study and office work pick 24\" IPS 100Hz; for budget gaming pick 24\" VA 165Hz. Visit any Mr Tom Gadgets outlet to see them side by side before buying.",
    ],
  },
  {
    slug: "iphone-18-pro-max-camera-redesign",
    title: "iPhone 18 Pro Max Camera Redesign: What Could Change?",
    date: "September 3, 2026",
    tag: "Techtrends",
    img: u(11120516),
    excerpt: "Apple has kept iPhone's rear camera design mostly same since iPhone 14 Pro. That pattern may finally break with iPhone 18 Pro Max. Several reports this year point to an...",
    body: [
      "Apple has kept the iPhone's rear camera design mostly the same since iPhone 14 Pro. That pattern may finally break with iPhone 18 Pro Max.",
      "Several reports this year point to a variable-aperture main sensor (f/1.4-f/2.8), a periscope telephoto with 6x optical zoom and an AI-tuned dual-LED flash module.",
      "If true, this will be the biggest camera jump since the introduction of Night Mode — and Bangladesh pricing is expected to start at ৳1,65,000 for 256GB.",
    ],
  },
  {
    slug: "processor-generations-explained",
    title: "What are Processor Generations? Intel & AMD Processor Generations Explained",
    date: "September 3, 2026",
    tag: "Tech Tutorials",
    img: u(14887613),
    excerpt: "Currently, there are two types of processors available in the market. You can either choose Intel or AMD, and do remember that both of them are great options. Although have...",
    body: [
      "Currently there are two types of processors available in the market — Intel and AMD — and both of them are great options, although their naming schemes confuse many buyers.",
      "Intel: in 'Core i5-14600K', 14 = generation, 600 = SKU, K = unlocked. AMD: in 'Ryzen 7 7800X3D', 7 = generation (Zen 4), 800 = tier, X3D = 3D V-Cache for gaming.",
      "Rule of thumb: newer generation beats higher tier of an older one for efficiency and iGPU performance. Our Mr Tom Computers team can build a balanced PC for any budget.",
    ],
  },
  {
    slug: "iphone-18-pro-max-battery",
    title: "Apple iPhone 18 Pro Max Battery – Big News Ahead!",
    date: "September 2, 2026",
    tag: "Techtrends",
    img: u(29765803),
    excerpt: "Apple has been consistent during these last few years in terms of providing a good battery life for all of their iPhones lineups. And as the new iPhone is on...",
    body: [
      "Apple has been consistent during these last few years in terms of providing good battery life for all of their iPhone lineups. And as the new iPhone is on the way, the battery story gets even better.",
      "Supply-chain reports mention a 5,100 mAh stacked-cell battery with silicon-carbon anode — the largest ever in an iPhone — plus 45W wired charging.",
      "That should comfortably deliver 2 days of mixed use, finally matching the best Android flagships sold at our outlets today.",
    ],
  },
  {
    slug: "kom-dame-valo-monitor",
    title: "কম দামে ভালো মনিটর | বাজেটের মধ্যে সেরা ৭টি অপশন",
    date: "September 2, 2026",
    tag: "বাংলা ব্লগ",
    img: u(20140155),
    excerpt: "একটি ভালো মনিটর শুধু একটা স্ক্রিন নয়, এটি আপনার প্রতিদিনের কাজ, পড়াশোনা কিংবা গেমিং এক্সপেরিয়েন্সকে সম্পূর্ণভাবে বদলে দিতে পারে। অফিসের কাজ, ভিডিও এডিটিং, অনলাইন ক্লাস কিংবা হাই-এন্ড গেমিং — প্রতিটি...",
    body: [
      "একটি ভালো মনিটর শুধু একটা স্ক্রিন নয়, এটি আপনার প্রতিদিনের কাজ, পড়াশোনা কিংবা গেমিং এক্সপেরিয়েন্সকে সম্পূর্ণভাবে বদলে দিতে পারে।",
      "বাজেটের মধ্যে সেরা ৭টি: Xiaomi 24\" IPS 100Hz, Vision V241, AOC 24G4, HP P24v, Samsung T350, LG 24MR400 এবং Asus VA24EQ।",
      "কেনার আগে প্যানেল টাইপ (IPS), রিফ্রেশ রেট (১০০Hz+), VESA মাউন্ট আর ওয়ারেন্টি অবশ্যই চেক করে নিবেন — Mr Tom Gadgets এ সব মনিটরে অফিসিয়াল ওয়ারেন্টিসহ ফ্রি ডেলিভারি।",
    ],
  },
  {
    slug: "top-5-gas-stoves",
    title: "Top 5 best gas stoves in Bangladesh",
    date: "September 1, 2026",
    tag: "Buying Guides",
    img: u(36573009),
    excerpt: "Nowadays, the most important kitchen companion in every home is a gas stove. Because the cooking process cannot be completed without it. It's so important that every house has it,...",
    body: [
      "Nowadays, the most important kitchen companion in every home is a gas stove — the cooking process simply cannot be completed without it.",
      "Top 5 picks: Vision VGS-202 (double burner), Marcel MG-212, Samsung built-in hob, Rinnai AI-202E and Walton WGS-105 for small kitchens.",
      "Look for brass burner, toughened glass top and auto-ignition. All models at Mr Tom Gadgets come with free installation inside Dhaka.",
    ],
  },
  {
    slug: "computer-monitor-dust-protection",
    title: "কম্পিউটারের মনিটর দ্রুত ময়লা হওয়ার কারণ ও সমাধান!",
    date: "August 31, 2026",
    tag: "বাংলা ব্লগ",
    img: u(12880803),
    excerpt: "আমরা দিনের অনেকটা সময় কম্পিউটারের সামনে কাটাই। কাজ, পড়াশোনা কিংবা বিনোদন, সবকিছুতেই মনিটর ব্যবহার করি। নিয়মিত পরিষ্কার না করলে স্ক্রিনে ধুলা, আঙুলের ছাপ ও বিভিন্ন ধরনের দাগ জমে যায়। এতে...",
    body: [
      "আমরা দিনের অনেকটা সময় কম্পিউটারের সামনে কাটাই। নিয়মিত পরিষ্কার না করলে স্ক্রিনে ধুলা, আঙুলের ছাপ ও বিভিন্ন ধরনের দাগ জমে যায়।",
      "সমাধান: মাইক্রোফাইবার কাপড় + ডিস্টিল্ড ওয়াটার/স্ক্রিন ক্লিনার স্প্রে; কখনও সরাসরি তরল স্ক্রিনে দেবেন না, কাপড়ে নিয়ে মুছুবেন।",
      "সপ্তাহে একবার পরিষ্কার আর মনিটর কভার ব্যবহার করলে প্যানেল দীর্ঘদিন নতুনের মতো থাকবে।",
    ],
  },
  {
    slug: "air-cooler-health-safe",
    title: "এয়ারকুলার ব্যবহার স্বাস্থ্যের জন্য নিরাপদ না ক্ষতিকারক?",
    date: "August 30, 2026",
    tag: "বাংলা ব্লগ",
    img: u(35240184),
    excerpt: "গরমের মৌসুমে ঘরকে ঠান্ডা রাখতে অনেকেই এয়ারকুলার ব্যবহার করেন। সঠিকভাবে ব্যবহার করলে এয়ারকুলার সাধারণত স্বাস্থ্যের জন্য ক্ষতিকারক নয়। তবে, কুলার যদি অপরিষ্কার থাকে, পুরনো পানি ব্যবহার করা হয়, অতিরিক্ত আর্দ্রতা হয়,...",
    body: [
      "গরমের মৌসুমে ঘরকে ঠান্ডা রাখতে অনেকেই এয়ারকুলার ব্যবহার করেন। সঠিকভাবে ব্যবহার করলে এয়ারকুলার সাধারণত স্বাস্থ্যের জন্য ক্ষতিকারক নয়।",
      "তবে কুলার অপরিষ্কার থাকলে, পুরনো পানি ব্যবহার করলে বা অতিরিক্ত আর্দ্রতা হলে ঠান্ডা-কাশির সমস্যা বাড়াতে পারে।",
      "প্রতি সপ্তাহে পানি বদলান, ফিল্টার ধুয়ে নিন এবং ঘরে হালকা বাতাস চলাচল রাখুন — তাহলে এয়ারকুলার একদম নিরাপদ।",
    ],
  },
  {
    slug: "airpods-pro-3-review",
    title: "AirPods Pro 3 Review — The Best ANC Earbuds Yet?",
    date: "August 28, 2026",
    tag: "Product Review",
    img: u(3394650),
    excerpt: "After two weeks of daily use — gym, calls, flights — the AirPods Pro 3 proves why it is the benchmark of TWS earbuds. ANC is 2x stronger than Pro 2 and the new heart-rate...",
    body: [
      "After two weeks of daily use — gym, calls, flights — the AirPods Pro 3 proves why it remains the benchmark of TWS earbuds.",
      "ANC is measurably 2x stronger than Pro 2, the new heart-rate sensor works with Fitness app, and battery now reaches 8 hours per charge.",
      "Verdict: at ৳25,999 in Bangladesh it is the easiest recommendation for iPhone users. Available at all Mr Tom Gadgets outlets with official warranty.",
    ],
  },
  {
    slug: "macbook-air-m4-vs-macbook-pro-m4",
    title: "MacBook Air M4 vs MacBook Pro M4 — Which One Should You Pick?",
    date: "August 25, 2026",
    tag: "Comparisons",
    img: u(18311088),
    excerpt: "Same chip family, different mission. The Air M4 is the best-value Mac for students and creators-on-the-go, while the Pro M4 adds XDR display, active cooling and longer sustained...",
    body: [
      "Same chip family, different mission. The MacBook Air M4 is the best-value Mac for students and creators-on-the-go.",
      "The Pro M4 adds a 120Hz XDR display, active cooling for sustained renders, more ports and up to 22-hour battery — worth the ৳60,000 premium only if you export daily.",
      "Quick rule: editing occasionally → Air M4 16/512; editing daily → Pro M4. Both available with 36-month EMI at Mr Tom Gadgets.",
    ],
  },
];
