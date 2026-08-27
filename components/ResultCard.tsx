import React from "react";
import { Trophy, RotateCcw, Share2, Sparkles, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface ResultCardProps {
  result: {
    type: string;
    slug: string;
    description: string;
  };
  finalScore: number;
  maxPossibleScore: number;
  sessionId: string;
}

export function ResultCard({
  result,
  finalScore,
}: ResultCardProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
      {/* Expanded Result Container */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[580px] sm:min-h-[640px] p-6 sm:p-10 lg:p-12 text-center justify-between transition-all">
        
        {/* Header Logo */}
        <div className="pt-2 flex flex-col items-center">
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis"
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Result Header & Score */}
        <div className="my-auto space-y-6 sm:space-y-8 py-4">
          <div className="space-y-2">
            <h1 className="text-base sm:text-xl font-normal text-slate-700">
              Your Research Integrity Score
            </h1>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {finalScore * 2} / 50
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-xl font-normal text-slate-700">
              Your Integrity Personality
            </h2>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              {result.type}
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto px-4">
            Your responses reveal how you approach integrity when faced with real-world research dilemmas.
          </p>
        </div>

        {/* Bottom CTA matching image 3 */}
        <div className="pb-2 sm:pb-4 flex flex-col items-center space-y-4">
          <a
            href="https://newsroom.taylorandfrancisgroup.com/taylor-francis-launches-free-research-integrity-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md py-3.5 bg-[#004bbf] hover:bg-[#003993] active:scale-95 text-white font-bold text-sm sm:text-base rounded-lg shadow-md transition-all text-center"
          >
            Explore Resources
          </a>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/assessment" className="hover:text-slate-600 underline">
              Retake Quiz
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-slate-600 underline">
              Admin Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
