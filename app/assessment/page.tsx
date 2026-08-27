"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionDTO, SubmissionAnswerInput } from "@/types/assessment";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { ArrowLeft, ArrowRight, Loader2, Send, Edit2, AlertCircle } from "lucide-react";
import { formatQuestionText } from "@/lib/utils";

export default function AssessmentPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1); // 1 to questions.length, step N+1 is Review
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> answerOptionId
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch active assessment questions from API
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoadingQuestions(true);
        setLoadError(null);
        const res = await fetch("/api/assessment");
        if (!res.ok) {
          throw new Error("Failed to load assessment questions.");
        }
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, []);

  const totalQuestions = questions.length;
  const isReviewStep = currentStep === totalQuestions + 1;
  const currentQuestion = questions[currentStep - 1];

  const currentSelectedOptionId = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentStep <= totalQuestions) {
      if (!currentSelectedOptionId) return; // Prevent advancing without selecting an answer
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      const formattedAnswers: SubmissionAnswerInput[] = Object.entries(selectedAnswers).map(
        ([questionId, answerOptionId]) => ({
          questionId,
          answerOptionId,
        })
      );

      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      // Navigate to results page
      router.push(`/result/${data.sessionId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
      setSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          Loading assessment questions from database...
        </p>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Assessment Error</h2>
        <p className="text-slate-400 text-sm">{loadError || "No questions found."}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
        >
          Try Reloading
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
      {/* Expanded Form Container */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[580px] sm:min-h-[640px] p-6 sm:p-10 lg:p-12 justify-between relative transition-all">
        
        {/* Taylor & Francis Header Logo */}
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between mb-4">
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis"
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {currentStep <= totalQuestions ? `Question ${currentStep} of ${totalQuestions}` : "Review"}
          </span>
        </div>

        {/* Step 1 to N: Question Display */}
        {!isReviewStep && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedOptionId={currentSelectedOptionId}
            onSelectOption={handleSelectOption}
          />
        )}

        {/* Step N+1: Review Answers Page */}
        {isReviewStep && (
          <div className="space-y-4 text-left">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                Final Step
              </span>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Review Your Answers
              </h2>
              <p className="text-slate-500 text-xs">
                Check your choices before calculating your Research Integrity score.
              </p>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const selectedOptId = selectedAnswers[q.id];
                const selectedOpt = q.options.find((o) => o.id === selectedOptId);

                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-[#004bbf] uppercase">
                        Question {idx + 1}
                      </span>
                      <p className="text-xs font-medium text-slate-700 truncate">{formatQuestionText(q.questionText)}</p>
                      <p className="text-xs text-[#003993] font-semibold truncate">
                        → {selectedOpt ? `${selectedOpt.optionKey}. ${selectedOpt.optionText}` : "No answer"}
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentStep(idx + 1)}
                      className="p-1.5 rounded bg-white text-slate-600 border border-slate-300 hover:text-[#004bbf] hover:border-[#004bbf] transition-colors flex items-center gap-1 text-[11px] font-semibold shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom OK / Next Button matching Image 2 */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md transition-colors"
            >
              Back
            </button>
          )}

          {!isReviewStep ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentSelectedOptionId}
              className={`w-full py-2.5 bg-[#004bbf] hover:bg-[#003993] active:scale-95 text-white font-bold text-sm rounded-md shadow-md transition-all text-center ${
                !currentSelectedOptionId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              OK
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 bg-[#004bbf] hover:bg-[#003993] active:scale-95 text-white font-bold text-sm rounded-md shadow-md transition-all text-center flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Score...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
