import { Suspense } from "react";
import PageView from "@/mtg/pages/SearchPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PageView />
    </Suspense>
  );
}
