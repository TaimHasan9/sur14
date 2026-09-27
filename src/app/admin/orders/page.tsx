"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Truck, Printer, RotateCcw } from "lucide-react";
import { formatBDT, formatDateTime, orderStatusBn, paymentMethodBn } from "@/lib/utils";
import { useShop } from "@/store/ShopContext";

type Order = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  district: string | null;
  thana: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentTransactionId: string | null;
  orderStatus: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  courierName: string | null;
  courierConsignmentId: string | null;
  courierTrackingCode: string | null;
  courierStatus: string | null;
  refundStatus: string;
  refundReason: string | null;
  refundAmount: number;
  createdAt: string;
};
type Item = { productBn: string | null; productName: string; quantity: number; price: number; emoji: string | null };

const STATUSES = ["", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const STATUS_LABEL: Record<string, string> = {
  "": "সব",
  pending: "পেন্ডিং",
  confirmed: "কনফার্ম",
  packed: "প্যাকড",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
};

function OrdersInner() {
  const sp = useSearchParams();
  const { toast } = useShop();
  const [status, setStatus] = useState(sp.get("status") || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item[]>>({});

  const load = () => {
    setLoading(true);
    fetch(`/api/orders?all=1&status=${status}&page=${page}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders ?? []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const toggle = async (o: Order) => {
    if (expanded === o.orderNumber) return setExpanded(null);
    setExpanded(o.orderNumber);
    if (!items[o.orderNumber]) {
      const res = await fetch(`/api/orders/${o.orderNumber}?phone=${encodeURIComponent(o.customerPhone)}`);
      const d = await res.json();
      if (d.items) setItems((m) => ({ ...m, [o.orderNumber]: d.items }));
    }
  };

  const updateOrder = async (orderNumber: string, payload: Record<string, unknown>, successMsg = "অর্ডার আপডেট হয়েছে ✅") => {
    const res = await fetch(`/api/orders/${orderNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast(successMsg);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast(d.error || "আপডেট ব্যর্থ", "error");
    }
  };

  const pages = Math.max(1, Math.ceil(total / 12));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              status === s ? "bg-emerald-600 text-white" : "border bg-white"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
        <span className="ml-auto text-sm font-bold text-slate-400">মোট: {total}</span>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-400">লোড হচ্ছে...</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.length === 0 && (
            <p className="rounded-2xl border bg-white py-12 text-center text-slate-400">কোনো অর্ডার নেই</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-2xl border bg-white">
              <button onClick={() => toggle(o)} className="flex w-full flex-wrap items-center gap-2 p-4 text-left">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-black">
                    {o.orderNumber}
                    {o.courierName && (
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-700">
                        🚚 {o.courierName} ({o.courierTrackingCode})
                      </span>
                    )}
                    {o.refundStatus && o.refundStatus !== "none" && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase text-purple-700">
                        Refund: {o.refundStatus}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {o.customerName} • {o.customerPhone} • {formatDateTime(o.createdAt)}
                  </span>
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black">
                  {STATUS_LABEL[o.orderStatus] || orderStatusBn(o.orderStatus)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black ${
                    o.paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : o.paymentStatus === "refunded"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {paymentMethodBn(o.paymentMethod)} • {o.paymentStatus}
                </span>
                <span className="font-black text-emerald-700">{formatBDT(o.total)}</span>
                <ChevronDown className={`h-4 w-4 transition ${expanded === o.orderNumber ? "rotate-180" : ""}`} />
              </button>

              {expanded === o.orderNumber && (
                <div className="border-t bg-slate-50 p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400">পণ্য</p>
                      {(items[o.orderNumber] || []).map((it, i) => (
                        <p key={i} className="py-0.5 text-sm">
                          <span className="font-bold">{it.productBn || it.productName}</span> × {it.quantity} —{" "}
                          {formatBDT(it.price * it.quantity)}
                        </p>
                      ))}
                      <p className="mt-1 text-sm">
                        সাবটোটাল: {formatBDT(o.subtotal)} + ডেলিভারি {formatBDT(o.deliveryCharge)}
                        {o.discount > 0 && (
                          <>
                            {" "}
                            − ছাড় {formatBDT(o.discount)} ({o.couponCode})
                          </>
                        )}{" "}
                        = <span className="font-black">{formatBDT(o.total)}</span>
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/invoice/${encodeURIComponent(o.orderNumber)}?phone=${encodeURIComponent(o.customerPhone)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                        >
                          <Printer className="h-3.5 w-3.5" /> ইনভয়েস প্রিন্ট / ডাউনলোড
                        </Link>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs font-black uppercase text-slate-400">ক্রেতা ও ডেলিভারি</p>
                      <p className="mt-1 font-bold">
                        {o.customerName} ({o.customerPhone}) {o.customerEmail ? `• ${o.customerEmail}` : ""}
                      </p>
                      <p className="text-slate-600">
                        {o.address}, {o.thana ? o.thana + ", " : ""}
                        {o.district || ""}
                      </p>
                      {o.paymentTransactionId && (
                        <p className="mt-1 text-xs font-mono text-emerald-700">Gateway Txn: {o.paymentTransactionId}</p>
                      )}
                      {o.courierName && (
                        <p className="mt-1 text-xs font-bold text-indigo-700">
                          কুরিয়ার: {o.courierName.toUpperCase()} • Consignment: {o.courierConsignmentId} • Tracking:{" "}
                          {o.courierTrackingCode}
                        </p>
                      )}
                      {o.notes && <p className="mt-1 text-xs italic text-slate-500">নোট: {o.notes}</p>}
                    </div>
                  </div>

                  {/* Order Status & Payment Controls */}
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="text-xs font-black uppercase text-slate-400">স্ট্যাটাস:</span>
                    {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateOrder(o.orderNumber, { orderStatus: s })}
                        disabled={o.orderStatus === s}
                        className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                          o.orderStatus === s
                            ? "bg-emerald-600 text-white"
                            : "border bg-white hover:border-emerald-400"
                        }`}
                      >
                        {STATUS_LABEL[s] || orderStatusBn(s)}
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black uppercase text-slate-400">পেমেন্ট:</span>
                    {["pending", "paid", "failed", "refunded"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateOrder(o.orderNumber, { paymentStatus: s })}
                        disabled={o.paymentStatus === s}
                        className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                          o.paymentStatus === s ? "bg-blue-600 text-white" : "border bg-white hover:border-blue-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Courier Booking (Steadfast / Pathao / RedX) */}
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="flex items-center gap-1 text-xs font-black uppercase text-indigo-700">
                      <Truck className="h-3.5 w-3.5" /> কুরিয়ার বুকিং (Courier Dispatch):
                    </span>
                    {[
                      ["steadfast", "Steadfast Courier"],
                      ["pathao", "Pathao Parcel"],
                      ["redx", "RedX Logistics"],
                      ["own", "Mr Tom Express"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() =>
                          updateOrder(
                            o.orderNumber,
                            { bookCourier: true, courierName: id },
                            `${label}-এ পার্সেল বুকিং ও ট্র্যাকিং কোড তৈরি হয়েছে ✅`
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-black ${
                          o.courierName === id
                            ? "bg-indigo-600 text-white"
                            : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
                        }`}
                      >
                        🚚 {label}
                      </button>
                    ))}
                  </div>

                  {/* Refund Management */}
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="flex items-center gap-1 text-xs font-black uppercase text-purple-700">
                      <RotateCcw className="h-3.5 w-3.5" /> রিফান্ড / ক্যানসেল সিস্টেম:
                    </span>
                    {o.refundReason && (
                      <span className="text-xs text-purple-700 font-semibold">কারণ: &ldquo;{o.refundReason}&rdquo;</span>
                    )}
                    <button
                      onClick={() =>
                        updateOrder(
                          o.orderNumber,
                          { refundStatus: "refunded", refundAmount: o.total },
                          "রিফান্ড সম্পন্ন হয়েছে এবং স্টক পুনরুদ্ধার করা হয়েছে ✅"
                        )
                      }
                      disabled={o.refundStatus === "refunded"}
                      className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-black text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      ✓ Approve & Process Refund ({formatBDT(o.total)})
                    </button>
                    {o.refundStatus === "requested" && (
                      <button
                        onClick={() => updateOrder(o.orderNumber, { refundStatus: "rejected" }, "রিফান্ড আবেদন বাতিল করা হয়েছে")}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-50"
                      >
                        ✕ Reject Refund
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-black ${
                    n === page ? "bg-emerald-600 text-white" : "border bg-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center">লোড হচ্ছে...</p>}>
      <OrdersInner />
    </Suspense>
  );
}
