"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { useShop } from "@/store/ShopContext";

type P = {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  categoryId: string | null;
  description: string | null;
  descriptionBn: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  images: string[] | null;
  emoji: string | null;
  featured: boolean;
  isActive: boolean;
  isNew: boolean;
  totalSold: number;
  categoryName: string | null;
};

type Cat = { id: string; name: string; nameBn: string | null; slug: string };

const EMOJIS = ["📦", "🥻", "👘", "👗", "👖", "👞", "🧕", "📱", "🎧", "⌚", "📺", "🍚", "🌀", "💻", "📷", "🎮", "🔊"];

export default function AdminProductsPage() {
  const { toast } = useShop();
  const [products, setProducts] = useState<P[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<P | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nameBn: "",
    slug: "",
    categoryId: "",
    sku: "",
    description: "",
    descriptionBn: "",
    price: "",
    comparePrice: "",
    stock: "",
    imageUrl: "",
    emoji: "📱",
  });

  const load = () => {
    setLoading(true);
    fetch(`/api/products?all=1&q=${encodeURIComponent(q)}&limit=48`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/categories?all=1")
      .then((r) => r.json())
      .then((d) =>
        setCats(
          (d.categories ?? []).map((c: Record<string, string>) => ({
            id: c.id,
            name: c.name,
            nameBn: c.nameBn,
            slug: c.slug,
          }))
        )
      );
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      nameBn: "",
      slug: "",
      categoryId: cats[0]?.id || "",
      sku: "",
      description: "",
      descriptionBn: "",
      price: "",
      comparePrice: "",
      stock: "40",
      imageUrl: "",
      emoji: "📱",
    });
    setModal(true);
  };

  const openEdit = (p: P) => {
    setEditing(p);
    setForm({
      name: p.name,
      nameBn: p.nameBn || "",
      slug: p.slug,
      categoryId: p.categoryId || "",
      sku: p.sku || "",
      description: p.description || "",
      descriptionBn: p.descriptionBn || "",
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock),
      imageUrl: p.images?.[0] || "",
      emoji: p.emoji || "📱",
    });
    setModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        toast(d.error || "ছবি আপলোড ব্যর্থ", "error");
      } else {
        setForm((f) => ({ ...f, imageUrl: d.url }));
        toast(`ছবি আপলোড হয়েছে (${d.provider}) ✅`);
      }
    } catch {
      toast("ছবি আপলোড ব্যর্থ", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      name: form.name,
      nameBn: form.nameBn || null,
      categoryId: form.categoryId || null,
      sku: form.sku || undefined,
      description: form.description || null,
      descriptionBn: form.descriptionBn || null,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      images: form.imageUrl ? [form.imageUrl] : [],
      emoji: form.emoji,
    };
    let res;
    if (editing) {
      res = await fetch(`/api/products/${editing.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }),
      });
    }
    if (res.ok) {
      toast(editing ? "পণ্য আপডেট হয়েছে ✅" : "নতুন পণ্য যোগ হয়েছে ✅");
      setModal(false);
      load();
    } else {
      const d = await res.json();
      toast(d.error || "সংরক্ষণ ব্যর্থ", "error");
    }
  };

  const toggle = async (p: P, field: "featured" | "isActive" | "isNew") => {
    const res = await fetch(`/api/products/${p.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    if (res.ok) load();
    else toast("অনুমতি নেই বা আপডেট ব্যর্থ", "error");
  };

  const remove = async (p: P) => {
    if (!confirm(`"${p.nameBn || p.name}" মুছে ফেলবেন?`)) return;
    const res = await fetch(`/api/products/${p.slug}`, { method: "DELETE" });
    if (res.ok) {
      toast("পণ্য মুছে ফেলা হয়েছে");
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "মোছা ব্যর্থ", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 পণ্য বা SKU খুঁজুন..."
          className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm"
        />
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> নতুন পণ্য
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-400">লোড হচ্ছে...</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase text-slate-400">
                <th className="p-3">পণ্য</th>
                <th className="p-3">দাম</th>
                <th className="p-3">স্টক</th>
                <th className="p-3">বিক্রি</th>
                <th className="p-3">ফ্ল্যাগ</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3">
                    <span className="flex items-center gap-2.5">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg border object-cover" />
                      ) : (
                        <span className="text-2xl">{p.emoji}</span>
                      )}
                      <span>
                        <span className="block font-bold">{p.nameBn || p.name}</span>
                        <span className="block text-xs text-slate-400">
                          {p.categoryName || "—"} • /{p.slug} {p.sku ? `• ${p.sku}` : ""}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="p-3 font-black text-emerald-700">{formatBDT(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-black ${
                        p.stock < 20 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{p.totalSold}</td>
                  <td className="p-3">
                    <span className="flex gap-1">
                      <button
                        onClick={() => toggle(p, "featured")}
                        title="ফিচার্ড"
                        className={`rounded-lg px-2 py-1 text-[11px] font-black ${
                          p.featured ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => toggle(p, "isNew")}
                        title="নতুন"
                        className={`rounded-lg px-2 py-1 text-[11px] font-black ${
                          p.isNew ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        N
                      </button>
                      <button
                        onClick={() => toggle(p, "isActive")}
                        title="সক্রিয়"
                        className={`rounded-lg px-2 py-1 text-[11px] font-black ${
                          p.isActive ? "bg-emerald-500 text-white" : "bg-red-400 text-white"
                        }`}
                      >
                        {p.isActive ? "ON" : "OFF"}
                      </button>
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{editing ? "✏️ পণ্য এডিট" : "➕ নতুন পণ্য"}</h3>
              <button type="button" onClick={() => setModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold">English Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">বাংলা নাম</label>
                  <input
                    value={form.nameBn}
                    onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold">Slug *</label>
                  <input
                    required
                    disabled={!!editing}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="product-slug"
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">ক্যাটাগরি</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload System */}
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3">
                <label className="text-xs font-bold text-emerald-900">🖼️ পণ্যের ছবি (Cloudinary / S3 / R2 / Local Upload)</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... অথবা নিচের বাটনে ছবি আপলোড করুন"
                    className="flex-1 rounded-xl border bg-white px-3 py-2 text-xs"
                  />
                  <label className="flex cursor-pointer items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "আপলোড..." : "আপলোড"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Preview" className="h-12 w-12 rounded-lg border object-cover" />
                    <span className="truncate text-[11px] text-emerald-700">{form.imageUrl}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold">বিবরণ (Description)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold">দাম (৳) *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">আগের দাম</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold">স্টক *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold">ইমোজি আইকন</label>
                <div className="mt-1 flex flex-wrap gap-1 rounded-xl border p-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`rounded-lg p-1 text-xl ${
                        form.emoji === e ? "bg-emerald-100 ring-2 ring-emerald-500" : "hover:bg-slate-100"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full rounded-2xl bg-emerald-600 py-3 font-black text-white hover:bg-emerald-700">
                {editing ? "আপডেট করুন" : "পণ্য যোগ করুন"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
