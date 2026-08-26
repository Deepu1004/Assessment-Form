"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ResultCard } from "@/components/ResultCard";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

interface ResultData {
  sessionId: string;
  completedAt: string;
  finalScore: number;
  maxPossibleScore: number;
  result: {
    type: string;
    slug: string;
    description: string;
  };
}

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/assessment/result/${sessionId}`);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Failed to load assessment result.");
        }
        const resultData = await res.json();
        setData(resultData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          Evaluating score & retrieving result...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Result Unavailable</h2>
        <p className="text-slate-400 text-sm">{error || "Could not locate submission."}</p>
        <Link
          href="/assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-16 max-w-4xl mx-auto w-full">
      <ResultCard
        result={data.result}
        finalScore={data.finalScore}
        maxPossibleScore={data.maxPossibleScore}
        sessionId={data.sessionId}
      />
    </div>
  );
}
