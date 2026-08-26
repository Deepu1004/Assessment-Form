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
} from "lucide-react";
import Link from "next/link";

export default function AdminAssessmentBuilderPage() {
  const [questions, setQuestions] = useState<AdminQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  useEffect(() => {
    fetchQuestions();
  }, []);

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

      // 1. Update question prompt
      await fetch(`/api/admin/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: question.questionText }),
      });

      // 2. Update options & scores
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wrench className="w-7 h-7 text-indigo-400" />
            ASSESSMENT BUILDER
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual interactive editor for designing questions and scoring rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>

          <Link
            href="/assessment"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Preview Assessment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Visual Questions Builder List */}
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel p-6 sm:p-8 rounded-2xl border space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Question {idx + 1}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveQuestion(q)}
                  disabled={savingId === q.id}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
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
                  className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Question Prompt</label>
              <textarea
                rows={2}
                value={q.questionText}
                onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Option Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Answer Options & Assigned Scores
              </span>

              <div className="space-y-2.5">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={opt.optionKey}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "optionKey", e.target.value)
                        }
                        className="w-10 px-2 py-1 rounded-lg bg-slate-800 border text-white font-bold text-center text-xs"
                      />
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "optionText", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border text-white text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Hash className="w-3 h-3 text-emerald-400" /> Score:
                      </span>
                      <input
                        type="number"
                        value={opt.score}
                        onChange={(e) =>
                          handleUpdateOption(q.id, opt.id, "score", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border text-emerald-400 font-mono font-extrabold text-center text-xs"
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
