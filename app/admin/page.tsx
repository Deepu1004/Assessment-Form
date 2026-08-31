"use client";

import React, { useState, useEffect } from "react";
import { AdminOverviewDTO, AdminSubmissionDetailDTO } from "@/types/assessment";
import { formatDateTimeIST } from "@/lib/utils";
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
  Download,
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time single-score assessment responses and score metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh
          </button>
          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export to Excel
          </a>
          <Link
            href="/admin/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004bbf] hover:bg-[#003993] text-white text-sm font-bold shadow-md transition-all"
          >
            Open Assessment Builder
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
          <p>{error}</p>
        </div>
      ) : overview ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Responses
                </span>
                <Users className="w-4 h-4 text-[#004bbf]" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{overview.totalSubmissions}</p>
              <p className="text-xs text-slate-500">Persisted in MongoDB</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Average Score
                </span>
                <Calculator className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{overview.averageScore}</p>
              <p className="text-xs text-slate-500">Cumulative average score</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Score Range
                </span>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {overview.minScore} - {overview.maxScore} pts
              </p>
              <p className="text-xs text-slate-500">Min to Max score</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Top Result
                </span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-[#004bbf] uppercase truncate">
                {[...overview.distribution].sort((a, b) => b.count - a.count)[0]?.name || "N/A"}
              </p>
              <p className="text-xs text-slate-500">Highest frequency archetype</p>
            </div>
          </div>

          {/* Recent Submissions & Participant Directory - TOP PRIORITY */}
          <div className="glass-panel p-6 rounded-2xl space-y-6 overflow-hidden bg-white border border-slate-200 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#004bbf]" />
                Participant Submissions & Collected Data
              </h2>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#004bbf] font-bold text-xs">
                Primary Records
              </span>
            </div>

            {overview.recentSubmissions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No submissions recorded yet. Take the assessment to test persistence!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Participant</th>
                      <th className="px-4 py-3">Role & Organisation</th>
                      <th className="px-4 py-3">Research Area</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Completed</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {overview.recentSubmissions.map((sub) => {
                      const isSelected = selectedSessionId === sub.id;

                      return (
                        <React.Fragment key={sub.id}>
                          <tr className={`transition-colors ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"}`}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">
                                {sub.fullName || "Anonymous Participant"}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                {sub.email || `Session: ${sub.sessionToken.substring(0, 10)}...`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <div className="font-medium text-slate-800">{sub.jobTitle || "—"}</div>
                              <div className="text-slate-500">{sub.organisationName || "—"}</div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {sub.researchArea ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  {sub.researchArea}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-[#004bbf] uppercase text-xs">
                              {sub.resultType}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                              {sub.finalScore} pts
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {formatDateTimeIST(sub.completedAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSessionId(null);
                                  } else {
                                    handleOpenDetail(sub.id);
                                  }
                                }}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                  isSelected
                                    ? "bg-[#004bbf] text-white border-[#004bbf]"
                                    : "bg-slate-100 text-[#004bbf] hover:bg-[#004bbf] hover:text-white border-slate-200"
                                }`}
                              >
                                <span>{isSelected ? "Close" : "Inspect"}</span>
                                {isSelected ? <X className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                              </button>
                            </td>
                          </tr>

                          {/* Inline Detail Card (Non-popup) */}
                          {isSelected && (
                            <tr>
                              <td colSpan={7} className="px-4 py-4 bg-slate-50/90 border-b border-slate-200">
                                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 text-left">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                      <span className="text-[11px] font-mono text-[#004bbf] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                        Session ID: {sub.id}
                                      </span>
                                      <h3 className="text-base font-bold text-slate-900 mt-2">
                                        Detailed Answer Breakdown
                                      </h3>
                                    </div>
                                    <button
                                      onClick={() => setSelectedSessionId(null)}
                                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Close
                                    </button>
                                  </div>

                                  {/* Detailed Participant Box */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-700">
                                    <div>
                                      <span className="font-bold text-slate-500 block">Participant:</span>
                                      <span className="font-semibold text-slate-900">{detailData?.fullName || sub.fullName || "N/A"}</span>
                                      <span className="block text-slate-500">{detailData?.email || sub.email || "No email"}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-500 block">Role & Organisation:</span>
                                      <span className="font-semibold text-slate-900">{detailData?.jobTitle || sub.jobTitle || "N/A"}</span>
                                      <span className="block text-slate-500">{detailData?.organisationName || sub.organisationName || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-500 block">Research Area:</span>
                                      <span className="font-semibold text-[#004bbf]">{detailData?.researchArea || sub.researchArea || "N/A"}</span>
                                    </div>
                                  </div>

                                  {loadingDetail || !detailData ? (
                                    <div className="py-6 text-center space-y-2">
                                      <Loader2 className="w-6 h-6 text-[#004bbf] animate-spin mx-auto" />
                                      <p className="text-slate-500 text-xs">Loading answers breakdown...</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span>Questions & Selected Options</span>
                                        <span className="text-emerald-700">Total Score: {detailData.finalScore} pts</span>
                                      </div>
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {detailData.answers.map((ans) => (
                                          <div
                                            key={ans.questionId}
                                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-4"
                                          >
                                            <div className="space-y-0.5">
                                              <p className="font-bold text-slate-900">
                                                Q{ans.displayOrder}. {ans.questionText}
                                              </p>
                                              <p className="text-[#004bbf] font-medium">
                                                Selected Option {ans.selectedOptionKey}: {ans.selectedOptionText}
                                              </p>
                                            </div>

                                            <div className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs shrink-0">
                                              +{ans.scoreAtSubmission} pts
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Distribution */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6 bg-white border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#004bbf]" />
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
                      <span className="text-slate-800">{item.name}</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {item.count} responses ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="h-full bg-[#004bbf] rounded-full transition-all duration-500"
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
