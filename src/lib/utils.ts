export function formatBDT(n: number): string {
  return "৳" + Number(n || 0).toLocaleString("en-IN");
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function orderStatusBn(status: string): string {
  const map: Record<string, string> = {
    pending: "পেন্ডিং",
    confirmed: "কনফার্ম",
    packed: "প্যাকড",
    shipped: "শিপড",
    delivered: "ডেলিভার্ড",
    cancelled: "বাতিল",
  };
  return map[status] ?? status;
}

export function paymentMethodBn(method: string): string {
  const map: Record<string, string> = {
    cod: "ক্যাশ অন ডেলিভারি",
    bkash: "বিকাশ",
    nagad: "নগদ",
    rocket: "রকেট",
    card: "কার্ড",
  };
  return map[method] ?? method;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ab_guest_id");
  if (!id) {
    id = "g_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("ab_guest_id", id);
  }
  return id;
}
