"use client";
import { useEffect } from "react";

const DEFAULT_TITLE = "Mr Tom Gadgets BD - Bangladesh's Trusted Tech & Lifestyle Store";
const DEFAULT_DESC =
  "Shop genuine Apple products, Samsung phones, home appliances, and accessories in Bangladesh. Best prices, free delivery, and exchange facility.";

/**
 * Client-side replacement for Next.js `metadata` / `generateMetadata`.
 * Sets <title> and <meta name="description"> for the current page.
 */
export default function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    document.title = title ?? DEFAULT_TITLE;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description ?? DEFAULT_DESC;

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);

  return null;
}
