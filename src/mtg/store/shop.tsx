"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { track, getSessionId } from "@/mtg/utils/tracking";

export interface CartLine {
  slug: string;
  qty: number;
}

export interface ShopUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  emailVerified?: boolean;
  address: string | null;
  district: string | null;
}

interface ShopState {
  // cart (same API as the original frontend — slug based)
  cart: CartLine[];
  wishlist: string[];
  compare: string[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clearCart: () => void;
  toggleWish: (slug: string) => void;
  toggleCompare: (slug: string) => void;
  cartCount: number;
  cartReady: boolean;
  // auth (new — real backend)
  user: ShopUser | null;
  authLoading: boolean;
  refreshMe: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<ShopState | null>(null);

export function useShop(): ShopState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside <ShopProvider>");
  return v;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [user, setUser] = useState<ShopUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- initial load: localStorage + backend merge ---------- */
  useEffect(() => {
    setCart(load<CartLine[]>("ag_cart", []));
    setWishlist(load<string[]>("ag_wish", []));
    setCompare(load<string[]>("ag_compare", []));
    setReady(true);

    // merge with server-side cart (logged-in user or guest)
    (async () => {
      try {
        const guestId = getSessionId();
        const res = await fetch(`/api/cart?guestId=${encodeURIComponent(guestId)}`, { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setCart((local) => {
            const merged = new Map<string, number>();
            for (const l of local) merged.set(l.slug, (merged.get(l.slug) || 0) + l.qty);
            for (const l of data.lines as CartLine[]) merged.set(l.slug, Math.max(merged.get(l.slug) || 0, l.qty));
            return [...merged.entries()].map(([slug, qty]) => ({ slug, qty }));
          });
        }
      } catch {
        /* offline — local cart only */
      } finally {
        setCartReady(true);
      }
    })();

    // auth session
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  /* ---------- persist locally ---------- */
  useEffect(() => {
    if (ready) localStorage.setItem("ag_cart", JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem("ag_wish", JSON.stringify(wishlist));
  }, [wishlist, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem("ag_compare", JSON.stringify(compare));
  }, [compare, ready]);

  /* ---------- sync cart to backend (debounced) ---------- */
  useEffect(() => {
    if (!ready) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sync: true, lines: cart, guestId: getSessionId() }),
        });
      } catch {
        /* offline — will retry on next change */
      }
    }, 900);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [cart, ready]);

  const refreshMe = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  };

  const value = useMemo<ShopState>(() => {
    const add = (slug: string, qty = 1) => {
      setCart((c) => {
        const found = c.find((l) => l.slug === slug);
        if (found) return c.map((l) => (l.slug === slug ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
        return [...c, { slug, qty: Math.min(10, qty) }];
      });
      track("add_to_cart", { label: slug, productSlug: slug, meta: { qty } });
    };
    const setQty = (slug: string, qty: number) => {
      setCart((c) => (qty <= 0 ? c.filter((l) => l.slug !== slug) : c.map((l) => (l.slug === slug ? { ...l, qty: Math.min(10, qty) } : l))));
      if (qty <= 0) track("remove_from_cart", { label: slug, productSlug: slug });
    };
    const remove = (slug: string) => {
      setCart((c) => c.filter((l) => l.slug !== slug));
      track("remove_from_cart", { label: slug, productSlug: slug });
    };
    const clearCart = () => setCart([]);
    const toggleWish = (slug: string) => {
      setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
      track("wishlist", { label: slug, productSlug: slug });
    };
    const toggleCompare = (slug: string) => {
      setCompare((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
      track("compare", { label: slug, productSlug: slug });
    };

    const login = async (identifier: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, guestId: getSessionId() }),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false as const, error: data.error || "Login failed" };
        setUser(data.user);
        track("login", { label: data.user?.email || identifier });
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "Network error. Try again." };
      }
    };

    const register = async (data: { name: string; email: string; phone?: string; password: string }) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, guestId: getSessionId() }),
        });
        const d = await res.json();
        if (!res.ok) return { ok: false as const, error: d.error || "Registration failed" };
        setUser(d.user);
        track("register", { label: d.user?.email || data.email });
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "Network error. Try again." };
      }
    };

    const logout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        /* noop */
      }
      track("logout", {});
      setUser(null);
    };

    return {
      cart, wishlist, compare, add, setQty, remove, clearCart,
      toggleWish, toggleCompare,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      cartReady, user, authLoading, refreshMe, login, register, logout,
    };
  }, [cart, wishlist, compare, cartReady, user, authLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
