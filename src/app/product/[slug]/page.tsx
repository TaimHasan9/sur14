import { Suspense } from "react";
import type { Metadata } from "next";
import ProductDetailPage from "@/mtg/pages/ProductPage";
import { allProducts } from "@/mtg/data/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = allProducts.find((x) => x.slug === slug);
  if (!product) {
    return { title: "Product Not Found | Mr Tom Gadgets" };
  }
  const title = `${product.name} Price in Bangladesh | Mr Tom Gadgets`;
  const description = `Buy ${product.name} at the best price in Bangladesh — ৳${product.price.toLocaleString(
    "en-US"
  )}. Genuine product with official warranty, EMI up to 36 months, exchange offer and fastest home delivery from Mr Tom Gadgets.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/product/${product.slug}`,
      images: [{ url: product.img, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.img],
    },
  };
}

function ProductJsonLd({ slug }: { slug: string }) {
  const product = allProducts.find((x) => x.slug === slug);
  if (!product) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.length ? [product.img, ...product.gallery] : [product.img],
    description: `${product.name} — genuine product with official warranty in Bangladesh.`,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `https://mrtomgadgets.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability:
        product.status === "pre-order" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Mr Tom Gadgets" },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <ProductJsonLd slug={slug} />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ProductDetailPage />
      </Suspense>
    </>
  );
}
