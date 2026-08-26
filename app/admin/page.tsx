"use client";

import React, { useState, useEffect } from "react";
import { AdminOverviewDTO, AdminSubmissionDetailDTO } from "@/types/assessment";
import {
  Users,
  Trophy,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  BarChart3,
  Calculator,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardOverviewPage() {
  const [overview, setOverview] = useState<AdminOverviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AdminSubmissionDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("Failed to load admin overview metrics.");
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenDetail = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/admin/submission/${sessionId}`);
      if (!res.ok) throw new Error("Failed to load submission details.");
      const data = await res.json();
      setDetailData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          Loading analytics overview...
        </p>
      </div>
    );
  }

  const maxDistributionCount = overview
    ? Math.max(...overview.distribution.map((d) => d.count), 1)
    : 1;

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time single-score assessment responses and score metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-md hover:opacity-90 transition-all"
          >
            Open Assessment Builder
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
          <p>{error}</p>
        </div>
      ) : overview ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Responses
                </span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{overview.totalSubmissions}</p>
              <p className="text-xs text-slate-500">Persisted in MongoDB</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Average Score
                </span>
                <Calculator className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">{overview.averageScore}</p>
              <p className="text-xs text-slate-500">Cumulative average score</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Score Range
                </span>
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {overview.minScore} - {overview.maxScore} pts
              </p>
              <p className="text-xs text-slate-500">Min to Max score</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top Result
                </span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-indigo-300 uppercase truncate">
                {[...overview.distribution].sort((a, b) => b.count - a.count)[0]?.name || "N/A"}
              </p>
              <p className="text-xs text-slate-500">Highest frequency archetype</p>
            </div>
          </div>

          {/* Distribution */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Result Frequency Distribution
            </h2>

            <div className="space-y-4">
              {overview.distribution.map((item) => {
                const percentage = overview.totalSubmissions > 0
                  ? Math.round((item.count / overview.totalSubmissions) * 100)
                  : 0;

                const fillPercentage = Math.round((item.count / maxDistributionCount) * 100);

                return (
                  <div key={item.slug} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-200">{item.name}</span>
                      <span className="text-slate-400 font-mono text-xs">
                        {item.count} responses ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="glass-panel p-6 rounded-2xl space-y-6 overflow-hidden">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Recent Submissions
            </h2>

            {overview.recentSubmissions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                No submissions recorded yet. Take the assessment to test persistence!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Session Token</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Final Score</th>
                      <th className="px-4 py-3">Completed At</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {overview.recentSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-300">
                          {sub.sessionToken.substring(0, 16)}...
                        </td>
                        <td className="px-4 py-3 font-bold text-white uppercase">
                          {sub.resultType}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {sub.finalScore} pts
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(sub.completedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenDetail(sub.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Submission Detail Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 space-y-6 relative border shadow-2xl">
            <button
              onClick={() => setSelectedSessionId(null)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetail || !detailData ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Loading historical session log...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Session ID: {detailData.sessionId}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-2">
                    Submission Inspection Log
                  </h2>
                  <p className="text-xs text-slate-400">
                    Completed: {new Date(detailData.completedAt).toLocaleString()}
                  </p>
                </div>

                {/* Score Summary Box */}
                {detailData.result && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-400">
                        Result Outcome
                      </span>
                      <h3 className="text-2xl font-extrabold text-white uppercase">
                        {detailData.result.type}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-sm">{detailData.result.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-slate-400">
                        Final Score
                      </span>
                      <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {detailData.finalScore}
                      </p>
                    </div>
                  </div>
                )}

                {/* Question Answers Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Answers & Historical Scores
                  </h4>
                  <div className="space-y-2.5">
                    {detailData.answers.map((ans) => (
                      <div
                        key={ans.questionId}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200">
                            Q{ans.displayOrder}. {ans.questionText}
                          </p>
                          <p className="text-indigo-300 font-medium">
                            Option {ans.selectedOptionKey}: {ans.selectedOptionText}
                          </p>
                        </div>

                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs shrink-0">
                          Score: {ans.scoreAtSubmission}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
