import { Suspense } from "react";
import type { Metadata } from "next";
import HomePage from "@/mtg/pages/HomePage";

export const metadata: Metadata = {
  title: "Smartphones, Gadgets & Premium Accessories | Mr Tom Gadgets",
  description:
    "Bangladesh's trusted tech & lifestyle e-commerce store. Genuine iPhone, MacBook, iPad, Apple Watch, AirPods, Samsung, home appliances & accessories with official warranty, EMI and fastest home delivery.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomePage />
    </Suspense>
  );
}
