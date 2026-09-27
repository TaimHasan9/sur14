"use client";
const features = [
  {
    label: "36 Months EMI",
    color: "#9E77ED",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    label: "Fastest Home Delivery",
    color: "#F27F20",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: "Exchange Facility",
    color: "#39B667",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    label: "Best Price Deals",
    color: "#FD5B67",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    label: "After-Sales Service",
    color: "#F27F20",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M15 15.75a3 3 0 11-6 0V9a3 3 0 016 0v6.75z" />
      </svg>
    ),
  },
  {
    label: "Eco-Friendly Packaging",
    color: "#22A45D",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21c4.5 0 7.5-3 7.5-7.5V3.75c0-.3-.2-.5-.5-.5H11.25C6.75 3.25 3.75 6.25 3.75 10.75c0 4.5 3 7.5 4.5 8.5-.5-2.5.5-6.5 3.75-9.5-2.5 3.5-3.25 6.75-2.5 9.75 1 .75 2.25 1.5 3.25 1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21c-.25-4.5 1.5-8.25 4.5-10.5" />
      </svg>
    ),
  },
];

export default function FeaturesStrip() {
  return (
    <section className="max-w-[1300px] mx-auto px-4 pt-4">
      <div className="bg-white rounded-lg border border-gray-100 px-4 py-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {features.map((f) => (
          <div key={f.label} className="flex items-center justify-center gap-2.5 py-1">
            <span style={{ color: f.color }}>{f.icon}</span>
            <span className="text-[14.5px] font-semibold text-gray-800">{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
