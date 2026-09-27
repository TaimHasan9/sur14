import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mrtomgadgets.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/account", "/cart", "/checkout", "/track-order"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
