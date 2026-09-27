export const seedCategories = [
  { name: "Fashion", nameBn: "ফ্যাশন", slug: "fashion", description: "পাঞ্জাবি, শাড়ি, থ্রি-পিস ও আধুনিক পোশাক", icon: "👗", gradient: "from-pink-500 to-rose-600", sortOrder: 1 },
  { name: "Electronics", nameBn: "ইলেকট্রনিক্স", slug: "electronics", description: "মোবাইল, গ্যাজেট ও হোম অ্যাপ্লায়েন্স", icon: "📱", gradient: "from-blue-500 to-indigo-600", sortOrder: 2 },
  { name: "Grocery", nameBn: "মুদি বাজার", slug: "grocery", description: "চাল, তেল, মসলা ও নিত্যপ্রয়োজনীয় পণ্য", icon: "🛒", gradient: "from-amber-500 to-orange-600", sortOrder: 3 },
  { name: "Beauty", nameBn: "বিউটি ও স্বাস্থ্য", slug: "beauty", description: "স্কিনকেয়ার, হেয়ারকেয়ার ও কসমেটিক্স", icon: "💄", gradient: "from-fuchsia-500 to-purple-600", sortOrder: 4 },
  { name: "Home & Living", nameBn: "হোম ও লিভিং", slug: "home-living", description: "বেডশিট, কুকওয়্যার ও ঘর সাজানোর পণ্য", icon: "🏠", gradient: "from-teal-500 to-emerald-600", sortOrder: 5 },
  { name: "Baby & Toys", nameBn: "শিশু ও খেলনা", slug: "baby-toys", description: "বেবি কেয়ার ও বাচ্চাদের খেলনা", icon: "🧸", gradient: "from-sky-500 to-cyan-600", sortOrder: 6 },
  { name: "Books", nameBn: "বই", slug: "books", description: "উপন্যাস, ইসলামিক বই ও শিক্ষামূলক বই", icon: "📚", gradient: "from-violet-500 to-purple-700", sortOrder: 7 },
];

type SeedProduct = {
  name: string;
  nameBn: string;
  slug: string;
  category: string;
  description: string;
  descriptionBn: string;
  price: number;
  comparePrice?: number;
  stock: number;
  emoji: string;
  gradient: string;
  featured?: boolean;
  isNew?: boolean;
  ratingAvg: number;
  ratingCount: number;
  totalSold: number;
  tags: string[];
};

