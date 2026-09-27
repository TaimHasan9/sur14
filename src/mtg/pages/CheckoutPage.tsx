"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "@/mtg/components/Img";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { useShop } from "@/mtg/store/shop";
import { allProducts, formatBDT } from "@/mtg/data/catalog";
import { track, getSessionId } from "@/mtg/utils/tracking";

const DISTRICTS = [
  "Dhaka (Inside)",
  "Dhaka (Outside)",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

export default function CheckoutPage() {
  const { cart, clearCart, user } = useShop();
  const [placed, setPlaced] = useState<string | null>(null);
  const [placedPhone, setPlacedPhone] = useState("");
  const [placedTotal, setPlacedTotal] = useState(0);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showGatewayModal, setShowGatewayModal] = useState(false);

  // Card / Gateway form state
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("424");
  const [cardHolder, setCardHolder] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [walletOtp, setWalletOtp] = useState("123456");
  const [gatewayBusy, setGatewayBusy] = useState(false);
  const [gatewayError, setGatewayError] = useState("");

  const [payment, setPayment] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: DISTRICTS[0],
    thana: "",
    address: "",
    notes: "",
  });
  const trackedStart = useRef(false);

  const lines = cart
    .map((l) => ({ line: l, product: allProducts.find((p) => p.slug === l.slug) }))
    .filter((x) => x.product);
  const subtotal = lines.reduce((s, x) => s + (x.product?.price ?? 0) * x.line.qty, 0);
  const isDhakaInside = form.district === "Dhaka (Inside)";
  const delivery = subtotal >= 2000 || subtotal === 0 ? 0 : isDhakaInside ? 60 : 120;
  const total = Math.max(0, subtotal + delivery - discount);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        phone: f.phone || user.phone || "",
        email: f.email || (user.email.includes("@phone.local") ? "" : user.email),
      }));
      setCardHolder((h) => h || user.name);
      setWalletNumber((w) => w || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!trackedStart.current && lines.length > 0) {
      trackedStart.current = true;
      track("checkout_start", { label: `${lines.length} items`, meta: { subtotal } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validate: true, code: coupon, subtotal }),
      });
      const d = await res.json();
      if (!res.ok) {
        setDiscount(0);
        setCouponMsg(d.error || "Invalid coupon code");
      } else {
        setDiscount(d.discount);
        setCouponMsg(`Coupon ${d.code} applied: ${formatBDT(d.discount)} off!`);
      }
    } catch {
      setCouponMsg("Could not validate coupon");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      setError("Please enter a valid mobile number (01XXXXXXXXX)");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone.trim(),
          customerEmail: form.email,
          address: form.address,
          district: form.district,
          thana: form.thana,
          paymentMethod: payment,
          couponCode: discount > 0 ? coupon : "",
          notes: form.notes,
          guestId: getSessionId(),
          expectedTotal: total,
          lines: lines.map((x) => ({ slug: x.line.slug, qty: x.line.qty })),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Order failed. Try again.");
      } else {
        track("purchase", { label: d.orderNumber, meta: { total: d.total } });
        setPlaced(d.orderNumber);
        setPlacedPhone(form.phone.trim());
        setPlacedTotal(d.total);
        setPaymentSessionId(d.paymentSessionId || null);
        setPaymentStatus("pending");
        setCardHolder(form.name);
        setWalletNumber(form.phone.trim());
        clearCart();
        try {
          await fetch(`/api/cart?guestId=${encodeURIComponent(getSessionId())}`, { method: "DELETE" });
        } catch {
          /* noop */
        }
        if (d.requiresOnlinePayment) {
          setShowGatewayModal(true);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const processGatewayPayment = async (simulateDecline = false) => {
    if (!placed) return;
    setGatewayBusy(true);
    setGatewayError("");
    try {
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: placed,
          sessionId: paymentSessionId,
          gateway: payment,
          cardNumber: simulateDecline ? "4000000000000002" : cardNumber,
          expiry,
          cvc,
          cardHolder,
          walletNumber: walletNumber || placedPhone,
          otp: walletOtp,
          simulateDecline,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setPaymentStatus("failed");
        setGatewayError(d.error || "Payment failed. Please check your card/wallet details and try again.");
      } else {
        setPaymentStatus("paid");
        setTransactionId(d.transactionId);
        setShowGatewayModal(false);
      }
    } catch {
      setGatewayError("Network error while verifying payment with gateway.");
    } finally {
      setGatewayBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1300px] mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <Link href="/cart" className="hover:text-[#F27F20]">Cart</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Checkout</span>
        </nav>
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#16243d]">Checkout</h1>

        {placed ? (
          <div className="text-center py-14 px-4 border border-dashed border-[#39B667] rounded-xl mt-6 bg-[#39B667]/5">
            <p className="text-5xl mb-3">{paymentStatus === "failed" ? "⚠️" : "✅"}</p>
            <h2 className="text-2xl font-extrabold text-[#16243d] mb-2">
              {paymentStatus === "paid"
                ? "Order & Payment Confirmed!"
                : paymentStatus === "failed"
                ? "Order Placed — Payment Declined (Retry Available)"
                : "Order Placed Successfully!"}
            </h2>
            <p className="text-[14px] text-gray-600 mb-1">
              Thank you for shopping with Mr Tom Gadgets. Confirmation email has been dispatched.
            </p>
            <p className="text-[13px] text-gray-500 mb-3">
              Order Code: <b className="text-[#F27F20]">{placed}</b> · Total: <b>{formatBDT(placedTotal)}</b>
            </p>

            <div className="flex justify-center gap-2 mb-6">
              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                  paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : paymentStatus === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Payment: {payment.toUpperCase()} — {paymentStatus.toUpperCase()}
                {transactionId ? ` (Txn: ${transactionId})` : ""}
              </span>
            </div>

            {payment !== "cod" && paymentStatus !== "paid" && (
              <div className="mb-6">
                <button
                  onClick={() => setShowGatewayModal(true)}
                  className="bg-[#16243d] text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#F27F20] transition"
                >
                  💳 {paymentStatus === "failed" ? "Retry Online Payment" : `Complete ${payment.toUpperCase()} Payment Now`}
                </button>
              </div>
            )}

            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                href={`/invoice/${encodeURIComponent(placed)}?phone=${encodeURIComponent(placedPhone)}`}
                className="btn-outline inline-block px-6 py-2.5 text-[13px]"
              >
                🧾 Download / Print Invoice
              </Link>
              <Link
                href={`/track-order?code=${encodeURIComponent(placed)}&phone=${encodeURIComponent(placedPhone)}`}
                className="btn-outline inline-block px-6 py-2.5 text-[13px]"
              >
                📦 Track Order
              </Link>
              <Link href="/" className="btn-primary inline-block px-8 py-3 text-[14px]">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : lines.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg mt-6">
            <p className="text-4xl mb-3">🛒</p>
            <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">Your cart is empty</h2>
            <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-[13px]">Start Shopping</Link>
          </div>
        ) : (
          <form className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-6 items-start" onSubmit={submit}>
            {/* shipping form */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
              <h3 className="text-[17px] font-bold text-[#16243d]">Shipping Information</h3>
              {error && (
                <p className="bg-[#FD5B67]/10 text-[#FD5B67] text-[13px] font-semibold rounded-md px-3.5 py-2.5">
                  {error}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full Name *"
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
                />
                <input
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  type="tel"
                  maxLength={11}
                  placeholder="Mobile Number (01XXXXXXXXX) *"
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
                />
                <input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  type="email"
                  placeholder="Email Address (for order confirmation & invoice)"
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20] sm:col-span-2"
                />
                <select
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] text-gray-600 focus:outline-none focus:border-[#F27F20]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <input
                  value={form.thana}
                  onChange={(e) => set("thana", e.target.value)}
                  placeholder="Area / Thana *"
                  required
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
                />
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Full Address *"
                  rows={3}
                  className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20] sm:col-span-2"
                />
              </div>

              <h3 className="text-[17px] font-bold text-[#16243d] pt-2">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["cod", "Cash on Delivery"],
                  ["card", "💳 Card (Stripe)"],
                  ["bkash", "bKash Online"],
                  ["nagad", "Nagad Online"],
                ].map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPayment(id)}
                    className={`border rounded-md py-2.5 text-[13px] font-semibold transition ${
                      payment === id
                        ? "border-[#F27F20] text-[#F27F20] bg-orange-50/60"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {payment !== "cod" && (
                <p className="text-[12.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2.5">
                  🔒 Secure Gateway Verification: After clicking Place Order, our encrypted{" "}
                  <b>{payment === "card" ? "Stripe Card Gateway" : payment.toUpperCase()}</b> window will open with HMAC webhook verification.
                </p>
              )}

              <h3 className="text-[17px] font-bold text-[#16243d] pt-2">
                Coupon Code <span className="text-[12px] font-medium text-gray-400">(try AG500 / AG10 / WELCOME10)</span>
              </h3>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon Code"
                  className="flex-1 min-w-0 border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] uppercase focus:outline-none focus:border-[#F27F20]"
                />
                <button type="button" onClick={applyCoupon} className="btn-outline px-5 py-2.5 text-[13px] shrink-0">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[12.5px] font-semibold ${discount > 0 ? "text-[#39B667]" : "text-[#FD5B67]"}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* summary */}
            <aside className="bg-white border border-gray-200 rounded-lg p-5 lg:sticky lg:top-24">
              <h3 className="text-[17px] font-bold text-[#16243d] mb-4">Order Summary</h3>
              <ul className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {lines.map(({ line, product }) => (
                  <li key={line.slug} className="flex gap-3 items-center">
                    <span className="w-12 h-12 rounded-md overflow-hidden border border-gray-100 shrink-0">
                      <Img src={product!.img} alt="" className="w-full h-full object-cover" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-semibold truncate">{product!.name}</span>
                      <span className="text-[11.5px] text-gray-500">Qty {line.qty}</span>
                    </span>
                    <span className="text-[13px] font-bold">{formatBDT(product!.price * line.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 mt-4 pt-3 space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatBDT(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-semibold text-[#39B667]">− {formatBDT(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-semibold text-[#39B667]">{delivery === 0 ? "Free" : formatBDT(delivery)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-bold text-[#16243d]">Total</span>
                  <span className="text-[22px] font-black text-[#F27F20]">{formatBDT(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-[15px] mt-4 disabled:opacity-60">
                {busy ? "Validating Stock & Placing Order..." : `Place Order — ${formatBDT(total)}`}
              </button>
              <p className="text-[11.5px] text-gray-400 mt-3 text-center">
                Protected by atomic stock reservation & server-side price verification
              </p>
            </aside>
          </form>
        )}
      </div>

      {/* Secure Payment Gateway Modal (Stripe Card / Digital Wallet) */}
      {showGatewayModal && placed && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  🔒 Server-Verified Gateway
                </span>
                <h3 className="text-lg font-black text-[#16243d] mt-1">
                  {payment === "card" ? "Stripe Card Checkout" : `${payment.toUpperCase()} Secure Gateway`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-3 bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Order <b>#{placed}</b>
              </span>
              <span className="font-black text-lg text-[#F27F20]">{formatBDT(placedTotal)}</span>
            </div>

            {gatewayError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg p-3">
                ⚠️ {gatewayError}
              </div>
            )}

            {payment === "card" ? (
              <div className="space-y-3">
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber("4242424242424242");
                      setGatewayError("");
                    }}
                    className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-1.5 rounded-lg"
                  >
                    ✓ Fill Test Visa (4242)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber("4000000000000002");
                      setGatewayError("");
                    }}
                    className="flex-1 bg-red-50 border border-red-200 text-red-700 font-bold py-1.5 rounded-lg"
                  >
                    ✕ Fill Decline Card (0002)
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Cardholder Name</label>
                  <input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Name on Card"
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Card Number (Visa / Mastercard / Amex)</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600">Expiry (MM/YY)</label>
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">CVC</label>
                    <input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="424"
                      maxLength={4}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono mt-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600">{payment.toUpperCase()} Account Number</label>
                  <input
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">OTP / PIN Verification Code</label>
                  <input
                    value={walletOtp}
                    onChange={(e) => setWalletOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono mt-1"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={gatewayBusy}
                onClick={() => processGatewayPayment(false)}
                className="w-full bg-[#16243d] hover:bg-[#F27F20] text-white font-black py-3 rounded-xl text-sm transition disabled:opacity-60"
              >
                {gatewayBusy ? "Verifying Signature & Processing..." : `Authorize & Pay ${formatBDT(placedTotal)}`}
              </button>
              <button
                type="button"
                disabled={gatewayBusy}
                onClick={() => processGatewayPayment(true)}
                className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-xl text-xs transition"
              >
                Simulate Gateway Failure (Test Webhook Failure Handling)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ChatWidget />
    </div>
  );
}
