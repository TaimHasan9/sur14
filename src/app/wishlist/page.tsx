import { Suspense } from "react";
import PageView from "@/mtg/pages/WishlistPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PageView />
    </Suspense>
  );
}
