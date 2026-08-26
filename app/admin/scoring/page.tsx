"use client";

import React, { useState, useEffect } from "react";
import { Grid3X3, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";

interface MatrixOption {
  optionId: string;
  optionKey: string;
  optionText: string;
  score: number;
  displayOrder: number;
}

interface MatrixQuestion {
  questionId: string;
  questionText: string;
  displayOrder: number;
  options: MatrixOption[];
}

export default function AdminScoringMatrixPage() {
  const [matrix, setMatrix] = useState<MatrixQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/scoring");
      if (!res.ok) throw new Error("Failed to load scoring matrix.");
      const data = await res.json();
      setMatrix(data.matrix);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleScoreChange = (questionId: string, optionId: string, newScore: number) => {
    setMatrix((prev) =>
      prev.map((q) => {
        if (q.questionId !== questionId) return q;
        return {
          ...q,
          options: q.options.map((opt) =>
            opt.optionId === optionId ? { ...opt, score: newScore } : opt
          ),
        };
      })
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      // Collect all option IDs and scores into a single payload
      const allScores: Array<{ optionId: string; score: number }> = [];
      matrix.forEach((q) => {
        q.options.forEach((opt) => {
          allScores.push({ optionId: opt.optionId, score: opt.score });
        });
      });

      const res = await fetch("/api/admin/scoring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: allScores }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save matrix scores.");
      }

      setSuccessNotice("All matrix option scores saved successfully!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scores.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading scoring matrix...</p>
      </div>
    );
  }

  // Get unique option keys across all questions (e.g. A, B, C, D, E)
  const optionKeysSet = new Set<string>();
  matrix.forEach((q) => q.options.forEach((opt) => optionKeysSet.add(opt.optionKey)));
  const optionKeys = Array.from(optionKeysSet).sort();

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Header with Single Save All Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Grid3X3 className="w-7 h-7 text-indigo-400" />
            Scoring Matrix View
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Edit score values across options freely and save all changes at once.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Matrix Scores</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Matrix Table */}
      <div className="glass-panel p-6 rounded-2xl border space-y-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 min-w-[280px]">Question</th>
                {optionKeys.map((key) => (
                  <th key={key} className="px-4 py-3 text-center min-w-[100px]">
                    Option {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {matrix.map((q) => (
                <tr key={q.questionId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 space-y-1">
                    <p className="font-bold text-white text-sm">
                      Q{q.displayOrder}. {q.questionText}
                    </p>
                  </td>

                  {optionKeys.map((key) => {
                    const opt = q.options.find((o) => o.optionKey === key);
                    if (!opt) {
                      return (
                        <td key={key} className="px-4 py-4 text-center text-slate-600">
                          —
                        </td>
                      );
                    }

                    return (
                      <td key={key} className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            value={opt.score}
                            onChange={(e) =>
                              handleScoreChange(
                                q.questionId,
                                opt.optionId,
                                Number(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-extrabold text-center text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Matrix Scores</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
