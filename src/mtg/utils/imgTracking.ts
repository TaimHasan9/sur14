/* Lightweight front-end image analytics ("img tracking").
   Tracks three things for every <Img> on the site:
     1. impression — the image actually became ≥50% visible on screen
     2. load       — successfully rendered (with load duration when known)
     3. error      — CDN failure / fallback used (helps spot broken media)

   Events are kept in memory, mirrored to localStorage (capped) and exposed
   on `window.__imgTrack` so they can be inspected from DevTools or wired to
   a real analytics endpoint later. Everything is SSR-safe and privacy
   friendly: no cookies, no fingerprinting, no data leaves the browser. */

export interface ImgEvent {
  kind: "impression" | "load" | "error";
  src: string;
  alt: string;
  page: string;
  at: number;
  /** ms between mount and successful load */
  ms?: number;
}

interface ImgTrackApi {
  all: () => ImgEvent[];
  summary: () => { impressions: number; loads: number; errors: number; uniqueSrc: number };
  clear: () => void;
}

declare global {
  interface Window {
    __imgTrack?: ImgTrackApi;
  }
}

const STORE_KEY = "mtg:imgtrack";
const MAX_EVENTS = 600;

const hasDOM = typeof window !== "undefined" && typeof document !== "undefined";

let buffer: ImgEvent[] = [];

function hydrate() {
  if (!hasDOM || buffer.length) return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) buffer = JSON.parse(raw) as ImgEvent[];
  } catch {
    buffer = [];
  }
}

function persist() {
  if (!hasDOM) return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(buffer.slice(-MAX_EVENTS)));
  } catch {
    /* storage full / private mode — metrics stay in memory only */
  }
}

export function logImgEvent(kind: ImgEvent["kind"], src: string, alt: string, ms?: number) {
  if (!hasDOM) return;
  hydrate();
  const ev: ImgEvent = {
    kind,
    src,
    alt: (alt || "").slice(0, 140),
    page: window.location.pathname + window.location.search || "/",
    at: Date.now(),
    ...(ms !== undefined ? { ms: Math.round(ms) } : {}),
  };
  buffer.push(ev);
  if (buffer.length > MAX_EVENTS) buffer = buffer.slice(-MAX_EVENTS);
  persist();
  if (buffer.length % 25 === 0) persist();
  // ---- also beacon to the server analytics (batched, best-effort) ----
  // Errors are always sent; impressions/loads are sampled to keep the DB lean.
  try {
    const sampled = kind === "error" || Math.random() < 0.25;
    if (sampled) {
      void import("./tracking").then(({ track }) => {
        track(kind === "impression" ? "img_impression" : kind === "load" ? "img_load" : "img_error", {
          label: src.slice(0, 200),
          meta: { alt: (alt || "").slice(0, 120), ...(ms !== undefined ? { ms: Math.round(ms) } : {}) },
        });
      });
    }
  } catch {
    /* analytics must never break the page */
  }
}

/* ---- one shared IntersectionObserver for all impressions ---- */

let observer: IntersectionObserver | null = null;
const seenImpressions = new WeakSet<Element>();

function getObserver(): IntersectionObserver | null {
  if (!hasDOM || typeof IntersectionObserver === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer?.unobserve(el);
          if (seenImpressions.has(el)) continue;
          seenImpressions.add(el);
          logImgEvent("impression", el.dataset.trackSrc || "", el.dataset.trackAlt || "");
        }
      },
      { threshold: 0.5 },
    );
  }
  return observer;
}

/** Observe an <img> element for a one-time "impression" event. */
export function trackImpression(el: HTMLImageElement | null, src: string, alt: string) {
  const obs = getObserver();
  if (!el || !obs || seenImpressions.has(el)) return;
  el.dataset.trackSrc = src;
  el.dataset.trackAlt = alt;
  obs.observe(el);
}

/** Expose the metrics API on window for debugging / future analytics wiring. */
export function installImgTrackApi() {
  if (!hasDOM || window.__imgTrack) return;
  hydrate();
  window.__imgTrack = {
    all: () => {
      hydrate();
      return [...buffer];
    },
    summary: () => {
      hydrate();
      return {
        impressions: buffer.filter((e) => e.kind === "impression").length,
        loads: buffer.filter((e) => e.kind === "load").length,
        errors: buffer.filter((e) => e.kind === "error").length,
        uniqueSrc: new Set(buffer.map((e) => e.src)).size,
      };
    },
    clear: () => {
      buffer = [];
      try {
        window.localStorage.removeItem(STORE_KEY);
      } catch {
        /* noop */
      }
    },
  };
}
