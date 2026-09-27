/* ============================================================
   Mr Tom Gadgets — live-chat brain
   ------------------------------------------------------------
   1. `askAI()`      → calls an OpenAI-compatible chat-completions API
                       (Groq / OpenAI / Google Gemini / any custom URL).
                       The request carries a system prompt with store facts
                       + the catalog products that match the question, so
                       the model answers with REAL prices & links.
   2. `localAnswer()` → zero-dependency assistant that answers price,
                       category, EMI, delivery, warranty, exchange, order
                       tracking & contact questions straight from the
                       catalog. Used when no API key is set, or as a
                       fallback when the API call fails.
   ============================================================ */
import { allProducts, categoryTiles, formatBDT, type P } from "@/mtg/data/catalog";

/* ---------------- types ---------------- */
export type Role = "user" | "assistant";
export interface ChatMsg {
  id: string;
  role: Role;
  content: string;
  ts: number;
  /** true when the answer came from the AI API (vs. the built-in assistant) */
  ai?: boolean;
}

export type ProviderId = "groq" | "openai" | "gemini" | "openrouter" | "custom";
export interface ChatSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export const PROVIDERS: Record<ProviderId, { label: string; baseUrl: string; model: string; keyHint: string; keyUrl: string }> = {
  groq: {
    label: "Groq (free tier)",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    keyHint: "gsk_…",
    keyUrl: "https://console.groq.com/keys",
  },
  gemini: {
    label: "Google Gemini (free tier)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    keyHint: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    keyHint: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    keyHint: "sk-or-…",
    keyUrl: "https://openrouter.ai/keys",
  },
  custom: {
    label: "Custom (OpenAI-compatible URL)",
    baseUrl: "",
    model: "",
    keyHint: "API key",
    keyUrl: "",
  },
};

const SETTINGS_KEY = "mrtom_chat_settings";
const HISTORY_KEY = "mrtom_chat_history";

const envProvider = (process.env.NEXT_PUBLIC_CHAT_PROVIDER as ProviderId | undefined) ?? "groq";
const DEFAULTS: ChatSettings = {
  provider: PROVIDERS[envProvider] ? envProvider : "groq",
  apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY ?? "",
  model: process.env.NEXT_PUBLIC_CHAT_MODEL ?? "",
  baseUrl: process.env.NEXT_PUBLIC_CHAT_BASE_URL ?? "",
};

export function loadSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ChatSettings>) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}
export function saveSettings(s: ChatSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
export function loadHistory(): ChatMsg[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as ChatMsg[];
  } catch {
    /* ignore */
  }
  return [];
}
export function saveHistory(h: ChatMsg[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-60)));
}
export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const resolveEndpoint = (s: ChatSettings) => {
  const preset = PROVIDERS[s.provider];
  return {
    url: (s.provider === "custom" ? s.baseUrl : preset.baseUrl).trim(),
    model: (s.model || preset.model).trim(),
  };
};
export const isAIConfigured = (s: ChatSettings) => {
  const { url, model } = resolveEndpoint(s);
  return Boolean(s.apiKey.trim() && url && model);
};

/* ---------------- store knowledge ---------------- */
export const STORE = {
  name: "Mr Tom Gadgets",
  hotline: "09678148148",
  email: "contact@mrtomgadgets.com",
  hours: "Saturday–Thursday, 11 AM – 10 PM",
  outlets: [
    "Mr Tom Gadgets — Basement 2, Shop 26, Bashundhara City Shopping Complex, Dhaka",
    "Mr Tom Gadgets — Level 5, Block A, Shop 6/7/8, Bashundhara City Shopping Complex, Dhaka",
    "Mr Tom Gadgets — Level 4, Zone A (West Court), Shop 280, Jamuna Future Park, Dhaka",
    "Mr Tom Computers — Level 5, Shop 545-546, Multiplan Center, New Elephant Road, Dhaka",
  ],
  delivery: "Inside Dhaka: 24–48 hours. Outside Dhaka: 3–5 working days. Free delivery on orders above ৳2,000 within Dhaka. Cash on delivery available nationwide.",
  emi: "0% EMI for up to 36 months on orders above ৳5,000 with City Bank, EBL, BRAC Bank, DBBL and all other major bank credit/debit cards. No hidden charges, instant approval online & at outlets.",
  warranty: "Every product comes with official brand / Mr Tom Gadgets warranty (typically 1 year for phones, laptops & Apple products; 6–12 months for accessories). Warranty claims are handled at Mr Tom Care, Bashundhara City, Level 3, Block B, Shop 07.",
  exchange: "Exchange facility: bring your old phone, laptop or tablet to any outlet, get an instant valuation and pay only the difference for a new device.",
  preorder: "Pre-order products need a booking amount; the rest is paid on delivery. Pre-order customers get delivery priority on launch day.",
  tracking: "Track any order from the Track Order page (#/track-order) with the order ID and phone number.",
  payment: "Payment: bKash, Nagad, Rocket, Visa / MasterCard / Amex, bank transfer and cash on delivery.",
};