export const seedProducts: SeedProduct[] = [
  { name: "Premium Slim-Fit Punjabi", nameBn: "প্রিমিয়াম স্লিম-ফিট পাঞ্জাবি", slug: "premium-punjabi", category: "fashion", description: "Premium Egyptian cotton punjabi with metal buttons. Perfect for Eid and weddings.", descriptionBn: "প্রিমিয়াম মিশরীয় সুতি কাপড়ের পাঞ্জাবি। ঈদ ও বিয়ের অনুষ্ঠানের জন্য সেরা।", price: 2450, comparePrice: 3200, stock: 45, emoji: "🥻", gradient: "from-pink-100 to-rose-200", featured: true, isNew: true, ratingAvg: 4.8, ratingCount: 132, totalSold: 540, tags: ["eid", "punjabi", "cotton"] },
  { name: "Original Jamdani Saree", nameBn: "অরিজিনাল জামদানি শাড়ি", slug: "jamdani-saree", category: "fashion", description: "Hand-woven Dhakai Jamdani saree with blouse piece. GI certified authentic.", descriptionBn: "হাতে বোনা আসল ঢাকাই জামদানি শাড়ি, ব্লাউজ পিস সহ।", price: 5500, comparePrice: 7500, stock: 18, emoji: "👘", gradient: "from-red-100 to-pink-200", featured: true, ratingAvg: 4.9, ratingCount: 89, totalSold: 210, tags: ["saree", "jamdani", "wedding"] },
  { name: "Cotton Three-Piece (Unstitched)", nameBn: "সুতি থ্রি-পিস (আনস্টিচড)", slug: "cotton-three-piece", category: "fashion", description: "Soft georgette three-piece with embroidery work, 3.5 gaz fabric.", descriptionBn: "এমব্রয়ডারি কাজের নরম জর্জেট থ্রি-পিস, সাড়ে ৩ গজ কাপড়।", price: 1850, comparePrice: 2400, stock: 60, emoji: "👗", gradient: "from-purple-100 to-fuchsia-200", ratingAvg: 4.6, ratingCount: 210, totalSold: 890, tags: ["three-piece", "cotton"] },
  { name: "Denim Jeans for Men", nameBn: "ছেলেদের ডেনিম জিন্স", slug: "denim-jeans-men", category: "fashion", description: "Stretchable export-quality denim jeans, sizes 28-36.", descriptionBn: "স্ট্রেচেবল এক্সপোর্ট কোয়ালিটি ডেনিম জিন্স, সাইজ ২৮-৩৬।", price: 1350, comparePrice: 1800, stock: 80, emoji: "👖", gradient: "from-blue-100 to-indigo-200", ratingAvg: 4.4, ratingCount: 156, totalSold: 620, tags: ["jeans", "denim"] },
  { name: "Genuine Leather Shoes", nameBn: "খাঁটি চামড়ার জুতা", slug: "leather-shoes", category: "fashion", description: "Full-grain leather formal shoes with anti-slip sole.", descriptionBn: "ফুল-গ্রেইন চামড়ার ফরমাল জুতা, অ্যান্টি-স্লিপ সোল।", price: 2200, comparePrice: 2900, stock: 35, emoji: "👞", gradient: "from-amber-100 to-yellow-200", ratingAvg: 4.5, ratingCount: 98, totalSold: 340, tags: ["shoes", "leather"] },
  { name: "Hijab Combo (3 Pcs)", nameBn: "হিজাব কম্বো (৩ পিস)", slug: "hijab-combo", category: "fashion", description: "Premium chiffon hijab combo, 3 colors, extra large size.", descriptionBn: "প্রিমিয়াম শিফন হিজাব কম্বো, ৩টি কালার, এক্সট্রা লার্জ সাইজ।", price: 850, comparePrice: 1200, stock: 120, emoji: "🧕", gradient: "from-teal-100 to-emerald-200", isNew: true, ratingAvg: 4.7, ratingCount: 187, totalSold: 1050, tags: ["hijab", "combo"] },

  { name: "Smartphone X12 (8/128GB)", nameBn: "স্মার্টফোন X12 (৮/১২৮জিবি)", slug: "smartphone-x12", category: "electronics", description: "6.7\" AMOLED display, 50MP camera, 5000mAh battery, official warranty.", descriptionBn: "৬.৭ ইঞ্চি AMOLED ডিসপ্লে, ৫০MP ক্যামেরা, ৫০০০mAh ব্যাটারি, অফিসিয়াল ওয়ারেন্টি।", price: 18990, comparePrice: 21990, stock: 25, emoji: "📱", gradient: "from-blue-100 to-sky-200", featured: true, isNew: true, ratingAvg: 4.7, ratingCount: 243, totalSold: 480, tags: ["mobile", "smartphone"] },
  { name: "Wireless Earbuds Pro", nameBn: "ওয়্যারলেস ইয়ারবাডস প্রো", slug: "wireless-earbuds-pro", category: "electronics", description: "ANC noise cancelling earbuds with 36-hour battery and fast charging.", descriptionBn: "ANC নয়েজ ক্যান্সেলিং ইয়ারবাডস, ৩৬ ঘণ্টা ব্যাটারি ব্যাকআপ।", price: 2490, comparePrice: 3500, stock: 70, emoji: "🎧", gradient: "from-slate-200 to-gray-300", featured: true, ratingAvg: 4.5, ratingCount: 312, totalSold: 1200, tags: ["earbuds", "audio"] },
  { name: "Smart Watch Fit 2", nameBn: "স্মার্ট ওয়াচ ফিট ২", slug: "smart-watch-fit2", category: "electronics", description: "AMOLED smartwatch with heart-rate, SpO2 and 10-day battery.", descriptionBn: "AMOLED স্মার্টওয়াচ, হার্ট-রেট ও SpO2 সেন্সর, ১০ দিন ব্যাটারি।", price: 3490, comparePrice: 4990, stock: 50, emoji: "⌚", gradient: "from-indigo-100 to-blue-200", isNew: true, ratingAvg: 4.6, ratingCount: 178, totalSold: 640, tags: ["watch", "smartwatch"] },
  { name: 'LED TV 43" 4K', nameBn: 'এলইডি টিভি ৪৩" ৪কে', slug: "led-tv-43-4k", category: "electronics", description: "43-inch 4K UHD Smart Android TV with 2-year panel warranty.", descriptionBn: "৪৩ ইঞ্চি 4K UHD স্মার্ট অ্যান্ড্রয়েড টিভি, ২ বছর প্যানেল ওয়ারেন্টি।", price: 38500, comparePrice: 45000, stock: 12, emoji: "📺", gradient: "from-cyan-100 to-sky-200", ratingAvg: 4.8, ratingCount: 76, totalSold: 95, tags: ["tv", "4k"] },
  { name: "Electric Rice Cooker 2.8L", nameBn: "ইলেকট্রিক রাইস কুকার ২.৮লি", slug: "rice-cooker-28", category: "electronics", description: "2.8L automatic rice cooker, keeps warm 12 hours, 1-year warranty.", descriptionBn: "২.৮ লিটার অটোমেটিক রাইস কুকার, ১২ ঘণ্টা গরম রাখে।", price: 3250, comparePrice: 4000, stock: 40, emoji: "🍚", gradient: "from-orange-100 to-amber-200", ratingAvg: 4.5, ratingCount: 143, totalSold: 520, tags: ["kitchen", "cooker"] },
  { name: "Rechargeable Table Fan", nameBn: "রিচার্জেবল টেবিল ফ্যান", slug: "rechargeable-table-fan", category: "electronics", description: "High-speed rechargeable fan with LED light, 8-hour backup.", descriptionBn: "হাই-স্পিড রিচার্জেবল ফ্যান, এলইডি লাইট সহ, ৮ ঘণ্টা ব্যাকআপ।", price: 2650, comparePrice: 3200, stock: 55, emoji: "🌀", gradient: "from-emerald-100 to-teal-200", ratingAvg: 4.4, ratingCount: 121, totalSold: 430, tags: ["fan", "rechargeable"] },

  { name: "Chinigura Rice 5kg", nameBn: "চিনিগুঁড়া চাল ৫কেজি", slug: "chinigura-rice-5kg", category: "grocery", description: "Aromatic Dinajpur Chinigura rice, perfect for polao and biryani.", descriptionBn: "সুগন্ধি দিনাজপুরের চিনিগুঁড়া চাল, পোলাও-বিরিয়ানির জন্য সেরা।", price: 750, comparePrice: 850, stock: 200, emoji: "🌾", gradient: "from-yellow-100 to-amber-200", featured: true, ratingAvg: 4.9, ratingCount: 421, totalSold: 2300, tags: ["rice", "polao"] },
  { name: "Mustard Oil 1L (Pure)", nameBn: "খাঁটি সরিষার তেল ১লি", slug: "mustard-oil-1l", category: "grocery", description: "Cold-pressed pure mustard oil from ghani, no preservatives.", descriptionBn: "ঘানিতে ভাঙানো খাঁটি সরিষার তেল, কোনো প্রিজারভেটিভ নেই।", price: 340, comparePrice: 390, stock: 150, emoji: "🫗", gradient: "from-amber-100 to-orange-200", ratingAvg: 4.7, ratingCount: 289, totalSold: 1800, tags: ["oil", "mustard"] },
  { name: "Pure Honey 500g", nameBn: "খাঁটি মধু ৫০০গ্রাম", slug: "pure-honey-500g", category: "grocery", description: "Sundarbans natural honey, BSTI tested, glass jar.", descriptionBn: "সুন্দরবনের খাঁটি প্রাকৃতিক মধু, BSTI পরীক্ষিত, কাঁচের জার।", price: 650, comparePrice: 750, stock: 90, emoji: "🍯", gradient: "from-yellow-100 to-orange-200", isNew: true, ratingAvg: 4.8, ratingCount: 167, totalSold: 760, tags: ["honey", "organic"] },
  { name: "Spice Combo Pack (9 Items)", nameBn: "মসলা কম্বো প্যাক (৯ আইটেম)", slug: "spice-combo-9", category: "grocery", description: "9 essential spices combo — holud, morich, jira, dhonia and more.", descriptionBn: "৯টি প্রয়োজনীয় মসলার কম্বো — হলুদ, মরিচ, জিরা, ধনিয়া সহ আরও অনেক।", price: 890, comparePrice: 1100, stock: 110, emoji: "🌶️", gradient: "from-red-100 to-orange-200", ratingAvg: 4.6, ratingCount: 198, totalSold: 940, tags: ["spice", "combo"] },
  { name: "Premium Dates (Khejur) 1kg", nameBn: "প্রিমিয়াম খেজুর ১কেজি", slug: "premium-dates-1kg", category: "grocery", description: "Soft Medjool-style dates, imported, hygienically packed.", descriptionBn: "নরম প্রিমিয়াম খেজুর, আমদানিকৃত, স্বাস্থ্যসম্মত প্যাকেজিং।", price: 520, comparePrice: 650, stock: 130, emoji: "🌴", gradient: "from-orange-100 to-amber-200", ratingAvg: 4.7, ratingCount: 145, totalSold: 680, tags: ["dates", "khejur"] },

  { name: "Facewash + Cream Combo", nameBn: "ফেসওয়াশ + ক্রিম কম্বো", slug: "facewash-cream-combo", category: "beauty", description: "Neem facewash + moisturizing cream combo for all skin types.", descriptionBn: "সব ধরনের ত্বকের জন্য নিম ফেসওয়াশ + ময়েশ্চারাইজিং ক্রিম কম্বো।", price: 750, comparePrice: 950, stock: 95, emoji: "🧴", gradient: "from-pink-100 to-fuchsia-200", featured: true, ratingAvg: 4.5, ratingCount: 234, totalSold: 1100, tags: ["skincare", "combo"] },
  { name: "Coconut Hair Oil 400ml", nameBn: "নারকেল হেয়ার অয়েল ৪০০মিলি", slug: "coconut-hair-oil", category: "beauty", description: "Pure coconut oil with amla & methi for strong shiny hair.", descriptionBn: "মজবুত ঝলমলে চুলের জন্য আমলা ও মেথি মিশ্রিত খাঁটি নারকেল তেল।", price: 350, comparePrice: 420, stock: 160, emoji: "🥥", gradient: "from-green-100 to-emerald-200", ratingAvg: 4.6, ratingCount: 312, totalSold: 1500, tags: ["hair", "oil"] },
  { name: "Alcohol-Free Attor (12ml)", nameBn: "অ্যালকোহল-ফ্রি আতর (১২মিলি)", slug: "attor-12ml", category: "beauty", description: "Long-lasting premium attor, 12ml, multiple fragrances.", descriptionBn: "দীর্ঘস্থায়ী প্রিমিয়াম আতর, ১২মিলি, একাধিক ফ্লেভার।", price: 1200, comparePrice: 1500, stock: 60, emoji: "🌸", gradient: "from-violet-100 to-purple-200", isNew: true, ratingAvg: 4.8, ratingCount: 89, totalSold: 320, tags: ["attor", "perfume"] },

  { name: "Sofa Cover Set (5 Seat)", nameBn: "সোফা কভার সেট (৫ সিট)", slug: "sofa-cover-5seat", category: "home-living", description: "Stretchable sofa cover set with cushion covers, washable.", descriptionBn: "স্ট্রেচেবল সোফা কভার সেট, কুশন কভার সহ, ধোয়া যায়।", price: 1450, comparePrice: 1950, stock: 48, emoji: "🛋️", gradient: "from-teal-100 to-cyan-200", ratingAvg: 4.4, ratingCount: 112, totalSold: 410, tags: ["sofa", "cover"] },
  { name: "King Size Bedsheet + Pillows", nameBn: "কিং সাইজ বেডশিট + বালিশ কভার", slug: "kingsize-bedsheet", category: "home-living", description: "100% cotton king-size bedsheet with 2 pillow covers.", descriptionBn: "১০০% সুতি কিং সাইজ বেডশিট, ২টি বালিশের কভার সহ।", price: 1250, comparePrice: 1650, stock: 75, emoji: "🛏️", gradient: "from-sky-100 to-blue-200", ratingAvg: 4.6, ratingCount: 189, totalSold: 720, tags: ["bedsheet", "cotton"] },
  { name: "Non-Stick Cookware Set (7 Pcs)", nameBn: "নন-স্টিক কুকওয়্যার সেট (৭ পিস)", slug: "nonstick-cookware-7pcs", category: "home-living", description: "7-piece non-stick cookware set with glass lids, induction ready.", descriptionBn: "৭ পিস নন-স্টিক কুকওয়্যার সেট, কাঁচের ঢাকনা সহ।", price: 4500, comparePrice: 5800, stock: 30, emoji: "🍳", gradient: "from-stone-200 to-orange-200", featured: true, ratingAvg: 4.7, ratingCount: 134, totalSold: 390, tags: ["kitchen", "cookware"] },

  { name: "Baby Diaper Pack (48 Pcs)", nameBn: "বেবি ডায়াপার প্যাক (৪৮ পিস)", slug: "baby-diaper-48", category: "baby-toys", description: "Soft breathable baby diapers, size M, 48 pieces pack.", descriptionBn: "নরম ও আরামদায়ক বেবি ডায়াপার, সাইজ M, ৪৮ পিস প্যাক।", price: 950, comparePrice: 1150, stock: 85, emoji: "👶", gradient: "from-sky-100 to-cyan-200", ratingAvg: 4.7, ratingCount: 256, totalSold: 1300, tags: ["baby", "diaper"] },
  { name: "Remote Control Car", nameBn: "রিমোট কন্ট্রোল গাড়ি", slug: "rc-car", category: "baby-toys", description: "Rechargeable stunt RC car with 360° rotation and lights.", descriptionBn: "রিচার্জেবল স্টান্ট রিমোট গাড়ি, ৩৬০° ঘোরা ও লাইট সহ।", price: 1650, comparePrice: 2200, stock: 42, emoji: "🚗", gradient: "from-red-100 to-orange-200", isNew: true, ratingAvg: 4.5, ratingCount: 98, totalSold: 350, tags: ["toy", "car"] },
  { name: "Kids Learning Tablet", nameBn: "বাচ্চাদের লার্নিং ট্যাবলেট", slug: "kids-learning-tablet", category: "baby-toys", description: "Bangla + English + Arabic learning tablet for kids age 2-6.", descriptionBn: "২-৬ বছরের বাচ্চাদের জন্য বাংলা + ইংরেজি + আরবি লার্নিং ট্যাবলেট।", price: 650, comparePrice: 850, stock: 68, emoji: "📟", gradient: "from-green-100 to-lime-200", ratingAvg: 4.6, ratingCount: 143, totalSold: 580, tags: ["toy", "learning"] },

  { name: "Humayun Ahmed Samagra (5 Vol)", nameBn: "হুমায়ূন আহমেদ সমগ্র (৫ খণ্ড)", slug: "humayun-samagra", category: "books", description: "Complete collection of Humayun Ahmed's best novels, 5 volumes.", descriptionBn: "হুমায়ূন আহমেদের সেরা উপন্যাসের সম্পূর্ণ সংগ্রহ, ৫ খণ্ড।", price: 1500, comparePrice: 2000, stock: 38, emoji: "📖", gradient: "from-violet-100 to-purple-200", featured: true, ratingAvg: 4.9, ratingCount: 187, totalSold: 460, tags: ["book", "novel"] },
  { name: "Riyadus Salihin (Bangla)", nameBn: "রিয়াদুস সালেহীন (বাংলা)", slug: "riyadus-salihin-bangla", category: "books", description: "Riyadus Salihin hadith book in easy Bangla translation, 2 volumes.", descriptionBn: "সহজ বাংলা অনুবাদে রিয়াদুস সালেহীন হাদিস গ্রন্থ, ২ খণ্ড।", price: 680, comparePrice: 850, stock: 52, emoji: "📗", gradient: "from-emerald-100 to-green-200", ratingAvg: 4.9, ratingCount: 231, totalSold: 890, tags: ["book", "islamic"] },
  { name: "English Spoken Course Book", nameBn: "ইংলিশ স্পোকেন কোর্স বই", slug: "english-spoken-book", category: "books", description: "Learn spoken English in 30 days with Bangla explanation + audio QR.", descriptionBn: "বাংলা ব্যাখ্যাসহ ৩০ দিনে স্পোকেন ইংলিশ শিখুন + অডিও QR।", price: 380, comparePrice: 500, stock: 90, emoji: "🔤", gradient: "from-blue-100 to-indigo-200", isNew: true, ratingAvg: 4.5, ratingCount: 176, totalSold: 950, tags: ["book", "english"] },
];

