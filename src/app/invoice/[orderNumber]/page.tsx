"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatBDT, formatDateTime } from "@/lib/utils";

interface OrderDetail {
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
  paymentGateway: string | null;
  paymentTransactionId: string | null;
  orderStatus: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode: string | null;
  courierName: string | null;
  courierConsignmentId: string | null;
  courierTrackingCode: string | null;
  refundStatus: string;
  refundAmount: number;
  createdAt: string;
}

interface OrderItemRow {
  id: string;
  productName: string;
  productBn: string | null;
  price: number;
  quantity: number;
}

function InvoiceContent() {
  const params = useParams<{ orderNumber: string }>();
  const sp = useSearchParams();
  const orderNumber = params?.orderNumber || "";
  const [phone, setPhone] = useState(sp.get("phone") || "");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoice = async (mobile = phone) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}?phone=${encodeURIComponent(mobile)}`);
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Could not load invoice");
      } else {
        setOrder(d.order);
        setItems(d.items ?? []);
      }
    } catch {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) fetchInvoice(sp.get("phone") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  if (loading) {
    return <div className="py-24 text-center text-gray-500 font-bold">Loading Invoice...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border rounded-2xl shadow-sm text-center">
        <h2 className="text-lg font-black text-[#16243d]">Verify Phone for Invoice #{orderNumber}</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">{error || "Enter customer mobile number to view invoice"}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchInvoice(phone);
          }}
          className="space-y-3"
        >
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Customer Mobile (01XXXXXXXXX)"
            className="w-full border rounded-xl px-3.5 py-2.5 text-sm"
          />
          <button className="w-full bg-[#F27F20] text-white font-bold py-2.5 rounded-xl text-sm">
            View Invoice
          </button>
        </form>
      </div>
    );
  }

  const invNo = order.invoiceNumber || `INV-${new Date(order.createdAt).getFullYear()}-${order.orderNumber}`;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/track-order?code=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#F27F20]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order Tracking
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#16243d] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F27F20] transition shadow"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-[#16243d]">MR TOM GADGETS</h1>
            <p className="text-xs text-slate-500 mt-1">
              Bashundhara City Shopping Complex, Level 5, Block A, Dhaka
            </p>
            <p className="text-xs text-slate-500">Hotline: 09678148148 · contact@mrtomgadgets.com</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-[#F27F20]/10 text-[#F27F20] px-3 py-1 rounded-full text-xs font-black uppercase">
              Official Tax Invoice
            </span>
            <p className="text-lg font-black text-[#16243d] mt-2">{invNo}</p>
            <p className="text-xs text-slate-500">Order: #{order.orderNumber}</p>
            <p className="text-xs text-slate-500">Date: {formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-sm">
          <div>
            <p className="text-xs font-black uppercase text-slate-400 mb-1">Billed & Shipped To</p>
            <p className="font-bold text-[#16243d] text-base">{order.customerName}</p>
            <p className="text-slate-600">Phone: {order.customerPhone}</p>
            {order.customerEmail && <p className="text-slate-600">Email: {order.customerEmail}</p>}
            <p className="text-slate-600 mt-1">
              {order.address}
              {order.thana ? `, ${order.thana}` : ""}
              {order.district ? `, ${order.district}` : ""}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-black uppercase text-slate-400 mb-1">Payment & Fulfillment</p>
            <p className="font-bold text-[#16243d]">
              Method: <span className="uppercase">{order.paymentMethod}</span>
            </p>
            <p className="mt-0.5">
              Payment Status:{" "}
              <span
                className={`inline-flex items-center gap-1 font-black uppercase text-xs px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : order.paymentStatus === "refunded"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.paymentStatus === "paid" && <CheckCircle2 className="w-3 h-3" />}
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentTransactionId && (
              <p className="text-xs text-slate-500 mt-1">Gateway Txn ID: {order.paymentTransactionId}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Order Status: {order.orderStatus.toUpperCase()}</p>
            {order.courierName && (
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                Courier: {order.courierName.toUpperCase()}{" "}
                {order.courierTrackingCode ? `(${order.courierTrackingCode})` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="pb-3">#</th>
                <th className="pb-3">Product Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3.5 text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="py-3.5 font-bold text-[#16243d]">
                    {it.productName}
                    {it.productBn && <span className="block text-xs font-normal text-slate-500">{it.productBn}</span>}
                  </td>
                  <td className="py-3.5 text-center font-semibold">{it.quantity}</td>
                  <td className="py-3.5 text-right">{formatBDT(it.price)}</td>
                  <td className="py-3.5 text-right font-bold">{formatBDT(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-1.5 text-sm">
          <div className="w-full sm:w-72 flex justify-between">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-semibold">{formatBDT(order.subtotal)}</span>
          </div>
          <div className="w-full sm:w-72 flex justify-between">
            <span className="text-slate-500">Delivery Charge:</span>
            <span className="font-semibold">{formatBDT(order.deliveryCharge)}</span>
          </div>
          {order.discount > 0 && (
            <div className="w-full sm:w-72 flex justify-between text-emerald-600">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
              <span className="font-bold">− {formatBDT(order.discount)}</span>
            </div>
          )}
          <div className="w-full sm:w-72 flex justify-between border-t border-slate-200 pt-2 text-base">
            <span className="font-black text-[#16243d]">Grand Total:</span>
            <span className="font-black text-xl text-[#F27F20]">{formatBDT(order.total)}</span>
          </div>
          {order.refundStatus === "refunded" && (
            <div className="w-full sm:w-72 flex justify-between text-purple-700 font-bold pt-1">
              <span>Refunded Amount:</span>
              <span>{formatBDT(order.refundAmount)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Genuine Official Warranty Guaranteed — Mr Tom Gadgets
          </span>
          <span>Computer generated invoice · No signature required</span>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading Invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
