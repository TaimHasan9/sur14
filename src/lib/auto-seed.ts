import { db } from "@/db";
import { users, categories, products, coupons } from "@/db/schema";
import { allProducts, exclusiveDeals, type P } from "@/mtg/data/catalog";
import { extraCategories } from "@/mtg/data/extraCatalog";
import { bdCategories } from "@/mtg/data/bdCatalog";
import { hashPassword } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

const CAT_ICONS: Record<string, string> = {
  iphone: "🍎",
  apple: "🍎",
  macbook: "💻",
  ipad: "📱",
  "apple-watch": "⌚",
  samsung: "📱",
  oppo: "📱",
  vivo: "📱",
  xiaomi: "📱",
  realme: "📱",
  laptop: "💻",
  computer: "🖥️",
  tablet: "📱",
  watch: "⌚",
  earbuds: "🎧",
  tv: "📺",
  fridge: "❄️",
  ac: "❄️",
  fan: "🌀",
  camera: "📷",
  router: "📡",
  printer: "🖨️",
  drone: "🛸",
  console: "🎮",
  audio: "🔊",
};

function iconFor(slug: string): string {
  for (const [k, v] of Object.entries(CAT_ICONS)) {
    if (slug.includes(k)) return v;
  }
  return "📱";
}

let seedPromise: Promise<{ categories: number; products: number }> | null = null;

export async function ensureCatalogSeeded(): Promise<{ categories: number; products: number }> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@mrtomgadgets.com").toLowerCase();
      const adminStrongPassword = process.env.ADMIN_INITIAL_PASSWORD || "MrTom#Admin2026!Secure9";

      // Ensure initial super_admin exists with strong password (no weak admin123, no demo customer)
      const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
      if (existingAdmin.length === 0) {
        await db
          .insert(users)
          .values({
            name: "Super Admin",
            email: adminEmail,
            phone: "01700000000",
            passwordHash: hashPassword(adminStrongPassword),
            role: "super_admin",
            emailVerified: true,
            address: "Bashundhara City, Dhaka",
            district: "Dhaka",
          })
          .onConflictDoNothing();
      } else if (existingAdmin[0].role === "admin") {
        // Upgrade primary admin to super_admin
        await db.update(users).set({ role: "super_admin", emailVerified: true }).where(eq(users.id, existingAdmin[0].id));
      }

      // Check if catalog products are already seeded
      const existingProds = await db.select({ c: sql<number>`count(*)` }).from(products);
      const prodTotal = Number(existingProds[0]?.c ?? 0);
      if (prodTotal > 0) {
        const existingCats = await db.select({ c: sql<number>`count(*)` }).from(categories);
        return { categories: Number(existingCats[0]?.c ?? 0), products: prodTotal };
      }

      // ── categories (bd + extra catalogs, deduped) ──
      const catDefs = new Map<string, { title: string; tagline: string }>();
      for (const c of [...bdCategories, ...extraCategories]) {
        if (!catDefs.has(c.slug)) catDefs.set(c.slug, { title: c.title, tagline: c.tagline });
      }
      const prodCat = new Map<string, string>();
      for (const c of [...bdCategories, ...extraCategories]) {
        for (const it of c.items) {
          if (!prodCat.has(it.slug)) prodCat.set(it.slug, c.slug);
        }
      }

      let order = 1;
      for (const [slug, c] of catDefs) {
        await db
          .insert(categories)
          .values({
            name: c.title,
            slug,
            description: c.tagline,
            icon: iconFor(slug),
            gradient: "from-orange-500 to-amber-600",
            sortOrder: order++,
          })
          .onConflictDoNothing();
      }

      const allCats = await db.select().from(categories);
      const catIdBySlug = new Map(allCats.map((c) => [c.slug, c.id]));

      // ── products (whole catalog, deduped by slug) ──
      const featuredSlugs = new Set(exclusiveDeals.map((p: P) => p.slug));
      const seen = new Set<string>();
      const items: P[] = [];
      for (const p of allProducts) {
        if (!p.slug || seen.has(p.slug)) continue;
        seen.add(p.slug);
        items.push(p);
      }

      const chunk = 150;
      for (let i = 0; i < items.length; i += chunk) {
        const slice = items.slice(i, i + chunk);
        await db
          .insert(products)
          .values(
            slice.map((p) => {
              const discount =
                p.oldPrice && p.oldPrice > p.price
                  ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
                  : 0;
              const catSlug = prodCat.get(p.slug);
              return {
                categoryId: (catSlug && catIdBySlug.get(catSlug)) || null,
                name: p.name.slice(0, 200),
                slug: p.slug.slice(0, 220),
                description: `${p.name} — 100% genuine with official warranty in Bangladesh. Best price at Mr Tom Gadgets with EMI, exchange & fastest home delivery.`,
                price: Math.round(p.price),
                comparePrice: p.oldPrice ? Math.round(p.oldPrice) : null,
                stock: p.status === "pre-order" ? 15 : 40,
                sku: "MTG-" + p.id,
                images: [p.img],
                emoji: "📱",
                gradient: "from-orange-100 to-amber-200",
                featured: featuredSlugs.has(p.slug),
                isActive: true,
                isNew: p.status === "pre-order",
                discountPercent: discount,
                ratingAvg: 4.5,
                ratingCount: 0,
                totalSold: 0,
                tags: p.brand ? [p.brand] : [],
              };
            })
          )
          .onConflictDoNothing();
      }

      // ── coupons ──
      await db
        .insert(coupons)
        .values([
          { code: "AG500", type: "flat", value: 500, minOrder: 5000, maxDiscount: 500, usageLimit: 1000, isActive: true },
          { code: "AG10", type: "percent", value: 10, minOrder: 2000, maxDiscount: 1000, usageLimit: 1000, isActive: true },
          { code: "AGNEW", type: "percent", value: 5, minOrder: 1000, maxDiscount: 400, usageLimit: 2000, isActive: true },
          { code: "WELCOME10", type: "percent", value: 10, minOrder: 500, maxDiscount: 300, usageLimit: 1000, isActive: true },
          { code: "EID20", type: "percent", value: 20, minOrder: 1500, maxDiscount: 800, usageLimit: 500, isActive: true },
        ])
        .onConflictDoNothing();

      const finalCount = await db.select({ c: sql<number>`count(*)` }).from(products);
      return { categories: allCats.length, products: Number(finalCount[0]?.c ?? 0) };
    } finally {
      seedPromise = null;
    }
  })();
  return seedPromise;
}
