"use client";

import { useEffect, useState } from "react";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { useShop } from "@/mtg/store/shop";
import { formatBDT } from "@/mtg/data/catalog";
import { track } from "@/mtg/utils/tracking";

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  refundStatus?: string;
  customerPhone: string;
  total: number;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STAFF_ROLES = new Set(["super_admin", "admin", "manager", "staff"]);

export default function AccountPage() {
  const { user, authLoading, login, register, logout, refreshMe } = useShop();
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [oLoading, setOLoading] = useState(false);

  // Email verification state
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setOLoading(true);
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => {})
        .finally(() => setOLoading(false));
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfoMsg("");

    try {
      if (mode === "login") {
        const r = await login(identifier, password);
        if (!r.ok) setError(r.error || "Login failed");
      } else if (mode === "register") {
        const email = identifier.includes("@") ? identifier : "";
        const ph = identifier.includes("@") ? phone : identifier;
        const r = await register({ name, email, phone: ph, password });
        if (!r.ok) setError(r.error || "Registration failed");
      } else if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        });
        const d = await res.json();
        if (!res.ok) {
          setError(d.error || "Could not send reset code");
        } else {
          if (d.resetCodePreview) setResetCode(d.resetCodePreview);
          setInfoMsg(
            d.resetCodePreview
              ? `Reset code sent! (Sandbox preview code: ${d.resetCodePreview})`
              : d.message || "Reset code sent to your email."
          );
          setPassword("");
          setMode("reset");
        }
      } else if (mode === "reset") {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, token: resetCode, newPassword: password }),
        });
        const d = await res.json();
        if (!res.ok) {
          setError(d.error || "Password reset failed");
        } else {
          setInfoMsg("Password reset successful! Please login with your new password.");
          setMode("login");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyEmail = async (resend = false) => {
    setVerifyBusy(true);
    setVerifyMsg("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resend ? { resend: true } : { code: verifyOtp }),
      });
      const d = await res.json();
      if (!res.ok) {
        setVerifyMsg(`❌ ${d.error || "Verification failed"}`);
      } else if (resend) {
        if (d.verificationCodePreview) setVerifyOtp(d.verificationCodePreview);
        setVerifyMsg(
          d.verificationCodePreview
            ? `✅ Code sent! (Sandbox OTP: ${d.verificationCodePreview})`
            : "✅ Verification code sent to your email."
        );
      } else {
        setVerifyMsg("✅ Email verified successfully!");
        await refreshMe();
      }
    } catch {
      setVerifyMsg("❌ Network error");
    } finally {
      setVerifyBusy(false);
    }
  };

  const pwChecks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", ok: /[a-z]/.test(password) },
    { label: "Number (0-9)", ok: /[0-9]/.test(password) },
    { label: "Special character (!@#$%^&*)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  /* ---------------- logged-in dashboard ---------------- */
  if (!authLoading && user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-[#16243d] to-[#F27F20] rounded-lg p-6 text-white">
            <span className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] font-black">{user.name}</h1>
                <span className="text-[11px] font-black uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                  {user.role.replace("_", " ")}
                </span>
                {user.emailVerified ? (
                  <span className="text-[11px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-black bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full">
                    Unverified Email
                  </span>
                )}
              </div>
              <p className="text-[13px] text-white/80">
                {user.email} {user.phone ? `· ${user.phone}` : ""}
              </p>
            </div>
            {STAFF_ROLES.has(user.role) && (
              <Link
                href="/admin"
                className="bg-white text-[#16243d] px-5 py-2.5 rounded-md text-[13px] font-bold hover:bg-gray-100"
              >
                🛡️ Admin Panel ({user.role.toUpperCase()})
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                track("logout", {});
              }}
              className="bg-white/15 px-5 py-2.5 rounded-md text-[13px] font-bold hover:bg-white/25"
            >
              Logout
            </button>
          </div>

          {/* Email Verification Banner */}
          {!user.emailVerified && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-amber-900">📧 Verify Your Email Address</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enter the 6-digit verification code sent to <b>{user.email}</b> or request a new code.
                </p>
                {verifyMsg && <p className="text-xs font-bold text-amber-900 mt-1">{verifyMsg}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-xs font-mono w-28"
                />
                <button
                  type="button"
                  disabled={verifyBusy || !verifyOtp}
                  onClick={() => handleVerifyEmail(false)}
                  className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-60"
                >
                  Verify
                </button>
                <button
                  type="button"
                  disabled={verifyBusy}
                  onClick={() => handleVerifyEmail(true)}
                  className="border border-amber-400 bg-white text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100"
                >
                  Send / Resend Code
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              ["🛍️", "Shop", "/"],
              ["🛒", "Cart", "/cart"],
              ["❤️", "Wishlist", "/wishlist"],
              ["📦", "Track Order", "/track-order"],
            ].map(([icon, label, href]) => (
              <Link
                key={href}
                href={href}
                className="border border-gray-200 rounded-lg p-4 text-center hover:border-[#F27F20] transition"
              >
                <p className="text-2xl">{icon}</p>
                <p className="text-[13px] font-bold mt-1">{label}</p>
              </Link>
            ))}
          </div>

          <h2 className="text-[20px] font-black text-[#16243d] mt-8 mb-3">My Orders</h2>
          {oLoading ? (
            <p className="text-[14px] text-gray-400 py-8 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-[15px] font-bold">No orders yet</p>
              <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-[13px] mt-4">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center gap-3 border border-gray-200 rounded-lg p-4 hover:border-[#F27F20]/50 transition"
                >
                  <span className="flex-1 min-w-[180px]">
                    <span className="block text-[15px] font-bold text-[#16243d]">#{o.orderNumber}</span>
                    <span className="block text-[12px] text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {o.paymentMethod.toUpperCase()} ({o.paymentStatus?.toUpperCase()})
                    </span>
                  </span>
                  <span
                    className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                      o.orderStatus === "delivered"
                        ? "bg-[#39B667]/10 text-[#39B667]"
                        : o.orderStatus === "cancelled"
                        ? "bg-[#FD5B67]/10 text-[#FD5B67]"
                        : "bg-[#F27F20]/10 text-[#F27F20]"
                    }`}
                  >
                    {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
                  </span>
                  <span className="text-[16px] font-black text-[#F27F20]">{formatBDT(o.total)}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoice/${encodeURIComponent(o.orderNumber)}?phone=${encodeURIComponent(o.customerPhone)}`}
                      className="border border-gray-200 hover:border-[#16243d] px-3 py-1.5 rounded-md text-xs font-bold text-[#16243d]"
                    >
                      🧾 Invoice
                    </Link>
                    <Link
                      href={`/track-order?code=${encodeURIComponent(o.orderNumber)}&phone=${encodeURIComponent(o.customerPhone)}`}
                      className="bg-[#16243d] text-white hover:bg-[#F27F20] px-3 py-1.5 rounded-md text-xs font-bold transition"
                    >
                      Track / Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
        <ChatWidget />
      </div>
    );
  }

  /* ---------------- login / register / forgot / reset ---------------- */
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[460px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-black text-[#16243d] text-center">
          {mode === "login"
            ? "Login to Your Account"
            : mode === "register"
            ? "Create New Account"
            : mode === "forgot"
            ? "Forgot Password"
            : "Reset Your Password"}
        </h1>
        <p className="text-[13px] text-gray-500 text-center mt-1">
          Welcome to Mr Tom Gadgets — Bangladesh&apos;s trusted tech store
        </p>

        <form className="bg-white border border-gray-200 rounded-lg p-6 mt-6 space-y-4" onSubmit={submit}>
          {error && (
            <p className="bg-[#FD5B67]/10 text-[#FD5B67] text-[13px] font-semibold rounded-md px-3.5 py-2.5">
              {error}
            </p>
          )}
          {infoMsg && (
            <p className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold rounded-md px-3.5 py-2.5">
              {infoMsg}
            </p>
          )}

          {mode === "register" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name *"
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
            />
          )}

          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={mode === "login" ? "Mobile Number / Email *" : "Email Address or Mobile Number *"}
            className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
          />

          {mode === "register" && identifier.includes("@") && (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Mobile Number (01XXXXXXXXX, optional)"
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
            />
          )}

          {mode === "reset" && (
            <input
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="6-Digit Reset Code *"
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] font-mono focus:outline-none focus:border-[#F27F20]"
            />
          )}

          {mode !== "forgot" && (
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "reset" ? "New Strong Password *" : "Password *"}
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
            />
          )}

          {(mode === "register" || mode === "reset") && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1 text-xs">
              <p className="font-bold text-slate-700 mb-1">Strong Password Requirements:</p>
              {pwChecks.map((c) => (
                <p key={c.label} className={c.ok ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {c.ok ? "✓" : "○"} {c.label}
                </p>
              ))}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-[14px] disabled:opacity-60">
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : mode === "register"
              ? "Create Account"
              : mode === "forgot"
              ? "Send Password Reset Code"
              : "Reset Password"}
          </button>

          <div className="flex items-center justify-between text-[13px] pt-1">
            {mode === "login" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setInfoMsg("");
                  }}
                  className="text-gray-600 hover:text-[#F27F20] font-semibold"
                >
                  Create an account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setInfoMsg("");
                  }}
                  className="text-[#F27F20] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfoMsg("");
                }}
                className="w-full text-center text-gray-600 hover:text-[#F27F20] font-semibold"
              >
                ← Back to Login
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
