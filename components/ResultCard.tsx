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
  maxPossibleScore,
}: ResultCardProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Assessment Result",
        text: `I scored ${finalScore}/${maxPossibleScore} and got ${result.type}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Result link copied to clipboard!");
    }
  };

  return (
    <div className="w-full glass-panel p-6 sm:p-10 rounded-3xl space-y-8 border shadow-2xl relative overflow-hidden text-center">
      {/* Background ambient light glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Assessment Complete
        </div>

        <h1 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Your Result Archetype
        </h1>

        <div className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 uppercase">
          {result.type}
        </div>
      </div>

      {/* Score Badge */}
      <div className="inline-flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 max-w-xs mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Your Final Score</span>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 font-mono">
          {finalScore} <span className="text-slate-500 text-lg">/ {maxPossibleScore}</span>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 max-w-2xl mx-auto">
        <p className="text-slate-200 text-base leading-relaxed font-normal">
          {result.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
        <Link
          href="/assessment"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Assessment</span>
        </Link>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Result</span>
        </button>

        <Link
          href="/admin"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 font-bold text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin Studio</span>
        </Link>
      </div>
    </div>
  );
}
