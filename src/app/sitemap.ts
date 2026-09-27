import type { MetadataRoute } from "next";
import { allProducts } from "@/mtg/data/catalog";
import { extraCategories } from "@/mtg/data/extraCatalog";
import { bdCategories } from "@/mtg/data/bdCatalog";
import { posts } from "@/mtg/data/blog";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mrtomgadgets.com";
  const now = new Date();

  const staticRoutes = [
    "", "/cart", "/checkout", "/wishlist", "/compare", "/account", "/offers",
    "/pre-order", "/emi", "/exchange", "/track-order", "/contact", "/careers", "/blog",
  ];

  const urls: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: base + r,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.7,
  }));

  const seenCats = new Set<string>();
  for (const c of [...bdCategories, ...extraCategories]) {
    if (seenCats.has(c.slug)) continue;
    seenCats.add(c.slug);
    urls.push({ url: `${base}/category/${c.slug}`, lastModified: now, changeFrequency: "daily", priority: 0.85 });
  }

  const seenProducts = new Set<string>();
  for (const p of allProducts) {
    if (!p.slug || seenProducts.has(p.slug)) continue;
    seenProducts.add(p.slug);
    urls.push({ url: `${base}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }

  for (const post of posts) {
    urls.push({ url: `${base}/blog/${post.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }

  return urls;
}
