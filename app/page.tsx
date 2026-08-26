import Link from "next/link";
import { ArrowRight, Compass, Hammer, Brain, Users, Crown, Sparkles, Clock, ListOrdered, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const archetypes = [
    {
      name: "Explorer",
      desc: "Curious, adaptable, and energized by discovering possibilities.",
      icon: Compass,
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      name: "Builder",
      desc: "Practical, creative, focused on turning ideas into reality.",
      icon: Hammer,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "Analyst",
      desc: "Logical, methodical, driven by data and systems.",
      icon: Brain,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
    {
      name: "Connector",
      desc: "Collaborative, empathetic, focused on shared outcomes.",
      icon: Users,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      name: "Leader",
      desc: "Decisive, goal-oriented, comfortable taking ownership.",
      icon: Crown,
      color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 max-w-5xl mx-auto space-y-16">
      {/* Header Badge */}
      <div className="text-center space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Server-Evaluated Weighted Personality Blueprint</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          What Type of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Human Are You?</span>
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Answer five questions and discover the traits that best describe your approach to work, decisions, and collaboration.
        </p>

        {/* Assessment Stats Badge */}
        <div className="flex items-center justify-center gap-6 pt-2 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-indigo-400" />
            <span>5 questions</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>2 minutes</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Data-Persisted</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/assessment"
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 5 Archetypes Cards */}
      <div className="w-full space-y-6">
        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            5 Core Personality Archetypes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {archetypes.map((arch) => {
            const Icon = arch.icon;
            return (
              <div
                key={arch.name}
                className="glass-panel p-4 rounded-xl space-y-2.5 border transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${arch.color} border flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">{arch.name}</h3>
                <p className="text-xs text-slate-400 leading-snug">{arch.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Link Footer */}
      <div className="text-center pt-8 border-t border-slate-800/80 w-full text-xs text-slate-500">
        <Link
          href="/admin"
          className="hover:text-indigo-400 underline underline-offset-4 transition-colors"
        >
          Access Administrator Dashboard →
        </Link>
      </div>
    </div>
  );
}
