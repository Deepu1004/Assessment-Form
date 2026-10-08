"use client";

import dynamic from "next/dynamic";

const AssessmentForm = dynamic(() => import("@/components/AssessmentForm"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <p className="text-slate-400">Loading form...</p>
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:p-12 min-h-screen">
      <AssessmentForm>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
          Take the Research Integrity Challenge
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Complete the quiz, get your score, and download the Taylor & Francis
          Research Integrity Toolkit — with practical resources to support
          responsible research.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 italic max-w-lg mx-auto leading-normal">
          By submitting this form, you agree to receive relevant
          communications from Taylor & Francis.
        </p>
      </AssessmentForm>
    </div>
  );
}
