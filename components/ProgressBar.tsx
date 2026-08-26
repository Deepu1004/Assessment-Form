"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
        <span>
          Step {Math.min(currentStep, totalSteps)} of {totalSteps}
        </span>
        <span className="text-indigo-400 font-bold">{Math.round(percentage)}% Completed</span>
      </div>
      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 ease-out animate-pulse-glow"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
