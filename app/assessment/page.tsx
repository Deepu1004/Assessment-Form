"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionDTO, SubmissionAnswerInput } from "@/types/assessment";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { ArrowLeft, ArrowRight, Loader2, Send, Edit2, AlertCircle } from "lucide-react";
import { formatQuestionText } from "@/lib/utils";

const RESEARCH_AREAS = [
  "Allied and Public Health",
  "Biological, Earth, Environmental and Food Sciences",
  "Dentistry",
  "Engineering, Computing and Technology",
  "General Medicine",
  "Humanities, Media and Arts",
  "Physical and Chemical Sciences",
  "Social Sciences",
];

export default function AssessmentPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1); // 1 to questions.length, N+1 is Details, N+2 is Review
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> answerOptionId
  
  // Participant Demographic Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [researchArea, setResearchArea] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

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
  const isDetailsStep = currentStep === totalQuestions + 1;
  const isReviewStep = currentStep === totalQuestions + 2;
  const currentQuestion = questions[currentStep - 1];

  const currentSelectedOptionId = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isDetailsStepValid =
    fullName.trim().length > 0 &&
    isValidEmail(email.trim()) &&
    jobTitle.trim().length > 0 &&
    organisationName.trim().length > 0 &&
    researchArea.trim().length > 0;

  const isCurrentStepComplete =
    currentStep <= totalQuestions ? Boolean(currentSelectedOptionId) : !isDetailsStep || isDetailsStepValid;

  const getDetailsStepError = () => {
    const missing: string[] = [];
    if (!fullName.trim()) missing.push("Full Name");
    if (!jobTitle.trim()) missing.push("Job Title");
    if (!organisationName.trim()) missing.push("Organisation Name");
    if (!researchArea.trim()) missing.push("Research Area");

    if (!email.trim()) {
      missing.push("Email Address");
    } else if (!isValidEmail(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (missing.length === 0) return null;
    return `Please fill in all the required details before continuing: ${missing.join(", ")}.`;
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setStepError(null);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentStep <= totalQuestions) {
      if (!currentSelectedOptionId) {
        setStepError("Please select an answer before continuing.");
        return;
      }
    } else if (isDetailsStep && !isDetailsStepValid) {
      setStepError(getDetailsStepError());
      return;
    }
    setStepError(null);
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStepError(null);
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
        body: JSON.stringify({
          answers: formattedAnswers,
          fullName,
          email,
          jobTitle,
          organisationName,
          researchArea,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      // Mark this session as taken on this device so the result page can
      // distinguish the participant's own browser from a shared link.
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`own-result:${data.sessionId}`, "1");
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
            {currentStep <= totalQuestions
              ? `Question ${currentStep} of ${totalQuestions}`
              : isDetailsStep
              ? "Participant Info"
              : "Review & Submit"}
          </span>
        </div>

        {/* Step 1 to N: Question Display */}
        {currentStep <= totalQuestions && currentQuestion && (
          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              selectedOptionId={currentSelectedOptionId}
              onSelectOption={handleSelectOption}
            />
            {stepError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{stepError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step N+1: Participant Details Form */}
        {isDetailsStep && (
          <div className="space-y-4 text-left py-2 max-h-[440px] overflow-y-auto pr-1">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#004bbf] mb-2">
                Participant Information
              </span>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Tell Us About Yourself
              </h2>
              <p className="text-slate-500 text-xs">
                Please enter your details to accompany your Research Integrity assessment.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setStepError(null);
                  }}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStepError(null);
                  }}
                  placeholder="e.g. jane.doe@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    setStepError(null);
                  }}
                  placeholder="e.g. Associate Professor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organisation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organisationName}
                  onChange={(e) => {
                    setOrganisationName(e.target.value);
                    setStepError(null);
                  }}
                  placeholder="e.g. University of Oxford"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Research Area (Choose One) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={researchArea}
                  onChange={(e) => {
                    setResearchArea(e.target.value);
                    setStepError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
                >
                  <option value="">-- Select Research Area --</option>
                  {RESEARCH_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {stepError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{stepError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step N+2: Review Answers Page */}
        {isReviewStep && (
          <div className="space-y-4 text-left">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                Final Step
              </span>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Review Your Answers & Information
              </h2>
              <p className="text-slate-500 text-xs">
                Check your details and choices before calculating your Research Integrity score.
              </p>
            </div>

            {/* Participant Info Summary Card */}
            {(fullName || email || jobTitle || organisationName || researchArea) && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-left">
                <div className="space-y-0.5 text-xs text-slate-700">
                  <p className="font-bold text-[#004bbf]">Participant Details:</p>
                  {fullName && <p><span className="font-medium text-slate-500">Name:</span> {fullName}</p>}
                  {email && <p><span className="font-medium text-slate-500">Email:</span> {email}</p>}
                  {jobTitle && <p><span className="font-medium text-slate-500">Title:</span> {jobTitle}</p>}
                  {organisationName && <p><span className="font-medium text-slate-500">Org:</span> {organisationName}</p>}
                  {researchArea && <p><span className="font-medium text-slate-500">Area:</span> {researchArea}</p>}
                </div>
                <button
                  onClick={() => setCurrentStep(totalQuestions + 1)}
                  className="p-1.5 rounded bg-white text-slate-600 border border-slate-300 hover:text-[#004bbf] hover:border-[#004bbf] transition-colors flex items-center gap-1 text-[11px] font-semibold shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Details
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
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
              className={`w-full py-2.5 active:scale-95 font-bold text-sm rounded-md shadow-md transition-all text-center ${
                isCurrentStepComplete
                  ? "bg-[#004bbf] hover:bg-[#003993] text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-500"
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
