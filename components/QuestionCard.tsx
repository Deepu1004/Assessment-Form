"use client";

import React, { useEffect } from "react";
import { QuestionDTO, AnswerOptionDTO } from "@/types/assessment";

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
  // Add keyboard shortcuts (A-D or 1-4)
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
    <div className="space-y-6 text-left">
      {/* Question Number Badge */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-[#004bbf] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {question.displayOrder}
        </div>
      </div>

      {/* Scenario Text */}
      <h2 className="text-base sm:text-lg lg:text-xl font-medium text-slate-800 leading-snug">
        {question.questionText}*
      </h2>

      {/* Answer Options matching Image 2 */}
      <div className="space-y-3 pt-2">
        {question.options.map((option: AnswerOptionDTO, idx) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center gap-3.5 group ${
                isSelected
                  ? "bg-[#eaf2ff] border-[#004bbf] ring-1 ring-[#004bbf]"
                  : "bg-[#f4f7fc] border-[#e2e8f0] hover:bg-[#eef4ff] hover:border-[#cbd5e1]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[#004bbf] text-white border-[#004bbf]"
                    : "bg-white text-[#004bbf] border-[#004bbf]/40"
                }`}
              >
                {option.optionKey || String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-sm sm:text-base font-medium leading-tight ${isSelected ? "text-[#003993] font-semibold" : "text-[#003993]/90"}`}>
                {option.optionText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
