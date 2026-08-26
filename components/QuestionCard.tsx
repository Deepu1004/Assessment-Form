"use client";

import React, { useEffect } from "react";
import { QuestionDTO, AnswerOptionDTO } from "@/types/assessment";
import { CheckCircle2 } from "lucide-react";

interface QuestionCardProps {
  question: QuestionDTO;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
}: QuestionCardProps) {
  // Add keyboard shortcuts (A-E or 1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const optionIndex = ["A", "B", "C", "D", "E"].indexOf(key);
      const numIndex = ["1", "2", "3", "4", "5"].indexOf(key);
      const targetIdx = optionIndex !== -1 ? optionIndex : numIndex;

      if (targetIdx !== -1 && question.options[targetIdx]) {
        onSelectOption(question.options[targetIdx].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, onSelectOption]);

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          Question #{question.displayOrder}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug tracking-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option: AnswerOptionDTO, idx) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                isSelected
                  ? "bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                    isSelected
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                  }`}
                >
                  {option.optionKey || String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium text-sm sm:text-base">
                  {option.optionText}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 animate-in fade-in zoom-in duration-200" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
