"use client";

import dynamic from "next/dynamic";

const AssessmentForm = dynamic(() => import("@/components/AssessmentForm"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <p className="text-slate-400">Loading form...</p>
    </div>
  ),
});

export default function AssessmentPage() {
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 min-h-screen">
      <AssessmentForm />
    </div>
  );
}
