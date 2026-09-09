"use client";

import React, { useState, useEffect } from "react";
import { AdminQuestionDTO } from "@/types/assessment";
import {
  Wrench,
  Plus,
  Trash2,
  Eye,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Target,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

interface ResultTypeRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  minimumScore: number;
  maximumScore: number;
  displayOrder: number;
  active: boolean;
}

export default function AdminAssessmentBuilderPage() {
  const [questions, setQuestions] = useState<AdminQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [resultTypes, setResultTypes] = useState<ResultTypeRow[]>([]);
  const [resultTypesLoading, setResultTypesLoading] = useState(true);
  const [savingResultTypeId, setSavingResultTypeId] = useState<string | null>(null);
  const [resultTypeError, setResultTypeError] = useState<string | null>(null);
  const [resultTypeSuccess, setResultTypeSuccess] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/questions");
      if (!res.ok) throw new Error("Failed to fetch questions.");
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultTypes = async () => {
    try {
      setResultTypesLoading(true);
      const res = await fetch("/api/admin/results");
      if (!res.ok) throw new Error("Failed to fetch result types.");
      const data = await res.json();
      setResultTypes(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setResultTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchResultTypes();
  }, []);

  // Derived: max possible score from active questions
  const maxPossibleScore = questions.reduce((acc, q) => {
    const maxOpt = Math.max(...q.options.map((o) => o.score), 0);
    return acc + maxOpt;
  }, 0);

  const minPossibleScore = questions.reduce((acc, q) => {
    const minOpt = Math.min(...q.options.map((o) => o.score), Infinity);
    return acc + (Number.isFinite(minOpt) ? minOpt : 0);
  }, 0);

  // Check if ranges cover min..max
  const activeRanges = resultTypes.filter((r) => r.active).sort((a, b) => a.minimumScore - b.minimumScore);
  const lowestRangeMin = activeRanges[0]?.minimumScore ?? null;
  const highestRangeMax = activeRanges.at(-1)?.maximumScore ?? null;
  const rangesGap =
    maxPossibleScore > 0 &&
    (lowestRangeMin === null ||
      highestRangeMax === null ||
      minPossibleScore < lowestRangeMin ||
      maxPossibleScore > highestRangeMax);

  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, questionText: text } : q))
    );
  };

  const handleUpdateOption = (
    qId: string,
    optId: string,
    field: "optionText" | "optionKey" | "score",
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((opt) =>
            opt.id === optId ? { ...opt, [field]: value } : opt
          ),
        };
      })
    );
  };

  const handleSaveQuestion = async (question: AdminQuestionDTO) => {
    try {
      setSavingId(question.id);
      setError(null);

      await fetch(`/api/admin/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: question.questionText }),
      });

      await Promise.all(
        question.options.map((opt) =>
          fetch(`/api/admin/options/${opt.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              optionKey: opt.optionKey,
              optionText: opt.optionText,
              score: opt.score,
            }),
          })
        )
      );

      setSuccessMsg(`Question ${question.displayOrder} saved successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question.");
    } finally {
      setSavingId(null);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const newPrompt = `Question ${questions.length + 1}: What is your approach?`;
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newPrompt,
          options: [
            { optionKey: "A", optionText: "Option A", score: 1 },
            { optionKey: "B", optionText: "Option B", score: 2 },
            { optionKey: "C", optionText: "Option C", score: 3 },
            { optionKey: "D", optionText: "Option D", score: 4 },
            { optionKey: "E", optionText: "Option E", score: 5 },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to create new question.");
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding question.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting question.");
    }
  };

  const handleResultTypeChange = (id: string, field: "minimumScore" | "maximumScore", value: number) => {
    setResultTypes((prev) =>
      prev.map((rt) => (rt.id === id ? { ...rt, [field]: value } : rt))
    );
  };

  const handleSaveResultType = async (rt: ResultTypeRow) => {
    try {
      setSavingResultTypeId(rt.id);
      setResultTypeError(null);
      const res = await fetch(`/api/admin/results/${rt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minimumScore: rt.minimumScore,
          maximumScore: rt.maximumScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save result type.");
      setResultTypeSuccess(`"${rt.name}" range updated.`);
      setTimeout(() => setResultTypeSuccess(null), 3000);
      await fetchResultTypes();
    } catch (err) {
      setResultTypeError(err instanceof Error ? err.message : "Failed to save result type.");
    } finally {
      setSavingResultTypeId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading Assessment Builder...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench className="w-7 h-7 text-[#004bbf]" />
            ASSESSMENT BUILDER
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Visual interactive editor for designing questions and scoring rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 rounded-xl bg-[#004bbf] hover:bg-[#003993] text-white font-bold text-sm flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>

          <Link
            href="/assessment"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Preview Assessment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Score Range Configuration */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#004bbf]" />
            Score Range Configuration
          </h2>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              {questions.length} questions active
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              Score range: {minPossibleScore} – {maxPossibleScore} pts
            </span>
          </div>
        </div>

        {rangesGap && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-sm flex items-start gap-2.5">
            <TriangleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Score range gap detected</p>
              <p className="text-xs mt-0.5">
                Questions can produce scores from <span className="font-mono font-bold">{minPossibleScore}</span> to{" "}
                <span className="font-mono font-bold">{maxPossibleScore}</span>, but result type ranges only cover{" "}
                <span className="font-mono font-bold">{lowestRangeMin ?? "?"}</span> to{" "}
                <span className="font-mono font-bold">{highestRangeMax ?? "?"}</span>. Submissions with scores outside
                this window will fail. Update the ranges below to cover the full score span.
              </p>
            </div>
          </div>
        )}

        {resultTypeError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{resultTypeError}</span>
          </div>
        )}

        {resultTypeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resultTypeSuccess}</span>
          </div>
        )}

        {resultTypesLoading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-[1fr_100px_100px_auto] gap-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Result Type</span>
              <span className="text-center">Min Score</span>
              <span className="text-center">Max Score</span>
              <span />
            </div>
            {resultTypes
              .toSorted((a, b) => a.displayOrder - b.displayOrder)
              .map((rt) => {
                const coversShort =
                  maxPossibleScore > 0 && rt.active && rt.maximumScore < maxPossibleScore;
                return (
                  <div
                    key={rt.id}
                    className={`grid grid-cols-[1fr_100px_100px_auto] gap-3 items-center p-3 rounded-xl border ${
                      coversShort
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rt.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{rt.slug}</p>
                    </div>
                    <input
                      type="number"
                      value={rt.minimumScore}
                      onChange={(e) =>
                        handleResultTypeChange(rt.id, "minimumScore", Number(e.target.value))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-emerald-700 font-mono font-bold text-center text-sm focus:outline-none focus:border-[#004bbf]"
                    />
                    <input
                      type="number"
                      value={rt.maximumScore}
                      onChange={(e) =>
                        handleResultTypeChange(rt.id, "maximumScore", Number(e.target.value))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-emerald-700 font-mono font-bold text-center text-sm focus:outline-none focus:border-[#004bbf]"
                    />
                    <button
                      onClick={() => handleSaveResultType(rt)}
                      disabled={savingResultTypeId === rt.id}
                      className="px-3 py-1.5 rounded-xl bg-[#004bbf] hover:bg-[#003993] text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      {savingResultTypeId === rt.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Visual Questions Builder List */}
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#004bbf]">
                Question {idx + 1}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveQuestion(q)}
                  disabled={savingId === q.id}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {savingId === q.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Question</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-2">
              <label htmlFor={`q-${q.id}`} className="text-xs font-bold text-slate-700">Question Prompt</label>
              <textarea
                id={`q-${q.id}`}
                rows={2}
                value={q.questionText}
                onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#004bbf]"
              />
            </div>

            {/* Option Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Answer Options & Assigned Scores
              </span>

              <div className="space-y-2.5">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={opt.optionKey}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "optionKey", e.target.value)
                        }
                        className="w-10 px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-center text-xs"
                      />
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "optionText", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Hash className="w-3 h-3 text-emerald-600" /> Score:
                      </span>
                      <input
                        type="number"
                        value={opt.score}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "score", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-emerald-700 font-mono font-extrabold text-center text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
