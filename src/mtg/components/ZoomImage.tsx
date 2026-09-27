"use client";

import { useState } from "react";
import { resolveImg } from "@/mtg/data/catalog";

/* 4 "views" of the product image (center + 3 zoomed crops) — clicking a
   thumbnail switches the main image, exactly like a real product gallery */
const VIEWS = [
  { o: "50% 50%", s: 1 },
  { o: "28% 26%", s: 1.8 },
  { o: "72% 30%", s: 1.8 },
  { o: "50% 76%", s: 1.8 },
];

export default function ZoomImage({ src: rawSrc, alt, gallery }: { src: string; alt: string; gallery?: string[] }) {
  /* real multi-photo gallery (from the live site) → thumbnails switch the photo;
     otherwise fall back to the 4 zoomed "views" of the single image */
  const photos = gallery && gallery.length > 1 ? gallery : null;
  const [photo, setPhoto] = useState(0);
  const src = resolveImg(photos ? photos[photo] : rawSrc);
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const v = VIEWS[view];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div>
      {/* main image with cursor-follow zoom */}
      <div
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="border border-gray-100 rounded-lg bg-white aspect-square overflow-hidden cursor-zoom-in relative"
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: v.o,
            transform: `scale(${v.s})`,
            transformOrigin: v.o,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: origin,
            opacity: zoom ? 1 : 0,
            transform: `scale(${v.s * 1.9})`,
            transformOrigin: origin,
            transition: "opacity .15s ease",
          }}
        />
      </div>

      {/* thumbnails — real photos when available, else click to switch zoom view */}
      <div className="flex gap-2.5 mt-3 overflow-x-auto scrollbar-hide">
        {photos &&
          photos.map((ph, i) => (
            <button
              key={ph}
              onClick={() => {
                setPhoto(i);
                setView(0);
              }}
              aria-label={`Photo ${i + 1}`}
              className={`w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden border-2 bg-white transition ${i === photo ? "border-[#F27F20]" : "border-gray-100 hover:border-gray-300"}`}
            >
              <img src={resolveImg(ph)} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        {!photos && VIEWS.map((tv, i) => (
          <button
            key={i}
            onClick={() => setView(i)}
            aria-label={`View ${i + 1}`}
            className={`w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden border-2 transition ${
              i === view ? "border-[#F27F20]" : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <span
              className="block w-full h-full"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: tv.o,
                transform: `scale(${tv.s})`,
                transformOrigin: tv.o,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
