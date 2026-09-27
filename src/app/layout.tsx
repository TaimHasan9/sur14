import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/mtg/store/shop";
import TrackProvider from "@/mtg/components/TrackProvider";
import { installImgTrackApi } from "@/mtg/utils/imgTracking";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700", "900"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mrtomgadgets.com";
const SITE_NAME = "Mr Tom Gadgets";
const DEFAULT_TITLE = "Mr Tom Gadgets - Bangladesh's Trusted Tech & Lifestyle Store";
const DEFAULT_DESC =
  "Mr Tom Gadgets — shop genuine Apple products, Samsung, Oppo, Vivo, Nokia & Huawei phones, laptops, home appliances and accessories in Bangladesh. Best prices, 36-month EMI, free delivery and exchange facility.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s" },
  description: DEFAULT_DESC,
  keywords: [
    "Mr Tom Gadgets", "apple gadgets bd", "iPhone price in Bangladesh", "Samsung phone price",
    "Oppo", "Vivo", "Nokia", "Huawei", "laptop price in BD", "home appliances",
    "washing machine", "wifi router", "gadget store bangladesh", "EMI mobile BD",
  ],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: DEFAULT_TITLE,
    description:
      "Genuine phones, laptops, home appliances & accessories at the best price in Bangladesh. 36-month EMI, exchange offer & fastest home delivery.",
    url: "/",
    images: [{ url: "/mr-tom-256.jpg", width: 256, height: 256, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mr Tom Gadgets - Bangladesh's Trusted Tech Store",
    description: "Best prices on phones, laptops, appliances & gadgets in Bangladesh — with EMI, exchange & fast delivery.",
    images: ["/mr-tom-256.jpg"],
  },
  icons: { icon: "/mr-tom-256.jpg", apple: "/mr-tom-256.jpg" },
  category: "E-commerce",
};

export const viewport: Viewport = {
  themeColor: "#F27F20",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL + "/",
  logo: SITE_URL + "/mr-tom-256.jpg",
  description:
    "Bangladesh's trusted tech & lifestyle store — genuine phones, laptops, home appliances and accessories with EMI and exchange facility.",
  address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
  contactPoint: { "@type": "ContactPoint", telephone: "+880-9678-148148", contactType: "customer service", areaServed: "BD" },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL + "/",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/search?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

function ImgTrackInit() {
  // Exposes window.__imgTrack (image analytics) on the client.
  if (typeof window !== "undefined") installImgTrackApi();
  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://adminapi.applegadgetsbd.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://adminapi.applegadgetsbd.com" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <meta name="geo.region" content="BD" />
        <meta name="geo.placename" content="Dhaka" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      </head>
      <body className={roboto.className}>
        <ImgTrackInit />
        <ShopProvider>
          <Suspense fallback={null}>
            <TrackProvider>{children}</TrackProvider>
          </Suspense>
        </ShopProvider>
      </body>
    </html>
  );
}
