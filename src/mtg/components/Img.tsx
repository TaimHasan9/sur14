"use client";
import { useEffect, useRef, useState } from "react";
import { IMG_FALLBACK, IMG_PLACEHOLDER, resolveImg } from "@/mtg/data/catalog";
import { logImgEvent, trackImpression } from "@/mtg/utils/imgTracking";

/**
 * Image with graceful degradation + "img tracking":
 * 1. `/img/...` local paths are resolved to their CDN twin up-front (the repo
 *    ships without a /public folder, so this avoids a broken-image flash).
 * 2. If the CDN image itself fails, we fall back to a neutral placeholder so
 *    the layout never shows a broken icon.
 * 3. Every image reports impression (≥50% visible), load time and errors to
 *    the lightweight analytics in `utils/imgTracking`.
 */
export default function Img({
  src,
  alt,
  className = "",
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [cur, setCur] = useState(() => resolveImg(src));
  const ref = useRef<HTMLImageElement | null>(null);
  const bornAt = useRef<number>(typeof performance !== "undefined" ? performance.now() : 0);

  useEffect(() => {
    setCur(resolveImg(src));
    bornAt.current = typeof performance !== "undefined" ? performance.now() : 0;
  }, [src]);

  /* register a one-time view-impression for this image */
  useEffect(() => {
    trackImpression(ref.current, cur, alt);
  }, [cur, alt]);

  return (
    <img
      ref={ref}
      src={cur}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onLoad={() => {
        const ms = typeof performance !== "undefined" ? performance.now() - bornAt.current : undefined;
        logImgEvent("load", cur, alt, ms);
      }}
      onError={() => {
        logImgEvent("error", cur, alt);
        const fb = IMG_FALLBACK[cur];
        if (fb && fb !== cur) setCur(fb);
        else if (cur !== IMG_PLACEHOLDER) setCur(IMG_PLACEHOLDER);
      }}
    />
  );
}
