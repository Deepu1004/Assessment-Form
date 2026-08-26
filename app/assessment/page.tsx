"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionDTO, SubmissionAnswerInput } from "@/types/assessment";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { ArrowLeft, ArrowRight, Loader2, Send, Edit2, AlertCircle } from "lucide-react";

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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-3xl mx-auto w-full">
      <div className="w-full space-y-8">
        {/* Progress Bar Header */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalQuestions}
        />

        {/* Main Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-8 shadow-2xl relative">
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
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  Final Step
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Review Your Answers
                </h2>
                <p className="text-slate-400 text-sm">
                  Check your choices before generating your personality archetype result.
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const selectedOptId = selectedAnswers[q.id];
                  const selectedOpt = q.options.find((o) => o.id === selectedOptId);

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Question {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-200">{q.questionText}</p>
                        <p className="text-sm text-indigo-300 font-medium">
                          → {selectedOpt ? `${selectedOpt.optionKey}. ${selectedOpt.optionText}` : "No answer selected"}
                        </p>
                      </div>

                      <button
                        onClick={() => setCurrentStep(idx + 1)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Change Answer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  );
                })}
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                currentStep === 1 || submitting
                  ? "opacity-40 cursor-not-allowed text-slate-600 bg-slate-900 border border-slate-800"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isReviewStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentSelectedOptionId}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  !currentSelectedOptionId
                    ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700/50"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 active:scale-95"
                }`}
              >
                <span>{currentStep === totalQuestions ? "Review Answers" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calculating Scores...</span>
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
    </div>
  );
}
