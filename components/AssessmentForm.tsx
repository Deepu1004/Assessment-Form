"use client";

import React, { useState, useEffect } from "react";
import { QuestionDTO, SubmissionAnswerInput } from "@/types/assessment";
import { Loader2, Send, AlertCircle, Check, Zap } from "lucide-react";
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

export default function AssessmentForm({ children }: { children?: React.ReactNode }) {
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Participant Demographic Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [researchArea, setResearchArea] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

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

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;
  const isDetailsValid =
    fullName.trim().length > 0 &&
    isValidEmail(email.trim()) &&
    jobTitle.trim().length > 0 &&
    organisationName.trim().length > 0 &&
    researchArea.trim().length > 0;

  const canSubmit = allQuestionsAnswered && isDetailsValid;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSubmitError(null);
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

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

      // Display result on the same page
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // If result is shown, display it
  if (result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 sm:p-10 lg:p-12 text-center space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <img
              src="/tf-logo.jpg"
              alt="Taylor & Francis"
              className="h-8 sm:h-10 w-auto object-contain mx-auto"
            />
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Assessment Complete!</h1>
            <p className="text-slate-600">Your Research Integrity profile has been calculated.</p>
          </div>

          <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600 uppercase">Your Result</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#004bbf] mt-2">
                {result.resultTypeName}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-xl font-bold text-slate-900">{result.finalScore} pts</span>
              </div>
            </div>

            {result.resultTypeDescription && (
              <p className="text-sm text-slate-700 italic border-t border-blue-200 pt-4 mt-4">
                {result.resultTypeDescription}
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Session ID:</span> {result.sessionId}</p>
            {fullName && <p><span className="font-semibold text-slate-900">Name:</span> {fullName}</p>}
            {email && <p><span className="font-semibold text-slate-900">Email:</span> {email}</p>}
          </div>

          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-2.5 bg-[#004bbf] hover:bg-[#003993] text-white font-bold text-sm rounded-md shadow-md transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-8">

      {/* Logo + intro (single header for the whole page) */}
      <div className="text-center space-y-4">
        <img
          src="/tf-logo.jpg"
          alt="Taylor & Francis by Informa"
          className="h-12 sm:h-16 w-auto object-contain mx-auto"
        />
        {children}
      </div>

      <div className="space-y-8">
        {/* Questions Section */}
        <div className="space-y-6 border-t border-slate-200 pt-8">
          {questions.map((question, idx) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#004bbf] text-white text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    {formatQuestionText(question.questionText)}
                  </p>
                </div>
              </div>
              <div className="ml-11 space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50"
                    style={{
                      borderColor: selectedAnswers[question.id] === option.id ? "#004bbf" : "#e2e8f0",
                      backgroundColor: selectedAnswers[question.id] === option.id ? "#eff6ff" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={selectedAnswers[question.id] === option.id}
                      onChange={() => handleSelectOption(question.id, option.id)}
                      className="w-4 h-4 mt-0.5 accent-[#004bbf]"
                    />
                    <span className="text-sm text-slate-700">
                      <span className="font-semibold text-[#004bbf]">{option.optionKey}.</span> {option.optionText}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Participant Info Section */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#004bbf] mb-2">
              Participant Information
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Tell Us About Yourself
            </h2>
            <p className="text-slate-600 text-xs">Please enter your details to accompany your assessment.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setJobTitle(e.target.value)}
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
                onChange={(e) => setOrganisationName(e.target.value)}
                placeholder="e.g. University of Oxford"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#004bbf]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Research Area <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={researchArea}
                onChange={(e) => setResearchArea(e.target.value)}
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

          {submitError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full py-3 font-bold text-base rounded-md shadow-md transition-all flex items-center justify-center gap-2 ${
            canSubmit && !submitting
              ? "bg-[#004bbf] hover:bg-[#003993] text-white active:scale-95"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Calculating Score...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Assessment</span>
            </>
          )}
        </button>
        {!canSubmit && (
          <p className="text-xs text-slate-500 text-center mt-2">
            {!allQuestionsAnswered
              ? `Complete all ${questions.length - Object.keys(selectedAnswers).length} remaining question(s)`
              : "Fill in all participant information fields"}
          </p>
        )}
      </div>
    </div>
  );
}
