"use client";
import { useMemo, useState } from "react";
import Link from "@/mtg/components/Link";
import { useRouter } from "next/navigation";
import { formatBDT, type P } from "@/mtg/data/catalog";
import { REAL_DETAILS } from "@/mtg/data/realDetails";
import { getOptionGroups } from "@/mtg/data/specs";
import { useShop } from "@/mtg/store/shop";

export default function BuyBox({ product, onPhoto }: { product: P; onPhoto?: (src: string) => void }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, toggleCompare, compare } = useShop();
  const router = useRouter();
  const compared = compare.includes(product.slug);

  const detail = REAL_DETAILS[product.slug];

  /* ---- build the option picker from the REAL variants (Colour / Storage …) ---- */
  const { optionNames, optionValues, variants } = useMemo(() => {
    const vs = detail?.variants?.length ? detail.variants : [];
    const names: string[] = [];
    const values: Record<string, { label: string; dot?: string }[]> = {};
    vs.forEach((v) => {
      Object.entries(v.options || {}).forEach(([name, val]) => {
        if (!values[name]) {
          values[name] = [];
          names.push(name);
        }
        if (!values[name].some((o) => o.label === val)) {
          /* Colour rows get the real colour swatch dot */
          const dot = name.toLowerCase() === "color" ? v.colorCode || undefined : undefined;
          values[name].push({ label: val, dot });
        }
      });
    });
    return { optionNames: names, optionValues: values, variants: vs };
  }, [detail]);

  const [picked, setPicked] = useState<Record<string, string>>(() => {
    /* pre-select the cheapest available combination */
    const init: Record<string, string> = {};
    if (variants.length) {
      const first = [...variants].sort((a, b) => a.price - b.price)[0];
      Object.entries(first.options || {}).forEach(([k, v]) => (init[k] = v));
    }
    return init;
  });

  const setOption = (name: string, value: string) => {
    setPicked((prev) => {
      const next = { ...prev, [name]: value };
      /* if that combination doesn't exist, keep the other axis at its cheapest valid value */
      const match = variants.find((v) => Object.entries(next).every(([k, val]) => v.options?.[k] === val));
      if (match) return next;
      const candidates = variants.filter((v) => v.options?.[name] === value);
      const best = candidates.sort((a, b) => a.price - b.price)[0];
      if (best) Object.entries(best.options || {}).forEach(([k, val]) => (next[k] = val));
      return next;
    });
  };

  /* ---- the active variant + its price ---- */
  const active = useMemo(
    () => variants.find((v) => Object.entries(picked).every(([k, val]) => v.options?.[k] === val)) ?? null,
    [variants, picked]
  );

  const price = active?.price ?? product.price;
  const oldPrice = active?.oldPrice ?? product.oldPrice;
  const off = oldPrice && oldPrice > price ? oldPrice - price : 0;
  const pre = product.status === "pre-order" || active?.status === "pre-order";
  const soldOut = active ? active.stock <= 0 && active.status === "out-of-stock" : false;
  const sku = active?.sku;

  /* colour photo swap when a colour has its own image */
  const photoFor = (name: string, value: string) => {
    const v = variants.find((x) => x.options?.[name] === value && x.img);
    if (v?.img && onPhoto) onPhoto(v.img);
  };

  /* generated option groups for products without live variant data */
  const fallbackGroups = getOptionGroups(product);

  return (
    <div>
      {/* brand + compare */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-[#1d1d1f] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.2 6.6l-3 6.8c-.2.4-.6.6-1 .6-.2 0-.4 0-.5-.1-.5-.3-.7-.9-.5-1.4l3-6.8c.3-.5.9-.8 1.4-.5.5.2.8.9.6 1.4z" /></svg>
          {detail?.brand || product.brand || "Apple"}
        </p>
        <button onClick={() => toggleCompare(product.slug)} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F27F20] hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" /></svg>
          {compared ? "Added to Compare ✓" : "Add to Compare"}
        </button>
      </div>

      <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#16243d] mt-2 leading-tight">{product.name}</h1>

      {/* price row — changes with the selected variant */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
        <p className="text-[22px] font-extrabold text-[#1d1d1f]">
          {formatBDT(price)}{" "}
          <span className="text-[13px] font-medium text-gray-500">({pre ? "Booking Amount" : detail?.cashType ?? "Cash Price"})</span>
        </p>
        {off > 0 && (
          <>
            <span className="text-[15px] text-gray-400 line-through">{formatBDT(oldPrice!)}</span>
            <span className="text-[11px] font-bold text-[#39B667] bg-[#39B667]/10 px-2 py-0.5 rounded">৳ {off.toLocaleString("en-US")} OFF</span>
          </>
        )}
        <span className="text-[13px] text-gray-600">
          <b className="text-[#1d1d1f]">Availability:</b>{" "}
          {soldOut ? (
            <span className="text-[#FD5B67] font-semibold">Out of Stock</span>
          ) : pre ? (
            <span className="text-[#F27F20] font-semibold">Pre-Order</span>
          ) : (
            <span className="text-[#39B667] font-semibold">In Stock</span>
          )}
        </span>
        {sku && (
          <span className="text-[13px] text-gray-600">
            <b className="text-[#1d1d1f]">Code:</b> {sku}
          </span>
        )}
      </div>

      {/* ---- real option pickers (Colour / Storage) with live price per option ---- */}
      {optionNames.length > 0 ? (
        optionNames.map((name) => (
          <div key={name} className="border border-gray-200 rounded-lg p-3 mt-3">
            <p className="text-[13px] font-semibold text-[#1d1d1f] mb-2">
              {name}
              {picked[name] && <span className="font-normal text-gray-500">: {picked[name]}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {optionValues[name].map((o) => {
                /* cheapest price for this option value */
                const cand = variants.filter((v) => v.options?.[name] === o.label);
                const min = cand.length ? Math.min(...cand.map((c) => c.price)) : null;
                const isActive = picked[name] === o.label;
                return (
                  <button
                    key={o.label}
                    onClick={() => {
                      setOption(name, o.label);
                      if (name.toLowerCase() === "color") photoFor(name, o.label);
                    }}
                    className={`flex items-center gap-1.5 text-[12.5px] px-3.5 py-1.5 rounded-full border transition ${
                      isActive ? "border-[#F27F20] text-[#F27F20] bg-orange-50/50" : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {o.dot && <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: o.dot }} />}
                    {o.label}
                    {min !== null && <span className="text-[11px] text-gray-400">· {formatBDT(min)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        /* generated groups */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {fallbackGroups.map((g) => (
            <FallbackGroup key={g.title} title={g.title} opts={g.opts} />
          ))}
        </div>
      )}

      {/* qty */}
      <p className="text-[13.5px] font-semibold text-[#1d1d1f] mt-4 mb-2">Select Quantity:</p>
      <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 text-gray-500 hover:bg-gray-100 text-lg" aria-label="Decrease quantity">−</button>
        <span className="w-12 text-center text-[14px] font-semibold border-x border-gray-200 h-9 leading-9">{qty}</span>
        <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 text-gray-500 hover:bg-gray-100 text-lg" aria-label="Increase quantity">+</button>
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button
          disabled={soldOut}
          onClick={() => {
            add(product.slug, qty);
            router.push("/checkout");
          }}
          className="bg-[#F27F20] hover:bg-[#d96d12] transition text-white text-[14px] font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {soldOut ? "Out of Stock" : pre ? "Pre Order Now" : "Shop Now"}
        </button>
        <button
          disabled={soldOut}
          onClick={() => {
            add(product.slug, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="border border-gray-200 hover:border-[#F27F20] hover:text-[#F27F20] transition text-[#1d1d1f] text-[14px] font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
          {added ? "Added ✓" : "Add To Cart"}
        </button>
      </div>

      {/* EMI + whatsapp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <p className="bg-[#fdf3e7] text-[12.5px] text-gray-700 px-3.5 py-2.5 rounded-md flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z" /></svg>
          EMI Available for orders above ৳ 5000{" "}
          <Link href="/emi" className="font-bold text-[#1d1d1f] underline hover:text-[#F27F20]">View Plans</Link>
        </p>
        <a href="https://wa.me/8809678148148" target="_blank" rel="noreferrer" className="bg-[#dff5e4] hover:bg-[#cdeed5] transition text-[12.5px] text-gray-800 px-3.5 py-2.5 rounded-md flex items-center gap-2 font-semibold">
          <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm5.4 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-2.9-1.3-4.8-4.2-4.9-4.4-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1s.8-.9 1-1.2c.2-.3.4-.2.7-.1s1.7.8 2 1c.3.1.5.2.6.4 0 .1 0 .6-.2 1.2z" /></svg>
          Whatsapp
        </a>
      </div>

      <p className="flex items-center gap-2 text-[13px] text-gray-700 mt-3.5">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
        Delivery Timescale: <b>3-5 Days</b>
      </p>
    </div>
  );
}

function FallbackGroup({ title, opts }: { title: string; opts: { label: string; dot?: string }[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-[13px] font-semibold text-[#1d1d1f] mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o, k) => (
          <button
            key={o.label}
            onClick={() => setI(k)}
            className={`flex items-center gap-1.5 text-[12.5px] px-3.5 py-1.5 rounded-full border transition ${
              i === k ? "border-[#F27F20] text-[#F27F20] bg-orange-50/50" : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {o.dot && <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: o.dot }} />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
