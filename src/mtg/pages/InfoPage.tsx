"use client";
import Link from "@/mtg/components/Link";
import { useParams } from "next/navigation";
import Seo from "@/mtg/components/Seo";
import NotFoundPage from "./NotFoundPage";
import Header from "@/mtg/components/Header";
import Footer from "@/mtg/components/Footer";
import ChatWidget from "@/mtg/components/ChatWidget";

const PAGES: Record<string, { title: string; body: string[] }> = {
  "about-us": { title: "About Us", body: ["Mr Tom Gadgets started in 2016 as a small gadget shop in Bashundhara City, Dhaka. Today it is one of Bangladesh's most trusted tech & lifestyle e-commerce platforms with multiple outlets across Dhaka.", "We sell 100% genuine products with official warranty, competitive pricing, EMI facility, exchange offers and dedicated after-sales service."] },
  corporate: { title: "Corporate", body: ["Our corporate team handles bulk orders, B2B procurement and enterprise solutions for offices, schools and businesses across Bangladesh.", "Contact corporate@applegadgetsbd.com for bulk pricing and dedicated support."] },
  "order-tracking": { title: "Order Tracking", body: ["Track your order anytime using your order code (AGLxxxxxx).", "Call 09678148148 or message us on WhatsApp for live delivery status."] },
  blog: { title: "Blog", body: ["Read the latest tech news, reviews, buying guides and price updates from the Mr Tom Gadgets editorial team."] },
  "press-coverage": { title: "Press Coverage", body: ["Mr Tom Gadgets has been featured in leading national dailies and tech media for its contribution to the gadget retail industry of Bangladesh."] },
  careers: { title: "Careers", body: ["We are always looking for passionate people. Current openings: Sales Executive, Technician, Digital Marketing Executive, Customer Support Agent.", "Send your CV to hr@applegadgetsbd.com."] },
  "complaint-advice": { title: "Complaint / Advice", body: ["Your feedback makes us better. Share complaints or suggestions with our support team and we will respond within 24 hours."] },
  "contact-us": { title: "Contact Us", body: ["Hotline: 09678148148 · Email: contact@mrtomgadgets.com", "Outlets: Bashundhara City (Basement 2 & Level 4/5), Jamuna Future Park (Level 4), Multiplan Center (Level 5), Dhaka."] },
  faqs: { title: "FAQs", body: ["Q: Are all products genuine? — Yes, every product is 100% genuine with official warranty.", "Q: Do you deliver outside Dhaka? — Yes, we deliver all over Bangladesh in 3-5 days.", "Q: Is EMI available? — Yes, up to 36 months with leading banks for orders above ৳5,000."] },
  "privacy-policy": { title: "Privacy Policy", body: ["We respect your privacy. Personal information collected during ordering (name, phone, address) is used only for delivery and support purposes and is never sold to third parties.", "Payment information is processed by certified payment gateways with SSL encryption."] },
  "emi-and-payment-policy": { title: "EMI and Payment Policy", body: ["EMI is available for orders above ৳5,000 with tenors up to 36 months from leading banks and card providers.", "We accept bKash, Nagad, Rocket, VISA, Mastercard and Cash on Delivery."] },
  "warranty-policy": { title: "Warranty Policy", body: ["All products carry official brand warranty. Warranty does not cover physical damage, burn marks, water damage (unless rated) or unauthorized servicing.", "Keep the invoice and warranty card safe for claims."] },
  "exchange-policy": { title: "Exchange Policy", body: ["Exchange your old device and get up to ৳10,000 off on a new one. Devices are evaluated at our outlets based on condition, age and market value."] },
  "delivery-policy": { title: "Delivery Policy", body: ["Inside Dhaka: 24-48 hours. Outside Dhaka: 3-5 working days. Free delivery on orders above ৳2,000 within Dhaka."] },
  "pre-order-policy": { title: "Pre-Order Policy", body: ["Pre-order products are imported on demand. An advance payment of 20-50% is required. Delivery usually takes 2-4 weeks depending on the product."] },
  "refund-policy": { title: "Refund Policy", body: ["Refunds are processed within 7-10 working days after the returned product passes quality check. Refunds are issued to the original payment method or as store credit."] },
  "return-policy": { title: "Return Policy", body: ["Products can be returned within 7 days of delivery if defective or damaged. The product must be unused, with original box and accessories."] },
};

export default function InfoPage() {
  const { slug = "" } = (useParams() as { slug: string });
  const page = PAGES[slug];
  if (!page) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${page.title} | Mr Tom Gadgets`} description={page.body[0]} />
      <Header />
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#F27F20]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#1d1d1f]">{page.title}</span>
        </nav>
        <h1 className="text-[30px] sm:text-[38px] font-black text-[#16243d]">{page.title}</h1>
        <div className="mt-5 space-y-4">
          {page.body.map((b, i) => (
            <p key={i} className="text-[14.5px] leading-relaxed text-gray-600">{b}</p>
          ))}
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