export const seedCoupons = [
  { code: "WELCOME10", type: "percent" as const, value: 10, minOrder: 500, maxDiscount: 300, usageLimit: 1000, isActive: true },
  { code: "EID20", type: "percent" as const, value: 20, minOrder: 1500, maxDiscount: 800, usageLimit: 500, isActive: true },
  { code: "FLAT100", type: "flat" as const, value: 100, minOrder: 800, maxDiscount: 100, usageLimit: 800, isActive: true },
  { code: "DHAKA50", type: "flat" as const, value: 50, minOrder: 300, maxDiscount: 50, usageLimit: 2000, isActive: true },
];

export const seedReviews = [
  { productSlug: "premium-punjabi", userName: "রহিম উদ্দিন", rating: 5, comment: "কাপড়ের কোয়ালিটি অসাধারণ! ঈদের জন্য নিয়েছিলাম, সবাই প্রশংসা করেছে।" },
  { productSlug: "premium-punjabi", userName: "তানভীর হাসান", rating: 4, comment: "ভালো ফিটিং, তবে ডেলিভারি একদিন লেট হয়েছিল।" },
  { productSlug: "jamdani-saree", userName: "শারমিন আক্তার", rating: 5, comment: "আসল জামদানি! মা খুব খুশি হয়েছেন। প্যাকেজিংও চমৎকার ছিল।" },
  { productSlug: "smartphone-x12", userName: "আরিফুল ইসলাম", rating: 5, comment: "অফিসিয়াল ফোন, সিল প্যাক পেয়েছি। দামও মার্কেট থেকে কম।" },
  { productSlug: "smartphone-x12", userName: "নুসরাত জাহান", rating: 4, comment: "ক্যামেরা কোয়ালিটি দারুণ। ব্যাটারি ব্যাকআপ একটু কম মনে হয়েছে।" },
  { productSlug: "chinigura-rice-5kg", userName: "করিম মিয়া", rating: 5, comment: "পোলাও রান্না করেছি, ঘ্রাণে পুরো বাড়ি ভরে গেছে। আবার কিনব।" },
  { productSlug: "wireless-earbuds-pro", userName: "সাকিব খান", rating: 5, comment: "সাউন্ড কোয়ালিটি এই দামে সেরা! ANC ঠিকমতো কাজ করে।" },
  { productSlug: "humayun-samagra", userName: "ফারিয়া সুলতানা", rating: 5, comment: "বইপ্রেমীদের জন্য সেরা উপহার। প্রিন্ট কোয়ালিটি খুব ভালো।" },
];
