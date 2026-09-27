"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  TicketPercent,
  Star,
  Users,
  History,
  Mail,
  Plus,
  Trash2,
  Pencil,
  Check,
  EyeOff,
} from "lucide-react";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { useShop } from "@/store/ShopContext";

type CategoryRow = {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
};

type ReviewRow = {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  userName: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
};

type ActivityLogRow = {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  ipAddress: string | null;
  createdAt: string;
};

type EmailLogRow = {
  id: string;
  toEmail: string;
  subject: string;
  template: string;
  orderNumber: string | null;
  status: string;
  provider: string;
  createdAt: string;
};

type Msg = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminMorePage() {
  const { toast } = useShop();
  const [tab, setTab] = useState<"categories" | "coupons" | "reviews" | "users" | "logs" | "messages">("categories");

  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [editingCat, setEditingCat] = useState<CategoryRow | null>(null);
  const [catForm, setCatForm] = useState({ name: "", nameBn: "", slug: "", description: "", icon: "📱", sortOrder: "1" });

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrder: "0",
    maxDiscount: "",
    usageLimit: "",
  });

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "", role: "staff" });

  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [emails, setEmails] = useState<EmailLogRow[]>([]);
  const [logSubTab, setLogSubTab] = useState<"activity" | "emails">("activity");

  const [msgs, setMsgs] = useState<Msg[]>([]);

  const loadTab = (activeTab = tab) => {
    if (activeTab === "categories") {
      fetch("/api/categories?all=1")
        .then((r) => r.json())
        .then((d) => setCats(d.categories ?? []));
    }
    if (activeTab === "coupons") {
      fetch("/api/coupons")
        .then((r) => r.json())
        .then((d) => setCoupons(d.coupons ?? []));
    }
    if (activeTab === "reviews") {
      fetch("/api/reviews?all=1")
        .then((r) => r.json())
        .then((d) => setReviews(d.reviews ?? []));
    }
    if (activeTab === "users") {
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then((d) => setUsers(d.users ?? []));
    }
    if (activeTab === "logs") {
      fetch("/api/admin/logs?type=activity")
        .then((r) => r.json())
        .then((d) => setLogs(d.logs ?? []));
      fetch("/api/admin/logs?type=emails")
        .then((r) => r.json())
        .then((d) => setEmails(d.emails ?? []));
    }
    if (activeTab === "messages") {
      fetch("/api/contact")
        .then((r) => r.json())
        .then((d) => setMsgs(d.messages ?? []));
    }
  };

  useEffect(() => {
    loadTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Category CRUD handlers ──
  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCat ? "PUT" : "POST";
    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingCat?.id,
        name: catForm.name,
        nameBn: catForm.nameBn || null,
        slug: catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: catForm.description || null,
        icon: catForm.icon || "📦",
        sortOrder: Number(catForm.sortOrder || 0),
      }),
    });
    if (res.ok) {
      toast(editingCat ? "ক্যাটাগরি আপডেট হয়েছে ✅" : "নতুন ক্যাটাগরি তৈরি হয়েছে ✅");
      setEditingCat(null);
      setCatForm({ name: "", nameBn: "", slug: "", description: "", icon: "📱", sortOrder: "1" });
      loadTab("categories");
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "ক্যাটাগরি সেভ ব্যর্থ", "error");
    }
  };

  const toggleCategoryActive = async (c: CategoryRow) => {
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    if (res.ok) loadTab("categories");
    else toast("আপডেট ব্যর্থ", "error");
  };

  const deleteCategory = async (c: CategoryRow) => {
    if (!confirm(`"${c.name}" ক্যাটাগরি মুছে ফেলবেন?`)) return;
    const res = await fetch(`/api/categories?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
    if (res.ok) {
      toast("ক্যাটাগরি মুছে ফেলা হয়েছে");
      loadTab("categories");
    } else toast("মোছা ব্যর্থ", "error");
  };

  // ── Coupon CRUD handlers ──
  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder),
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
      }),
    });
    if (res.ok) {
      toast("কুপন তৈরি হয়েছে ✅");
      setCouponForm({ code: "", type: "percent", value: "", minOrder: "0", maxDiscount: "", usageLimit: "" });
      loadTab("coupons");
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "কুপন তৈরি ব্যর্থ", "error");
    }
  };

  const toggleCoupon = async (c: Coupon) => {
    const res = await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    if (res.ok) loadTab("coupons");
  };

  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`"${c.code}" কুপন মুছে ফেলবেন?`)) return;
    const res = await fetch(`/api/coupons?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
    if (res.ok) {
      toast("কুপন মুছে ফেলা হয়েছে");
      loadTab("coupons");
    } else toast("মোছা ব্যর্থ", "error");
  };

  // ── Review Moderation handlers ──
  const moderateReview = async (r: ReviewRow, isApproved: boolean) => {
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, isApproved }),
    });
    if (res.ok) {
      toast(isApproved ? "রিভিউ অনুমোদিত হয়েছে ✅" : "রিভিউ লুকানো হয়েছে");
      loadTab("reviews");
    } else toast("আপডেট ব্যর্থ", "error");
  };

  const deleteReview = async (r: ReviewRow) => {
    if (!confirm("এই রিভিউ মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/reviews?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    if (res.ok) {
      toast("রিভিউ মুছে ফেলা হয়েছে");
      loadTab("reviews");
    } else toast("মোছা ব্যর্থ", "error");
  };

  // ── User & Granular Role Management handlers ──
  const createStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const d = await res.json();
    if (res.ok) {
      toast(`নতুন ${userForm.role} একাউন্ট তৈরি হয়েছে ✅`);
      setUserForm({ name: "", email: "", phone: "", password: "", role: "staff" });
      loadTab("users");
    } else {
      toast(d.error || "ইউজার তৈরি ব্যর্থ", "error");
    }
  };

  const updateUserField = async (id: string, payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    const d = await res.json();
    if (res.ok) {
      toast("ইউজার আপডেট হয়েছে ✅");
      loadTab("users");
    } else {
      toast(d.error || "আপডেট ব্যর্থ", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["categories", "ক্যাটাগরি CRUD", <FolderKanban key="cat" className="h-4 w-4" />],
            ["coupons", "কুপন CRUD", <TicketPercent key="c" className="h-4 w-4" />],
            ["reviews", "রিভিউ মডারেশন", <Star key="r" className="h-4 w-4" />],
            ["users", "ইউজার ও রোল (RBAC)", <Users key="u" className="h-4 w-4" />],
            ["logs", "অ্যাক্টিভিটি ও ইমেইল লগ", <History key="l" className="h-4 w-4" />],
            ["messages", "মেসেজ", <Mail key="m" className="h-4 w-4" />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black ${
              tab === id ? "bg-slate-900 text-white" : "border bg-white"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* 1. Category CRUD */}
      {tab === "categories" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
          <form onSubmit={saveCategory} className="h-fit rounded-2xl border bg-white p-5">
            <h3 className="flex items-center gap-1.5 font-black">
              <Plus className="h-4 w-4" /> {editingCat ? "ক্যাটাগরি এডিট" : "নতুন ক্যাটাগরি"}
            </h3>
            <div className="mt-3 space-y-2.5">
              <input
                required
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Category Name (English) *"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <input
                value={catForm.nameBn}
                onChange={(e) => setCatForm({ ...catForm, nameBn: e.target.value })}
                placeholder="বাংলা নাম (ঐচ্ছিক)"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  placeholder="slug *"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <input
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                  placeholder="আইকন (📱)"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <input
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="বিবরণ / Tagline"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white">
                  {editingCat ? "আপডেট করুন" : "ক্যাটাগরি যোগ করুন"}
                </button>
                {editingCat && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(null);
                      setCatForm({ name: "", nameBn: "", slug: "", description: "", icon: "📱", sortOrder: "1" });
                    }}
                    className="rounded-xl border px-3 py-2 text-xs font-bold"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="space-y-2">
            {cats.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3.5">
                <span className="text-2xl">{c.icon || "📦"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-black">
                    {c.name} {c.nameBn ? `(${c.nameBn})` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    /{c.slug} • {c.productCount} পণ্য
                  </p>
                </div>
                <button
                  onClick={() => toggleCategoryActive(c)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                    c.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {c.isActive ? "Active" : "Hidden"}
                </button>
                <button
                  onClick={() => {
                    setEditingCat(c);
                    setCatForm({
                      name: c.name,
                      nameBn: c.nameBn || "",
                      slug: c.slug,
                      description: c.description || "",
                      icon: c.icon || "📱",
                      sortOrder: String(c.sortOrder || 1),
                    });
                  }}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteCategory(c)} className="rounded-lg bg-red-50 p-2 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Coupon Management */}
      {tab === "coupons" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
          <form onSubmit={createCoupon} className="h-fit rounded-2xl border bg-white p-5">
            <h3 className="flex items-center gap-1.5 font-black">
              <Plus className="h-4 w-4" /> নতুন কুপন
            </h3>
            <div className="mt-3 space-y-2.5">
              <input
                required
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="কোড (যেমন SAVE20)"
                className="w-full rounded-xl border px-3 py-2 text-sm font-bold uppercase"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={couponForm.type}
                  onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                  className="rounded-xl border px-3 py-2 text-sm font-bold"
                >
                  <option value="percent">শতাংশ %</option>
                  <option value="flat">ফ্ল্যাট ৳</option>
                </select>
                <input
                  required
                  type="number"
                  min={1}
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                  placeholder="ভ্যালু"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={couponForm.minOrder}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                  placeholder="সর্বনিম্ন অর্ডার"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={couponForm.maxDiscount}
                  onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                  placeholder="সর্বোচ্চ ছাড়"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <input
                type="number"
                value={couponForm.usageLimit}
                onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                placeholder="ব্যবহার লিমিট (ঐচ্ছিক)"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <button className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white">
                কুপন তৈরি করুন
              </button>
            </div>
          </form>
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-4">
                <span className="rounded-lg bg-emerald-600 px-3 py-1.5 font-black text-white">{c.code}</span>
                <span className="text-sm font-bold">
                  {c.type === "percent" ? `${c.value}% ছাড়` : `${formatBDT(c.value)} ছাড়`}
                </span>
                <span className="text-xs text-slate-500">
                  সর্বনিম্ন {formatBDT(c.minOrder)}
                  {c.maxDiscount ? ` • সর্বোচ্চ ${formatBDT(c.maxDiscount)}` : ""}
                </span>
                <span className="ml-auto text-xs font-bold text-slate-500">
                  ব্যবহার: {c.usedCount}
                  {c.usageLimit ? `/${c.usageLimit}` : ""}
                </span>
                <button
                  onClick={() => toggleCoupon(c)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                    c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteCoupon(c)} className="rounded-lg bg-red-50 p-2 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="rounded-2xl border bg-white py-10 text-center text-sm text-slate-400">কুপন নেই</p>
            )}
          </div>
        </div>
      )}

      {/* 3. Review Moderation */}
      {tab === "reviews" && (
        <div className="mt-4 space-y-2.5">
          {reviews.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{r.userName}</span>
                  <span className="text-amber-500 font-black">{"★".repeat(r.rating)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                      r.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.isApproved ? "Approved" : "Hidden / Pending"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{r.comment || "(No comment)"}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Product: {r.productName || r.productId} • {formatDateTime(r.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => moderateReview(r, !r.isApproved)}
                  className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black ${
                    r.isApproved ? "bg-amber-100 text-amber-800" : "bg-emerald-600 text-white"
                  }`}
                >
                  {r.isApproved ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </>
                  )}
                </button>
                <button onClick={() => deleteReview(r)} className="rounded-xl bg-red-50 p-2 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="rounded-2xl border bg-white py-10 text-center text-sm text-slate-400">কোনো রিভিউ নেই</p>
          )}
        </div>
      )}

      {/* 4. User & Granular Role Management (Super Admin / Admin / Manager / Staff) */}
      {tab === "users" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <form onSubmit={createStaffUser} className="h-fit rounded-2xl border bg-white p-5 space-y-2.5">
            <h3 className="font-black text-sm">➕ নতুন স্টাফ / অ্যাডমিন যোগ করুন</h3>
            <input
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="নাম *"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="ইমেইল *"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
            <input
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              placeholder="মোবাইল নম্বর"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="Strong Password (e.g. Staff#2026!)"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full rounded-xl border px-3 py-2 text-sm font-bold"
            >
              <option value="staff">Staff (অর্ডার ও স্ট্যাটাস)</option>
              <option value="manager">Manager (পণ্য, ক্যাটাগরি, অর্ডার)</option>
              <option value="admin">Admin (ফুল স্টোর ম্যানেজমেন্ট)</option>
              <option value="super_admin">Super Admin (সর্বোচ্চ পারমিশন)</option>
              <option value="customer">Customer</option>
            </select>
            <button className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white">
              একাউন্ট তৈরি করুন
            </button>
          </form>

          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-400">
                  <th className="p-3">নাম ও ইমেইল</th>
                  <th className="p-3">ভেরিফিকেশন</th>
                  <th className="p-3">রোল (Granular Role)</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">যোগদান</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-3">
                      <span className="block font-bold">{u.name}</span>
                      <span className="text-xs text-slate-500">
                        {u.email} {u.phone ? `• ${u.phone}` : ""}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => updateUserField(u.id, { emailVerified: !u.emailVerified })}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                          u.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {u.emailVerified ? "✓ Verified" : "Unverified"}
                      </button>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserField(u.id, { role: e.target.value })}
                        className="rounded-lg border bg-slate-50 px-2.5 py-1 text-xs font-black uppercase"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => updateUserField(u.id, { isBlocked: !u.isBlocked })}
                        className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                          u.isBlocked ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-red-50"
                        }`}
                      >
                        {u.isBlocked ? "Blocked" : "Active"}
                      </button>
                    </td>
                    <td className="p-3 text-xs text-slate-500">{formatDateTime(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Admin Activity Logs & Sent Email Logs */}
      {tab === "logs" && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setLogSubTab("activity")}
              className={`rounded-xl px-4 py-2 text-xs font-black ${
                logSubTab === "activity" ? "bg-emerald-600 text-white" : "border bg-white"
              }`}
            >
              🛡️ Admin Activity Log ({logs.length})
            </button>
            <button
              onClick={() => setLogSubTab("emails")}
              className={`rounded-xl px-4 py-2 text-xs font-black ${
                logSubTab === "emails" ? "bg-emerald-600 text-white" : "border bg-white"
              }`}
            >
              📧 Sent Order & Auth Emails ({emails.length})
            </button>
          </div>

          {logSubTab === "activity" ? (
            <div className="overflow-x-auto rounded-2xl border bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase text-slate-400">
                    <th className="p-3">অ্যাডমিন / স্টাফ</th>
                    <th className="p-3">অ্যাকশন</th>
                    <th className="p-3">বিবরণ (কে কী পরিবর্তন করেছে)</th>
                    <th className="p-3">সময় ও IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="p-3">
                        <span className="block font-bold">{l.actorName}</span>
                        <span className="text-xs text-slate-500">
                          {l.actorEmail} • <b className="uppercase text-emerald-700">{l.actorRole}</b>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                          {l.action}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{l.summary}</td>
                      <td className="p-3 text-xs text-slate-500">
                        {formatDateTime(l.createdAt)}
                        {l.ipAddress ? ` • ${l.ipAddress}` : ""}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        এখনো কোনো অ্যাক্টিভিটি লগ নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase text-slate-400">
                    <th className="p-3">প্রাপক (To)</th>
                    <th className="p-3">টেমপ্লেট</th>
                    <th className="p-3">বিষয় (Subject)</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">সময়</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((em) => (
                    <tr key={em.id} className="border-b last:border-0">
                      <td className="p-3 font-bold">{em.toEmail}</td>
                      <td className="p-3">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {em.template}
                        </span>
                      </td>
                      <td className="p-3">{em.subject}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                          {em.status} ({em.provider})
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{formatDateTime(em.createdAt)}</td>
                    </tr>
                  ))}
                  {emails.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        কোনো ইমেইল লগ নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Contact Messages */}
      {tab === "messages" && (
        <div className="mt-4 space-y-2">
          {msgs.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black">{m.name}</span>
                {m.phone && <span className="text-xs text-slate-500">📞 {m.phone}</span>}
                {m.email && <span className="text-xs text-slate-500">✉️ {m.email}</span>}
                <span className="ml-auto text-xs text-slate-400">{formatDateTime(m.createdAt)}</span>
              </div>
              {m.subject && <p className="mt-1 text-sm font-bold text-emerald-700">বিষয়: {m.subject}</p>}
              <p className="mt-1 text-sm text-slate-600">{m.message}</p>
            </div>
          ))}
          {msgs.length === 0 && (
            <p className="rounded-2xl border bg-white py-10 text-center text-sm text-slate-400">কোনো মেসেজ নেই</p>
          )}
        </div>
      )}
    </div>
  );
}
