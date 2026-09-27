"use client";

/**
 * Minimal standalone toast hook for the admin panel.
 * (The storefront uses @/mtg/store/shop; this keeps admin pages working
 * without mounting a second provider.)
 */
export function useShop() {
  const toast = (message: string, _type: "success" | "error" = "success") => {
    if (typeof window === "undefined") return;
    const el = document.createElement("div");
    el.textContent = message;
    el.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;" +
      "background:#111;color:#fff;padding:12px 20px;border-radius:12px;" +
      "font-size:14px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.3);";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  };
  return { toast };
}
