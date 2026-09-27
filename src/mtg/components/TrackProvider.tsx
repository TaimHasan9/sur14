"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track, flush, type TrackType, type TrackEvent } from "@/mtg/utils/tracking";

const TrackCtx = createContext<{ track: (type: TrackType, data?: Omit<TrackEvent, "type">) => void }>({ track });

export function useTrack() {
  return useContext(TrackCtx);
}

/** Truncates noisy labels (SVG soup etc.) into something readable. */
function labelFor(el: Element): string {
  const explicit = (el as HTMLElement).dataset?.track;
  if (explicit) return explicit.slice(0, 120);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 120);
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);
  if (el.tagName === "A") return `Link → ${(el as HTMLAnchorElement).pathname || "/"}`.slice(0, 120);
  return `${el.tagName} click`;
}

export default function TrackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // page view on every route change
  useEffect(() => {
    const q = searchParams?.toString();
    track("page_view", { label: q ? `${pathname}?${q}` : pathname, path: q ? `${pathname}?${q}` : pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // global button / link click tracking (answers "kon button chaplo")
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || !(t instanceof Element)) return;
      const el = t.closest("button, a, [data-track]");
      if (!el) return;
      const tag = el.tagName;
      const href = tag === "A" ? (el as HTMLAnchorElement).getAttribute("href") || "" : "";
      // skip tracking the analytics flush itself / admin noise is fine to keep
      track("click", {
        label: labelFor(el),
        meta: { tag, href: href.slice(0, 200) },
      });
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    const iv = setInterval(() => void flush(), 15000);
    return () => {
      document.removeEventListener("click", onClick, { capture: true } as AddEventListenerOptions);
      clearInterval(iv);
    };
  }, []);

  return <TrackCtx.Provider value={{ track }}>{children}</TrackCtx.Provider>;
}
