"use client";
import { useMemo, useState } from "react";
import Link from "@/mtg/components/Link";
import Img from "../Img";
import { getSpecs, getProductCopy } from "@/mtg/data/specs";
import { allProducts, type P } from "@/mtg/data/catalog";
import { REAL_DETAILS, type ProductDetail } from "@/mtg/data/realDetails";

/* ---------- Specification table (live site layout) ---------- */
function SpecTable({ groups, fallback }: { groups: { name: string; rows: { label: string; value: string }[] }[]; fallback: { k: string; v: string }[] }) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <table className="w-full text-[13px]">
        <tbody>
          {groups.map((g) => (
            <SpecRows key={g.name} name={g.name} rows={g.rows} />
          ))}
          {groups.length === 0 &&
            fallback.map((r, i) => (
              <tr key={r.k} className={i % 2 ? "bg-[#fafafa]" : "bg-white"}>
                <td className="px-4 py-3 w-[150px] sm:w-[190px] text-gray-600 border-b border-gray-100 align-top">{r.k}</td>
                <td className="px-4 py-3 text-[#1d1d1f] border-b border-gray-100 border-l border-l-gray-100">{r.v}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function SpecRows({ name, rows }: { name: string; rows: { label: string; value: string }[] }) {
  /* a group with a single unlabelled row renders as "Name | value" */
  if (rows.length === 1 && !rows[0].label)
    return (
      <tr className="bg-white">
        <td className="px-4 py-3 w-[150px] sm:w-[190px] text-gray-600 border-b border-gray-100 align-top">{name}</td>
        <td className="px-4 py-3 text-[#1d1d1f] border-b border-gray-100 border-l border-l-gray-100">{rows[0].value}</td>
      </tr>
    );
  return (
    <>
      {/* group heading row */}
      <tr className="bg-[#f3f4f6]">
        <td colSpan={2} className="px-4 py-2.5 font-bold text-[#1d1d1f] border-b border-gray-200">
          {name}
        </td>
      </tr>
      {rows.map((r, i) => (
        <tr key={i} className={i % 2 ? "bg-[#fafafa]" : "bg-white"}>
          <td className="px-4 py-3 w-[150px] sm:w-[190px] text-gray-600 border-b border-gray-100 align-top">{r.label || name}</td>
          <td className="px-4 py-3 text-[#1d1d1f] border-b border-gray-100 border-l border-l-gray-100">{r.value}</td>
        </tr>
      ))}
    </>
  );
}

/* ---------- Description (live site copy) ---------- */
function DescriptionBlock({ product, detail }: { product: P; detail?: ProductDetail }) {
  const copy = getProductCopy(product);
  const similar = allProducts.filter((x) => x.id !== product.id && x.brand === product.brand).slice(0, 3);
  const fallbackSimilar = allProducts.filter((x) => x.id !== product.id).slice(0, 3);
  const sim = similar.length ? similar : fallbackSimilar;

  if (detail) {
    /* real description — rendered from the live rich-text, headings kept */
    const lines = detail.description.split("\n");
    return (
      <div>
        <h3 className="text-[20px] font-extrabold text-[#16243d]">Descriptions</h3>

        {/* hero description image from the live page */}
        {detail.media[1] && (
          <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 bg-[#f4f4f6] max-w-[560px]">
            <Img src={detail.media[1]} alt={product.name} className="w-full h-auto object-contain" />
          </div>
        )}

        <div className="mt-5 space-y-1">
          {lines.map((l, i) => {
            const t = l.trim();
            if (!t) return <div key={i} className="h-2" />;
            if (/^•/.test(t))
              return (
                <p key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-gray-600 pl-1">
                  <span className="text-gray-300 mt-0.5">•</span>
                  {t.replace(/^•\s*/, "")}
                </p>
              );
            if (t === product.name || (t.length < 70 && t === t.toUpperCase() && /[A-Z]/.test(t)))
              return <h2 key={i} className="text-[22px] font-extrabold text-[#16243d] pt-3">{t}</h2>;
            if (t.length < 80 && !/[.?!]$/.test(t) && /^[A-Z0-9]/.test(t))
              return <h3 key={i} className="text-[17px] font-bold text-[#16243d] pt-3">{t}</h3>;
            return (
              <p key={i} className="text-[13.5px] leading-relaxed text-gray-600 mt-1">
                {t.split(new RegExp(`(${product.brand ?? "Mr Tom Gadgets"})`, "i")).map((part, k) =>
                  part.toLowerCase() === (product.brand ?? "Mr Tom Gadgets").toLowerCase() ? (
                    <span key={k} className="text-[#F27F20] underline decoration-dotted">{part}</span>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
        </div>

        <h3 className="text-[20px] font-extrabold text-[#16243d] mt-8 mb-3">Why Choose Mr Tom Gadgets?</h3>
        <p className="text-[13.5px] leading-relaxed text-gray-600">
          Looking for the best place to purchase the latest Apple products or other top-quality gadgets in Bangladesh? Look no further than Mr Tom Gadgets, the unparalleled leader in providing top-notch gadgets in the country. Enjoy the convenience of two shopping options with us — either through our seamless online platform (<span className="text-[#F27F20] underline decoration-dotted">Mr Tom Gadgets</span>) or by visiting our physical outlets in different locations. Rest assured, we have you covered for all your gadget needs.
        </p>

        <h3 className="text-[20px] font-extrabold text-[#16243d] mt-8 mb-3">Check Similar Product Price</h3>
        <ul className="space-y-2">
          {sim.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-[13px]">
              <span className="text-gray-300">•</span>
              <Link href={`/product/${s.slug}`} className="text-[#F27F20] underline hover:no-underline">{s.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* fallback for products we couldn't fetch */
  return (
    <div>
      <h3 className="text-[20px] font-extrabold text-[#16243d]">Descriptions</h3>
      <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 bg-[#f4f4f6] max-w-[560px]">
        <Img src={product.img} alt={product.name} className="w-full h-[280px] object-contain" />
      </div>
      <h2 className="text-[24px] font-extrabold text-[#16243d] mt-6">{product.name}</h2>
      {copy.paras.map((para, i) => (
        <p key={i} className="text-[13.5px] leading-relaxed text-gray-600 mt-3">
          {i === 0 ? (
            <>
              <span className="text-[#F27F20] underline decoration-dotted">Mr Tom Gadgets</span> {para}
            </>
          ) : (
            para
          )}
        </p>
      ))}
      <h3 className="text-[20px] font-extrabold text-[#16243d] mt-7 mb-3">{product.name} Features</h3>
      <ul className="space-y-2.5">
        {copy.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600">
            <span className="text-gray-300 mt-0.5">•</span>
            {f}
          </li>
        ))}
      </ul>
      <h3 className="text-[20px] font-extrabold text-[#16243d] mt-8 mb-3">Check Similar Product Price</h3>
      <ul className="space-y-2">
        {sim.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-[13px]">
            <span className="text-gray-300">•</span>
            <Link href={`/product/${s.slug}`} className="text-[#F27F20] underline hover:no-underline">{s.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WarrantyBlock() {
  return (
    <div>
      <h3 className="text-[20px] font-extrabold text-[#16243d]">Warranty</h3>
      <p className="text-[13.5px] text-gray-600 mt-2">
        Explore our <Link href="/info/warranty-policy" className="text-[#F27F20] underline decoration-dotted hover:no-underline">Warranty Policy</Link> page for detailed information about our warranty coverage.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          "All products are 100% genuine with official brand warranty.",
          "Warranty does not cover physical damage, burn marks or liquid damage (unless rated).",
          "Keep the invoice and warranty card safe — both are required for any claim.",
          "For warranty service visit Mr Tom Care, Bashundhara City Shopping Complex (Level-3, Block-B, Shop-07).",
        ].map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-[13px] text-gray-600">
            <span className="text-gray-300 mt-0.5">•</span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DetailTabs({ product }: { product: P }) {
  const [tab, setTab] = useState<"spec" | "desc" | "warranty">("spec");
  const detail = REAL_DETAILS[product.slug];

  /* real spec groups, or the generated ones for products we couldn't fetch */
  const groups = useMemo(() => {
    if (detail?.specs?.length) return detail.specs;
    const gen = getSpecs(product);
    return [{ name: "Specification", rows: gen.map((r) => ({ label: r.k, value: r.v })) }];
  }, [detail, product]);

  const TabBtn = ({ id, label }: { id: typeof tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`text-[13px] font-bold px-5 py-2 rounded-md transition ${
        tab === id ? "bg-[#F27F20] text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <TabBtn id="spec" label="Specification" />
        <TabBtn id="desc" label="Description" />
        <TabBtn id="warranty" label="Warranty" />
      </div>

      <div className="mt-6">
        {tab === "spec" && (
          <>
            <h3 className="text-[20px] font-extrabold text-[#16243d] mb-4">Specification</h3>
            <SpecTable groups={groups} fallback={getSpecs(product)} />
            <div className="mt-10 space-y-10">
              <DescriptionBlock product={product} detail={detail} />
              <WarrantyBlock />
            </div>
          </>
        )}
        {tab === "desc" && <DescriptionBlock product={product} detail={detail} />}
        {tab === "warranty" && <WarrantyBlock />}
      </div>
    </div>
  );
}
