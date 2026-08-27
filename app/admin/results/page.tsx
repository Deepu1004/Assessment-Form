"use client";

import React, { useState, useEffect } from "react";
import { ResultTypeDTO } from "@/types/assessment";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function AdminResultsConfigPage() {
  const [results, setResults] = useState<ResultTypeDTO[]>([]);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({
    valid: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    minimumScore: number;
    maximumScore: number;
    displayOrder: number;
    active: boolean;
  }>({
    name: "",
    slug: "",
    description: "",
    minimumScore: 0,
    maximumScore: 0,
    displayOrder: 1,
    active: true,
  });

  const [isNew, setIsNew] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/results");
      if (!res.ok) throw new Error("Failed to fetch result types.");
      const data = await res.json();
      setResults(data.results);
      setValidation(data.validation || { valid: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      minimumScore: (results[results.length - 1]?.maximumScore || 0) + 1,
      maximumScore: (results[results.length - 1]?.maximumScore || 0) + 5,
      displayOrder: results.length + 1,
      active: true,
    });
  };

  const handleEdit = (rt: ResultTypeDTO) => {
    setIsNew(false);
    setEditingId(rt.id);
    setFormData({
      name: rt.name,
      slug: rt.slug,
      description: rt.description,
      minimumScore: rt.minimumScore,
      maximumScore: rt.maximumScore,
      displayOrder: rt.displayOrder,
      active: rt.active,
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      const endpoint = isNew ? "/api/admin/results" : `/api/admin/results/${editingId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save result type.");
      }

      setEditingId(null);
      setIsNew(false);
      await fetchResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result archetype?")) return;
    try {
      const res = await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete result type.");
      await fetchResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading result score ranges...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sliders className="w-7 h-7 text-[#004bbf]" />
            Result Type Score Ranges
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Configure outcome archetypes and non-overlapping cumulative score boundaries.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-[#004bbf] hover:bg-[#003993] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Result Range</span>
        </button>
      </div>

      {/* Range Overlap Validation Status Banner */}
      {!validation.valid ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Score Range Configuration Error:</span> {validation.error}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Score ranges are continuous, valid, and free of overlaps.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {(isNew || editingId) && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {isNew ? "Create New Result Range" : "Edit Result Range"}
            </h2>
            <button
              onClick={() => {
                setIsNew(false);
                setEditingId(null);
              }}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-700">Archetype Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="e.g. Analyst"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. analyst"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">Minimum Score (Inclusive)</label>
              <input
                type="number"
                value={formData.minimumScore}
                onChange={(e) =>
                  setFormData({ ...formData, minimumScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-emerald-700 font-bold font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">Maximum Score (Inclusive)</label>
              <input
                type="number"
                value={formData.maximumScore}
                onChange={(e) =>
                  setFormData({ ...formData, maximumScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-emerald-700 font-bold font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-700">Archetype Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description shown to the user on completion..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setIsNew(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Result Range</span>
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4">
        {results.map((rt) => (
          <div
            key={rt.id}
            className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900 uppercase">{rt.name}</h3>
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#004bbf] font-mono font-bold text-xs">
                  Score Range: {rt.minimumScore} – {rt.maximumScore} pts
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">{rt.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(rt)}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200"
              >
                <Edit2 className="w-4 h-4 text-slate-500" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(rt.id)}
                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
