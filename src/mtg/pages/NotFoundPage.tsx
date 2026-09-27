"use client";
import Link from "@/mtg/components/Link";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-[80px] sm:text-[110px] font-black bg-gradient-to-r from-[#F27F20] to-[#8b5cf6] bg-clip-text text-transparent leading-none">404</p>
          <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[#16243d] mt-3">Page Not Found</h1>
          <p className="text-[14px] text-gray-500 mt-2 max-w-[420px] mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved. Try searching or go back to the homepage.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link href="/" className="btn-primary px-7 py-3 text-[14px]">Back to Home</Link>
            <Link href="/category/mobile-phone" className="btn-outline px-7 py-3 text-[14px]">Browse Products</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
