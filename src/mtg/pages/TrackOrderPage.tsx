"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";
import { formatBDT } from "@/mtg/data/catalog";

const STEPS = ["Order Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 5,
  cancelled: -1,
};

interface Item {
  productName: string;
  quantity: number;
  price: number;
}

interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  actorName: string | null;
  createdAt: string;
}

interface OrderData {
  orderNumber: string;
  invoiceNumber: string | null;
  customerPhone: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentTransactionId: string | null;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  address: string;
  district: string | null;
  courierName: string | null;
  courierConsignmentId: string | null;
  courierTrackingCode: string | null;
  courierStatus: string | null;
  cancelReason: string | null;
  refundStatus: string;
  refundReason: string | null;
  refundAmount: number;
  createdAt: string;
}

export default function TrackOrderPage() {
  const sp = useSearchParams();
  const [code, setCode] = useState(sp.get("code") || "");
  const [phone, setPhone] = useState(sp.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [reason, setReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const doTrack = async (orderCode: string, mobile: string) => {
    if (!orderCode.trim()) return;
    setLoading(true);
    setError("");
    setActionMsg("");
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderCode.trim())}?phone=${encodeURIComponent(mobile.trim())}`
      );
      const d = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(d.error || "Order not found");
      } else {
        setOrder(d.order);
        if (!phone && d.order?.customerPhone) setPhone(d.order.customerPhone);
        setItems(d.items ?? []);
        setTimeline(d.timeline ?? []);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const c = sp.get("code");
    const p = sp.get("phone") || "";
    if (c) doTrack(c, p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCustomerAction = async (customerAction: "cancel" | "request_refund") => {
    if (!order) return;
    setActionBusy(true);
    setActionMsg("");
    setError("");
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerAction,
          phone: phone || order.customerPhone,
          reason: reason.trim() || (customerAction === "cancel" ? "Customer cancelled order" : "Customer requested refund"),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Action failed");
      } else {
        setActionMsg(
          customerAction === "cancel"
            ? "Order has been cancelled and product stock restored."
            : "Refund request submitted for Admin review."
        );
        setReason("");
        await doTrack(order.orderNumber, phone || order.customerPhone);
      }
    } catch {
      setError("Network error");
    } finally {
      setActionBusy(false);
    }
  };

  const step = order ? STATUS_STEP[order.orderStatus] ?? 0 : null;
  const cancelled = order?.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[820px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">Order Tracking</span>
        </nav>
        <h1 className="text-[30px] sm:text-[38px] font-black text-[#16243d]">Track Your Order</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Enter your order code (MTGxxxxxx) and mobile number to see live courier status, timeline, and invoice.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doTrack(code, phone);
          }}
          className="bg-white border border-gray-200 rounded-lg p-5 mt-6 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Order Code (e.g. MTG207814)"
            className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Mobile Number (01XXXXXXXXX)"
            className="border border-gray-200 rounded-md px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#F27F20]"
          />
          <button disabled={loading} className="btn-primary px-7 py-2.5 text-[14px] disabled:opacity-60">
            {loading ? "..." : "Track"}
          </button>
        </form>

        {error && (
          <p className="mt-4 bg-[#FD5B67]/10 text-[#FD5B67] text-[13.5px] font-semibold rounded-lg px-4 py-3 text-center">
            {error}
          </p>
        )}
        {actionMsg && (
          <p className="mt-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[13.5px] font-semibold rounded-lg px-4 py-3 text-center">
            ✅ {actionMsg}
          </p>
        )}

        {order && (
          <div className="mt-8 border border-gray-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b pb-4">
              <div>
                <p className="text-[16px] font-black text-[#16243d]">
                  Order: <span className="text-[#F27F20]">#{order.orderNumber}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleString("en-GB")} · Payment:{" "}
                  <b className="uppercase">{order.paymentMethod}</b> ({order.paymentStatus.toUpperCase()})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/invoice/${encodeURIComponent(order.orderNumber)}?phone=${encodeURIComponent(phone || order.customerPhone)}`}
                  className="border border-[#16243d] text-[#16243d] hover:bg-[#16243d] hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  🧾 View / Print Invoice
                </Link>
                <span
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${
                    cancelled ? "bg-[#FD5B67]/10 text-[#FD5B67]" : "bg-[#39B667]/10 text-[#39B667]"
                  }`}
                >
                  {cancelled ? "Cancelled" : STEPS[step ?? 0]}
                </span>
              </div>
            </div>

            {/* Courier Card */}
            {order.courierName && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded">
                    🚚 Courier Dispatched: {order.courierName.toUpperCase()}
                  </span>
                  <p className="text-sm font-bold text-[#16243d] mt-1.5">
                    Tracking Code: <span className="font-mono text-blue-700">{order.courierTrackingCode || "Assigned"}</span>
                    {order.courierConsignmentId ? ` · Consignment: #${order.courierConsignmentId}` : ""}
                  </p>
                  {order.courierStatus && <p className="text-xs text-gray-600 mt-0.5">Status: {order.courierStatus}</p>}
                </div>
              </div>
            )}

            {/* Refund Banner */}
            {order.refundStatus && order.refundStatus !== "none" && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-xs font-black uppercase text-purple-700">
                  Refund Status: {order.refundStatus.toUpperCase()}
                  {order.refundAmount > 0 ? ` (৳${order.refundAmount.toLocaleString()})` : ""}
                </p>
                {order.refundReason && <p className="text-xs text-purple-600 mt-1">Reason: {order.refundReason}</p>}
              </div>
            )}

            {/* Step Progress */}
            {!cancelled && step !== null && (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`rounded-lg p-2.5 border text-center ${
                      i <= step ? "border-[#F27F20] bg-orange-50/60 text-[#16243d]" : "border-gray-200 text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 mx-auto rounded-full text-[11px] font-bold flex items-center justify-center mb-1 ${
                        i <= step ? "bg-[#F27F20] text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="text-[11.5px] font-bold">{s}</p>
                  </div>
                ))}
              </div>
            )}

            {cancelled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 font-semibold">
                This order was cancelled. {order.cancelReason ? `Reason: ${order.cancelReason}` : ""}
              </div>
            )}

            {/* Granular Tracking History Timeline */}
            {timeline.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-black uppercase text-gray-400 mb-3">Live Tracking Timeline</h3>
                <ol className="space-y-3">
                  {timeline.map((ev) => (
                    <li key={ev.id} className="flex gap-3 items-start text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F27F20] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-[#16243d]">
                          {ev.title}{" "}
                          <span className="text-xs font-normal text-gray-400">
                            · {new Date(ev.createdAt).toLocaleString("en-GB")}
                          </span>
                        </p>
                        {ev.description && <p className="text-xs text-gray-600">{ev.description}</p>}
                        {ev.location && <p className="text-[11px] text-gray-400">📍 {ev.location}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Order Items */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-[13.5px]">
              {items.map((it, i) => (
                <p key={i} className="flex justify-between gap-2">
                  <span className="truncate">
                    {it.productName} × {it.quantity}
                  </span>
                  <b>{formatBDT(it.price * it.quantity)}</b>
                </p>
              ))}
              <p className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{formatBDT(order.deliveryCharge)}</span>
              </p>
              {order.discount > 0 && (
                <p className="flex justify-between text-[#39B667]">
                  <span>Discount</span>
                  <span>− {formatBDT(order.discount)}</span>
                </p>
              )}
              <p className="flex justify-between text-[16px] pt-1 border-t">
                <b>Total</b>
                <b className="text-[#F27F20]">{formatBDT(order.total)}</b>
              </p>
              <p className="text-[12.5px] text-gray-500 pt-1">
                📍 {order.address}
                {order.district ? `, ${order.district}` : ""}
              </p>
            </div>

            {/* Self-Service Cancel / Refund Request */}
            {!cancelled && order.refundStatus === "none" && (
              <div className="border-t pt-4">
                <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Cancel or Refund Request</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for cancellation or refund request..."
                    className="flex-1 border rounded-lg px-3 py-2 text-xs"
                  />
                  {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => handleCustomerAction("cancel")}
                      className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold shrink-0"
                    >
                      Cancel Order
                    </button>
                  )}
                  {(order.paymentStatus === "paid" || order.orderStatus === "delivered") && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => handleCustomerAction("request_refund")}
                      className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg text-xs font-bold shrink-0"
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
