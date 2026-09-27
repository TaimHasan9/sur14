/* Mr Tom Gadgets — full-site analytics client.
   Batches events and beacons them to /api/track (PostgreSQL).
   Event types: page_view | product_view | click | search |
   add_to_cart | remove_from_cart | checkout_start | purchase |
   login | register | logout | wishlist | compare |
   img_impression | img_load | img_error
   Privacy-friendly: random session id only, no fingerprinting. */

export type TrackType =
  | "page_view"
  | "product_view"
  | "click"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "purchase"
  | "login"
  | "register"
  | "logout"
  | "wishlist"
  | "compare"
  | "img_impression"
  | "img_load"
  | "img_error";

export interface TrackEvent {
  type: TrackType;
  label?: string;
  path?: string;
  productSlug?: string;
  meta?: Record<string, unknown>;
}

const SID_KEY = "mtg_sid";
const hasDOM = typeof window !== "undefined";

export function getSessionId(): string {
  if (!hasDOM) return "";
  let id = "";
  try {
    id = window.localStorage.getItem(SID_KEY) || "";
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(SID_KEY, id);
    }
  } catch {
    id = "s_mem_" + Math.random().toString(36).slice(2);
  }
  return id;
}

let queue: TrackEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sending = false;

function currentPath(): string {
  if (!hasDOM) return "";
  return window.location.pathname + window.location.search;
}

export function track(type: TrackType, data: Omit<TrackEvent, "type"> = {}): void {
  if (!hasDOM) return;
  queue.push({ type, path: currentPath(), ...data });
  if (queue.length >= 12) {
    void flush();
  } else if (!timer) {
    timer = setTimeout(() => void flush(), 6000);
  }
}

export async function flush(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!hasDOM || sending || queue.length === 0) return;
  sending = true;
  const batch = queue.splice(0, 60);
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ sessionId: getSessionId(), events: batch }),
    });
  } catch {
    // offline — drop (best effort analytics)
  } finally {
    sending = false;
    if (queue.length > 0) {
      timer = setTimeout(() => void flush(), 8000);
    }
  }
}

if (hasDOM) {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });
  window.addEventListener("pagehide", () => void flush());
}
