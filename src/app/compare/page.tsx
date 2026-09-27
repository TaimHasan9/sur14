import { Suspense } from "react";
import PageView from "@/mtg/pages/ComparePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PageView />
    </Suspense>
  );
}
