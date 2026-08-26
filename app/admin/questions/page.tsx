"use client";

import React, { useState, useEffect } from "react";
import { AdminQuestionDTO, AdminAnswerOptionDTO } from "@/types/assessment";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  Hash,
  CheckCircle2,
} from "lucide-react";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Editing question state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");

  // Adding option state
  const [addingOptionForQId, setAddingOptionForQId] = useState<string | null>(null);
  const [newOptKey, setNewOptKey] = useState("A");
  const [newOptText, setNewOptText] = useState("");
  const [newOptScore, setNewOptScore] = useState<number>(1);

  // Editing option state
  const [editingOptId, setEditingOptId] = useState<string | null>(null);
  const [editOptKey, setEditOptKey] = useState("");
  const [editOptText, setEditOptText] = useState("");
  const [editOptScore, setEditOptScore] = useState<number>(1);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/questions");
      if (!res.ok) throw new Error("Failed to load questions.");
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

  // Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      setCreatingQuestion(true);
      setError(null);
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newQuestionText,
          options: [
            { optionKey: "A", optionText: "Option A", score: 1 },
            { optionKey: "B", optionText: "Option B", score: 2 },
            { optionKey: "C", optionText: "Option C", score: 3 },
            { optionKey: "D", optionText: "Option D", score: 4 },
            { optionKey: "E", optionText: "Option E", score: 5 },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create question.");
      }

      setNewQuestionText("");
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question.");
    } finally {
      setCreatingQuestion(false);
    }
  };

  // Save Edit Question
  const handleSaveQuestionEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: editQuestionText }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to update question.");
      }

      setEditingQuestionId(null);
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question.");
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question.");
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question.");
    }
  };

  // Add Option
  const handleAddOption = async (questionId: string) => {
    if (!newOptText.trim()) return;
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionKey: newOptKey,
          optionText: newOptText,
          score: newOptScore,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to add option.");
      }

      setAddingOptionForQId(null);
      setNewOptText("");
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add option.");
    }
  };

  // Save Edit Option
  const handleSaveOptionEdit = async (optId: string) => {
    try {
      const res = await fetch(`/api/admin/options/${optId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionKey: editOptKey,
          optionText: editOptText,
          score: editOptScore,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to update option.");
      }

      setEditingOptId(null);
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update option.");
    }
  };

  // Delete Option
  const handleDeleteOption = async (optId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return;
    try {
      const res = await fetch(`/api/admin/options/${optId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete option.");
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete option.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading assessment questions...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-indigo-400" />
          Questions & Options Manager
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure questions, answer options, and individual option scores.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Question Card */}
      <form onSubmit={handleCreateQuestion} className="glass-panel p-6 rounded-2xl border space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Create New Question
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="What is your question prompt?"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={creatingQuestion}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0"
          >
            {creatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Question</span>
          </button>
        </div>
      </form>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="glass-panel p-6 rounded-2xl border space-y-4">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-start gap-3 flex-1">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-extrabold flex items-center justify-center shrink-0 text-sm">
                  {qIndex + 1}
                </span>

                {editingQuestionId === q.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editQuestionText}
                      onChange={(e) => setEditQuestionText(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500 text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveQuestionEdit(q.id)}
                      className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingQuestionId(null)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{q.questionText}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ID: {q.id} • Order: {q.displayOrder}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingQuestionId(q.id);
                    setEditQuestionText(q.questionText);
                  }}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="Edit question text"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Answer Options Sub-list */}
            <div className="space-y-3 pl-2 sm:pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Answer Options & Score Mapping
              </span>

              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    {editingOptId === opt.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editOptKey}
                          onChange={(e) => setEditOptKey(e.target.value)}
                          className="w-12 px-2 py-1 rounded bg-slate-800 border text-white text-center font-bold text-xs"
                        />
                        <input
                          type="text"
                          value={editOptText}
                          onChange={(e) => setEditOptText(e.target.value)}
                          className="flex-1 px-3 py-1 rounded bg-slate-800 border text-white text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 font-mono">Score:</span>
                          <input
                            type="number"
                            value={editOptScore}
                            onChange={(e) => setEditOptScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-slate-800 border text-emerald-400 font-bold text-center text-xs font-mono"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveOptionEdit(opt.id)}
                          className="p-1.5 rounded bg-emerald-600 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingOptId(null)}
                          className="p-1.5 rounded bg-slate-800 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {opt.optionKey}
                          </span>
                          <span className="text-sm text-slate-200">{opt.optionText}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            Score: {opt.score}
                          </div>

                          <button
                            onClick={() => {
                              setEditingOptId(opt.id);
                              setEditOptKey(opt.optionKey);
                              setEditOptText(opt.optionText);
                              setEditOptScore(opt.score);
                            }}
                            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOption(opt.id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Option Form */}
              {addingOptionForQId === q.id ? (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newOptKey}
                      onChange={(e) => setNewOptKey(e.target.value)}
                      placeholder="Key (e.g. A)"
                      className="w-16 px-3 py-1.5 rounded-lg bg-slate-900 border text-white text-xs font-bold text-center"
                    />
                    <input
                      type="text"
                      value={newOptText}
                      onChange={(e) => setNewOptText(e.target.value)}
                      placeholder="Option text..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border text-white text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Score:</span>
                      <input
                        type="number"
                        value={newOptScore}
                        onChange={(e) => setNewOptScore(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border text-emerald-400 font-bold text-xs font-mono text-center"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAddingOptionForQId(null)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddOption(q.id)}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      Save Option
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingOptionForQId(q.id);
                    setNewOptKey(String.fromCharCode(65 + q.options.length));
                    setNewOptText("");
                    setNewOptScore(q.options.length + 1);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Option</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
