import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryPage from "@/mtg/pages/CategoryPage";
import { extraBySlug } from "@/mtg/data/extraCatalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = extraBySlug[slug];
  const title = cat ? `${cat.title} Price in Bangladesh | Mr Tom Gadgets` : "Category | Mr Tom Gadgets";
  const description = cat
    ? `Buy ${cat.title} at the best price in Bangladesh. ${cat.tagline} Genuine products with official warranty, EMI & fast delivery from Mr Tom Gadgets.`
    : "Browse genuine tech products with official warranty, EMI & fast delivery from Mr Tom Gadgets.";
  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title, description, type: "website", url: `/category/${slug}` },
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CategoryPage />
    </Suspense>
  );
}
