"use client";

import Link from "@/mtg/components/Link";
import Img from "./Img";
import { formatBDT, resolveImg, type P } from "@/mtg/data/catalog";
import { useShop } from "@/mtg/store/shop";

export default function ProductCard({ product }: { product: P }) {
  const off = product.oldPrice ? product.oldPrice - product.price : 0;
  const { add, toggleWish, wishlist } = useShop();
  const wished = wishlist.includes(product.slug);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="ag-card group block w-[190px] sm:w-[210px] shrink-0 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.06)]"
    >
      {/* image */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {product.crop ? (
          <div
            className="absolute inset-0 group-hover:scale-[1.03] transition-transform duration-500"
            style={{
              backgroundImage: `url(${resolveImg(product.img)})`,
              backgroundSize: product.crop.size,
              backgroundPosition: product.crop.pos,
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <Img
            src={product.img}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        )}
        {product.status === "pre-order" && (
          <span className="absolute top-2 left-2 bg-[#1d1d1f] text-white text-[9px] font-bold px-2 py-1 rounded-full">PRE-ORDER</span>
        )}
        {product.hot && (
          <span className="absolute top-2 right-2 bg-[#FD5B67] text-white text-[9px] font-extrabold px-2 py-1 rounded skew-x-[-8deg]">
            HOT
            <span className="block text-[7px] font-bold -mt-0.5">DEALS</span>
          </span>
        )}
      </div>

      {/* info */}
      <div className="px-3 pb-3.5 pt-1">
        <h3 className="text-[14px] font-semibold leading-snug text-[#1d1d1f] line-clamp-2 min-h-[40px] group-hover:text-[#F27F20] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[17px] font-extrabold text-[#1d1d1f]">{formatBDT(product.price)}</p>
        <div className="mt-1 flex items-center gap-2 min-h-[20px]">
          {product.oldPrice && (
            <>
              <span className="text-[12px] text-gray-400 line-through">{formatBDT(product.oldPrice)}</span>
              <span className="text-[11px] font-bold text-[#39B667] bg-[#39B667]/10 px-1.5 py-0.5 rounded">
                ৳ {off.toLocaleString("en-US")} OFF
              </span>
            </>
          )}
        </div>

        {/* Shop Now + wishlist + cart — fully working buttons */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-[12.5px] font-semibold text-[#1d1d1f] transition-colors group-hover:border-transparent group-hover:bg-[#F27F20] group-hover:text-white">
            {product.status === "pre-order" ? "Pre Order" : "Shop Now"}
          </span>
          <button
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWish(product.slug);
            }}
            className={`w-9 h-9 shrink-0 border rounded-full flex items-center justify-center transition ${
              wished ? "border-[#FD5B67] text-[#FD5B67]" : "border-gray-200 text-gray-400 hover:border-[#FD5B67] hover:text-[#FD5B67]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              add(product.slug);
            }}
            className="w-9 h-9 shrink-0 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:border-[#F27F20] hover:text-[#F27F20] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
