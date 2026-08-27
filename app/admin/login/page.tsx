"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl border border-slate-200 bg-white">
        <div className="text-center space-y-3">
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis"
            className="h-14 w-auto object-contain mx-auto"
          />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Studio Authentication</h1>
          <p className="text-xs text-slate-600">
            Enter the administrator password to access the Assessment Studio.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Admin Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#004bbf] focus:ring-1 focus:ring-[#004bbf] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-[#004bbf] hover:bg-[#003993] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate</span>
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center">
          Default password for testing: <code className="text-[#004bbf] font-mono font-bold">admin123</code>
        </div>
      </div>
    </div>
  );
}
