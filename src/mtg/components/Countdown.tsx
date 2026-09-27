"use client";

import { useEffect, useMemo, useState } from "react";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

/** Live DAY | HRS | MIN | SEC countdown box row (like applegadgetsbd offer cards) */
export default function Countdown({ hoursFromNow }: { hoursFromNow: number }) {
  const end = useMemo(() => Date.now() + hoursFromNow * 3600_000, [hoursFromNow]);
  const [left, setLeft] = useState(end - Date.now());

  useEffect(() => {
    const t = setInterval(() => setLeft(end - Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  const s = Math.max(0, Math.floor(left / 1000));
  const parts = [
    [pad(Math.floor(s / 86400)), "DAY"],
    [pad(Math.floor((s % 86400) / 3600)), "HRS"],
    [pad(Math.floor((s % 3600) / 60)), "MIN"],
    [pad(s % 60), "SEC"],
  ] as const;

  return (
    <div className="flex items-stretch justify-center divide-x divide-gray-200 border border-gray-100 rounded-lg bg-[#f7f8fa] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
      {parts.map(([v, l]) => (
        <div key={l} className="flex-1 py-3 text-center">
          <p className="text-[20px] font-extrabold text-[#16243d] leading-none tabular-nums">{v}</p>
          <p className="text-[10px] font-semibold text-gray-500 mt-1.5 tracking-wide">{l}</p>
        </div>
      ))}
    </div>
  );
}
