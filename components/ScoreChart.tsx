"use client";

import React from "react";

interface ScoreChartProps {
  scores: Record<string, number>;
  winnerType: string;
}

const typeColorMap: Record<string, { bg: string; bar: string; text: string }> = {
  Explorer: {
    bg: "bg-blue-500/10",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
    text: "text-cyan-400",
  },
  Builder: {
    bg: "bg-emerald-500/10",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    text: "text-emerald-400",
  },
  Analyst: {
    bg: "bg-purple-500/10",
    bar: "bg-gradient-to-r from-purple-500 to-indigo-400",
    text: "text-purple-400",
  },
  Connector: {
    bg: "bg-amber-500/10",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    text: "text-amber-400",
  },
  Leader: {
    bg: "bg-rose-500/10",
    bar: "bg-gradient-to-r from-rose-500 to-pink-400",
    text: "text-rose-400",
  },
};

export function ScoreChart({ scores, winnerType }: ScoreChartProps) {
  // Sort score entries descending
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(...Object.values(scores), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Personality Breakdown
      </h3>

      <div className="space-y-3">
        {sortedScores.map(([typeName, score]) => {
          const isWinner = typeName === winnerType;
          const percentage = Math.round((score / maxScore) * 100);
          const color = typeColorMap[typeName] || {
            bg: "bg-indigo-500/10",
            bar: "bg-gradient-to-r from-indigo-500 to-purple-400",
            text: "text-indigo-400",
          };

          return (
            <div key={typeName} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className={`font-semibold ${isWinner ? "text-white font-bold" : "text-slate-300"}`}>
                  {typeName} {isWinner && <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Winner</span>}
                </span>
                <span className={`font-mono font-bold ${color.text}`}>
                  {score} pts
                </span>
              </div>

              <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${color.bar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