/* ---------------- catalog search ---------------- */
const STOP = new Set([
  "price", "dam", "koto", "kto", "ta", "er", "r", "the", "of", "a", "an", "in", "is", "bd", "bangladesh", "how", "much", "what", "cost",
  "please", "plz", "vai", "bhai", "ki", "ache", "ase", "asche", "koro", "kore", "amar", "ami", "i", "want", "need", "kinte", "chai", "buy",
  "show", "me", "dekhan", "dekhao", "dekhau", "about", "details", "detail", "koto?", "taka", "tk", "৳", "for", "and", "with", "new", "latest",
]);
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}+. ]/gu, " ").replace(/\s+/g, " ").trim();
const tokens = (s: string) => norm(s).split(" ").filter((t) => t && !STOP.has(t));

export function searchProducts(query: string, limit = 6): P[] {
  const qs = tokens(query);
  if (qs.length === 0) return [];
  const scored: { p: P; s: number }[] = [];
  for (const p of allProducts) {
    const name = norm(p.name);
    const brand = norm(p.brand ?? "");
    let s = 0;
    for (const q of qs) {
      if (name.includes(q)) s += q.length > 2 ? 3 : 1.5;
      else if (brand.includes(q)) s += 1;
    }
    if (s === 0) continue;
    // reward matching every token & shorter (more exact) names
    if (qs.every((q) => name.includes(q) || brand.includes(q))) s += 4;
    s -= name.length / 120;
    scored.push({ p, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.p);
}

export const productLink = (p: P) => `#/product/${p.slug}`;
const priceLine = (p: P) => {
  const parts = [`**${p.name}** — ${formatBDT(p.price)}`];
  if (p.oldPrice && p.oldPrice > p.price) parts.push(`~~${formatBDT(p.oldPrice)}~~ (save ${formatBDT(p.oldPrice - p.price)})`);
  if (p.status === "pre-order") parts.push("· Pre-order");
  return `${parts.join(" ")} → [View](${productLink(p)})`;
};

/* ---------------- language helpers ---------------- */
const hasBangla = (s: string) => /[\u0980-\u09FF]/.test(s);
const isBanglish = (s: string) =>
  /\b(dam|koto|ache|ase|asche|kina|kinbo|kinte|chai|kemon|bhai|vai|apni|apnar|amar|ami|ki|kivabe|kibhabe|korbo|hobe|deben|diben|pabo|paoa|nai|nei|thik|valo|bhalo|dhonnobad|kotha|kobe|kokhon|ekta|akta|ta|ta?ka|tk)\b/i.test(
    s
  );
type Lang = "bn" | "banglish" | "en";
const detectLang = (s: string): Lang => (hasBangla(s) ? "bn" : isBanglish(s) ? "banglish" : "en");

const T = {
  greet: {
    bn: "আসসালামু আলাইকুম! আমি **টম**, Mr Tom Gadgets-এর সাপোর্ট অ্যাসিস্ট্যান্ট। 😊\n\nআপনি জিজ্ঞেস করতে পারেন:\n• যেকোনো প্রোডাক্টের **দাম** (যেমন: iPhone 17 Pro Max দাম কত?)\n• **EMI**, **ডেলিভারি**, **ওয়ারেন্টি**, **এক্সচেঞ্জ**\n• অর্ডার ট্র্যাকিং বা আউটলেটের ঠিকানা",
    banglish: "Assalamu Alaikum! Ami **Tom**, Mr Tom Gadgets-er support assistant. 😊\n\nApni jiggesh korte paren:\n• Je kono product-er **dam** (jemon: iPhone 17 Pro Max dam koto?)\n• **EMI**, **delivery**, **warranty**, **exchange**\n• Order tracking ba outlet-er address",
    en: "Hi! I'm **Tom**, the Mr Tom Gadgets support assistant. 😊\n\nYou can ask me:\n• The **price** of any product (e.g. iPhone 17 Pro Max price?)\n• **EMI**, **delivery**, **warranty**, **exchange**\n• Order tracking or outlet addresses",
  },
  thanks: {
    bn: "আপনাকেও ধন্যবাদ! 🙏 আর কিছু জানতে চাইলে বলুন। Mr Tom Gadgets-এর সাথে থাকার জন্য কৃতজ্ঞ।",
    banglish: "Apnakeo dhonnobad! 🙏 Ar kichu jante chaile bolun. Mr Tom Gadgets-er sathe thakar jonno kritoggo.",
    en: "You're welcome! 🙏 Let me know if there's anything else. Thanks for shopping with Mr Tom Gadgets.",
  },
  found: {
    bn: "আপনার প্রশ্ন অনুযায়ী এই প্রোডাক্টগুলো পেলাম:",
    banglish: "Apnar question onujayi ei product gulo pelam:",
    en: "Here's what I found for you:",
  },
  more: {
    bn: "\n\nবিস্তারিত দেখতে **View**-এ ক্লিক করুন। EMI বা ডেলিভারি নিয়ে জানতে চাইলে বলুন!",
    banglish: "\n\nDetails dekhte **View**-e click korun. EMI ba delivery niye jante chaile bolun!",
    en: "\n\nClick **View** for full specs. Ask me about EMI or delivery for any of these!",
  },
  notFound: {
    bn: "দুঃখিত, এই নামে কোনো প্রোডাক্ট খুঁজে পাইনি। 😔 দয়া করে সঠিক মডেলের নাম লিখুন (যেমন: *Galaxy S26 Ultra*), অথবা [সার্চ পেজ](#/search) ব্যবহার করুন।\n\nসরাসরি সাহায্যের জন্য হটলাইন: **" + STORE.hotline + "**",
    banglish: "Sorry, ei name-e kono product khuje painai. 😔 Doya kore thik model-er nam likhun (jemon: *Galaxy S26 Ultra*), othoba [search page](#/search) use korun.\n\nSorasori help-er jonno hotline: **" + STORE.hotline + "**",
    en: "Sorry, I couldn't find a product by that name. 😔 Please type the exact model (e.g. *Galaxy S26 Ultra*) or use the [search page](#/search).\n\nFor direct help call our hotline: **" + STORE.hotline + "**",
  },
  categories: {
    bn: "আমাদের জনপ্রিয় ক্যাটাগরিগুলো:",
    banglish: "Amader popular category gulo:",
    en: "Our popular categories:",
  },
  fallback: {
    bn: "আমি নিশ্চিত নই আপনি ঠিক কী জানতে চাচ্ছেন। 🙂 আপনি প্রোডাক্টের নাম লিখে **দাম** জানতে পারেন, অথবা **EMI / ডেলিভারি / ওয়ারেন্টি / এক্সচেঞ্জ / ঠিকানা** সম্পর্কে জিজ্ঞেস করুন।\n\nজরুরি প্রয়োজনে কল করুন: **" + STORE.hotline + "** (" + STORE.hours + ")",
    banglish: "Ami sure na apni thik ki jante chacchen. 🙂 Apni product-er nam likhe **dam** jante paren, othoba **EMI / delivery / warranty / exchange / address** niye jiggesh korun.\n\nJoruri proyojone call korun: **" + STORE.hotline + "** (" + STORE.hours + ")",
    en: "I'm not sure I understood that. 🙂 Type a product name to get its **price**, or ask about **EMI / delivery / warranty / exchange / outlets**.\n\nFor urgent help call **" + STORE.hotline + "** (" + STORE.hours + ")",
  },
};

const facts = (lang: Lang) => ({
  emi: {
    bn: `💳 **EMI সুবিধা**\n${STORE.emi}\n\nক্যালকুলেটর ও ব্যাংকের তালিকা দেখুন: [EMI পেজ](#/emi)`,
    banglish: `💳 **EMI facility**\n${STORE.emi}\n\nCalculator o bank list dekhun: [EMI page](#/emi)`,
    en: `💳 **EMI facility**\n${STORE.emi}\n\nSee the calculator & bank list: [EMI page](#/emi)`,
  }[lang],
  delivery: {
    bn: `🚚 **ডেলিভারি**\n${STORE.delivery}\n\n${STORE.payment}`,
    banglish: `🚚 **Delivery**\n${STORE.delivery}\n\n${STORE.payment}`,
    en: `🚚 **Delivery**\n${STORE.delivery}\n\n${STORE.payment}`,
  }[lang],
  warranty: {
    bn: `🛡️ **ওয়ারেন্টি**\n${STORE.warranty}\n\nবিস্তারিত: [Warranty Policy](#/info/warranty-policy)`,
    banglish: `🛡️ **Warranty**\n${STORE.warranty}\n\nDetails: [Warranty Policy](#/info/warranty-policy)`,
    en: `🛡️ **Warranty**\n${STORE.warranty}\n\nDetails: [Warranty Policy](#/info/warranty-policy)`,
  }[lang],
  exchange: {
    bn: `🔁 **এক্সচেঞ্জ অফার**\n${STORE.exchange}\n\nদেখুন: [Exchange পেজ](#/exchange)`,
    banglish: `🔁 **Exchange offer**\n${STORE.exchange}\n\nDekhun: [Exchange page](#/exchange)`,
    en: `🔁 **Exchange offer**\n${STORE.exchange}\n\nSee: [Exchange page](#/exchange)`,
  }[lang],
  preorder: {
    bn: `⏳ **প্রি-অর্ডার**\n${STORE.preorder}\n\nচলমান প্রি-অর্ডার: [Pre-order পেজ](#/pre-order)`,
    banglish: `⏳ **Pre-order**\n${STORE.preorder}\n\nCholoman pre-order: [Pre-order page](#/pre-order)`,
    en: `⏳ **Pre-order**\n${STORE.preorder}\n\nCurrent pre-orders: [Pre-order page](#/pre-order)`,
  }[lang],
  tracking: {
    bn: `📦 **অর্ডার ট্র্যাকিং**\n${STORE.tracking}\n\n[Track Order](#/track-order)`,
    banglish: `📦 **Order tracking**\n${STORE.tracking}\n\n[Track Order](#/track-order)`,
    en: `📦 **Order tracking**\n${STORE.tracking}\n\n[Track Order](#/track-order)`,
  }[lang],
  contact: {
    bn: `📍 **যোগাযোগ / আউটলেট**\nহটলাইন: **${STORE.hotline}** · ইমেইল: ${STORE.email}\nসময়: ${STORE.hours}\n\n${STORE.outlets.map((o) => "• " + o).join("\n")}\n\n[Contact পেজ](#/contact)`,
    banglish: `📍 **Contact / Outlets**\nHotline: **${STORE.hotline}** · Email: ${STORE.email}\nTime: ${STORE.hours}\n\n${STORE.outlets.map((o) => "• " + o).join("\n")}\n\n[Contact page](#/contact)`,
    en: `📍 **Contact / Outlets**\nHotline: **${STORE.hotline}** · Email: ${STORE.email}\nHours: ${STORE.hours}\n\n${STORE.outlets.map((o) => "• " + o).join("\n")}\n\n[Contact page](#/contact)`,
  }[lang],
  offers: {
    bn: "🔥 চলমান সব অফার এক জায়গায়: [Offers পেজ](#/offers)\n\nএছাড়া হোমপেজের **Exclusive Deals** সেকশনে ডিসকাউন্ট প্রোডাক্ট দেখুন।",
    banglish: "🔥 Choloman sob offer ek jaygay: [Offers page](#/offers)\n\nHomepage-er **Exclusive Deals** section-e discount product dekhun.",
    en: "🔥 All running offers in one place: [Offers page](#/offers)\n\nAlso check the **Exclusive Deals** section on the homepage for discounted products.",
  }[lang],
});

/* ---------------- intent detection ---------------- */
const RX = {
  greet: /^(hi|hello|hey|salam|assalamu|assalam|আসসালামু|হ্যালো|হাই|নমস্কার|good (morning|evening|afternoon))\b/i,
  thanks: /\b(thanks|thank you|thx|dhonnobad|ধন্যবাদ|shukria)\b/i,
  emi: /\b(emi|installment|kisti|কিস্তি|ইএমআই|০%|0%)\b/i,
  delivery: /\b(deliver|delivery|shipping|ship|courier|ডেলিভারি|পৌঁছাবে|pouchabe|pathaben|kobe pabo|cash on delivery|cod)\b/i,
  warranty: /\b(warranty|guarantee|ওয়ারেন্টি|গ্যারান্টি|service ?center|servicing|repair)\b/i,
  exchange: /\b(exchange|trade[- ]?in|এক্সচেঞ্জ|purano|old phone|puraton)\b/i,
  preorder: /\b(pre[- ]?order|booking|প্রি[- ]?অর্ডার|বুকিং)\b/i,
  tracking: /\b(track|tracking|order status|amar order|my order|ট্র্যাক|অর্ডার(ের)? (অবস্থা|স্ট্যাটাস))\b/i,
  contact: /\b(contact|phone number|hotline|number|address|location|outlet|shop|showroom|dokan|kothay|where|ঠিকানা|নম্বর|হটলাইন|আউটলেট|শোরুম|কোথায়|open|close|time|somoy|সময়)\b/i,
  offers: /\b(offer|offers|discount|deal|deals|sale|অফার|ডিসকাউন্ট|ছাড়)\b/i,
  categories: /\b(category|categories|ki ki ache|ki ki pawa|what do you sell|products list|ক্যাটাগরি|কি কি (আছে|পাওয়া))\b/i,
  payment: /\b(payment|pay|bkash|nagad|rocket|card|বিকাশ|নগদ|পেমেন্ট)\b/i,
  price: /\b(price|dam|koto|cost|দাম|কত|mullo|মূল্য|taka|tk)\b/i,
};

/* words that describe the *intent*, not the product — stripped before searching the catalog */
const INTENT_WORDS =
  /\b(emi|installment|kisti|delivery|deliver|shipping|ship|courier|warranty|guarantee|exchange|pre[- ]?order|booking|track|tracking|order|status|contact|hotline|number|address|location|outlet|shop|showroom|dokan|kothay|where|open|close|time|somoy|offer|offers|discount|deal|deals|sale|payment|pay|bkash|nagad|rocket|price|dam|koto|cost|available|stock|category|categories|hi|hello|hey)\b/gi;
const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function localAnswer(text: string): string {
  const lang = detectLang(text);
  const t = text.trim();
  const F = facts(lang);

  // product lookup on the message minus intent words ("iphone 17 emi koto" → "iphone 17")
  const productQuery = t.replace(INTENT_WORDS, " ");
  const matches = searchProducts(productQuery, 5);
  const strongMatch =
    matches.length > 0 &&
    tokens(productQuery).some((tok) => tok.length >= 3 && new RegExp(`\\b${escapeRx(tok)}`, "i").test(matches[0].name));

  if (RX.greet.test(t) && !strongMatch && !RX.price.test(t)) return T.greet[lang];
  if (RX.thanks.test(t) && !strongMatch) return T.thanks[lang];

  if (RX.emi.test(t)) return strongMatch ? `${F.emi}\n\n${emiFor(matches[0], lang)}` : F.emi;
  if (RX.tracking.test(t)) return F.tracking;
  if (RX.delivery.test(t)) return F.delivery;
  if (RX.warranty.test(t)) return F.warranty;
  if (RX.exchange.test(t)) return F.exchange;
  if (RX.preorder.test(t) && !strongMatch) return F.preorder;
  if (RX.payment.test(t) && !strongMatch) return F.delivery;
  if (RX.categories.test(t)) return `${T.categories[lang]}\n${categoryTiles.map((c) => `• [${c.name}](#/category/${c.slug})`).join("\n")}`;
  if (RX.contact.test(t) && !strongMatch) return F.contact;
  if (RX.offers.test(t) && !strongMatch) return F.offers;

  if (matches.length > 0) {
    return `${T.found[lang]}\n${matches.map((p) => "• " + priceLine(p)).join("\n")}${T.more[lang]}`;
  }
  if (RX.price.test(t)) return T.notFound[lang];
  if (RX.contact.test(t)) return F.contact;
  return T.fallback[lang];
}

function emiFor(p: P, lang: Lang) {
  const m12 = Math.ceil(p.price / 12);
  const m24 = Math.ceil(p.price / 24);
  const m36 = Math.ceil(p.price / 36);
  const head = `**${p.name}** (${formatBDT(p.price)}) — 0% EMI:`;
  return lang === "bn"
    ? `${head} ১২ মাসে ≈ ${formatBDT(m12)}/মাস · ২৪ মাসে ≈ ${formatBDT(m24)}/মাস · ৩৬ মাসে ≈ ${formatBDT(m36)}/মাস`
    : `${head} 12 mo ≈ ${formatBDT(m12)}/mo · 24 mo ≈ ${formatBDT(m24)}/mo · 36 mo ≈ ${formatBDT(m36)}/mo`;
}

/* ---------------- AI (OpenAI-compatible) ---------------- */
function buildSystemPrompt(userText: string) {
  const ctx = searchProducts(userText, 8);
  const productCtx =
    ctx.length > 0
      ? ctx
          .map(
            (p) =>
              `- ${p.name} | price ${formatBDT(p.price)}${p.oldPrice ? ` (was ${formatBDT(p.oldPrice)})` : ""}${p.brand ? ` | brand ${p.brand}` : ""}${p.status === "pre-order" ? " | PRE-ORDER" : ""} | link ${productLink(p)}`
          )
          .join("\n")
      : "(no catalog match for this message — ask the customer for the exact model name and offer the search page #/search)";

  return [
    `You are "Tom", the friendly live-chat sales assistant of ${STORE.name}, a tech & gadget e-commerce store in Bangladesh (like a helpful shop staff member).`,
    `Reply in the SAME language/style the customer writes in: Bangla script → Bangla; romanised Bangla ("Banglish") → Banglish; English → English. Keep answers short (2–6 lines), warm, and use bullet points for lists. Prices are in Bangladeshi Taka (৳).`,
    `Only quote prices that appear in the CATALOG DATA below — never invent prices or stock. When you mention a catalog product, add its markdown link, e.g. [View](#/product/slug). If the customer asks about something not in the data, say you are not sure and suggest the search page (#/search) or the hotline ${STORE.hotline}.`,
    ``,
    `STORE FACTS:`,
    `- Hotline ${STORE.hotline}, email ${STORE.email}, hours ${STORE.hours}.`,
    `- Outlets: ${STORE.outlets.join(" | ")}`,
    `- Delivery: ${STORE.delivery}`,
    `- Payment: ${STORE.payment}`,
    `- EMI: ${STORE.emi} (EMI page: #/emi)`,
    `- Warranty: ${STORE.warranty} (#/info/warranty-policy)`,
    `- Exchange: ${STORE.exchange} (#/exchange)`,
    `- Pre-order: ${STORE.preorder} (#/pre-order)`,
    `- Order tracking: #/track-order · Offers: #/offers · Categories: ${categoryTiles.map((c) => `${c.name} (#/category/${c.slug})`).join(", ")}`,
    ``,
    `CATALOG DATA relevant to the customer's latest message:`,
    productCtx,
  ].join("\n");
}

export async function askAI(history: ChatMsg[], userText: string, settings: ChatSettings, signal?: AbortSignal): Promise<string> {
  const { url, model } = resolveEndpoint(settings);
  if (!settings.apiKey.trim() || !url || !model) throw new Error("AI is not configured");

  const messages = [
    { role: "system", content: buildSystemPrompt(userText) },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userText },
  ];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${settings.apiKey.trim()}`,
  };
  if (settings.provider === "openrouter") {
    headers["HTTP-Referer"] = location.origin;
    headers["X-Title"] = STORE.name;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 600 }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 200);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from API");
  return content.trim();
}

/** Ask the AI when configured; otherwise (or on failure) use the rate-limited /api/chat assistant. */
export async function getReply(
  history: ChatMsg[],
  userText: string,
  settings: ChatSettings,
  signal?: AbortSignal
): Promise<{ text: string; ai: boolean; error?: string }> {
  // Check server-side chat rate limit first
  try {
    const rlRes = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({ message: userText }),
    });
    if (rlRes.status === 429) {
      const errData = await rlRes.json().catch(() => ({}));
      return {
        text: errData.error || "Too many chat messages. Please wait a minute before sending more.",
        ai: false,
        error: errData.error,
      };
    }
    if (!isAIConfigured(settings) && rlRes.ok) {
      const d = await rlRes.json();
      if (d.text) return { text: d.text, ai: false };
    }
  } catch {
    /* fallback if offline */
  }

  if (isAIConfigured(settings)) {
    try {
      const text = await askAI(history, userText, settings, signal);
      return { text, ai: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { text: localAnswer(userText), ai: false, error: msg };
    }
  }
  return { text: localAnswer(userText), ai: false };
}
