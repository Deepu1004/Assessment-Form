import Link from "next/link";
import { ArrowRight, Compass, Hammer, Brain, Users, Crown, Sparkles, Clock, ListOrdered, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
      {/* Expanded Form Container */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[580px] sm:min-h-[640px] p-6 sm:p-10 lg:p-12 text-center justify-between transition-all">
        {/* Taylor & Francis by Informa Brand Logo */}
        <div className="pt-2 sm:pt-4 flex flex-col items-center">
          {/* Official Logo Image */}
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis by Informa"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </div>

        {/* Content Body */}
        <div className="my-auto space-y-5 py-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-snug">
            Take the Research Integrity Challenge
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto px-2">
            Complete the quiz, get your score, and download the Taylor & Francis Research Integrity Toolkit — with practical resources to support responsible research.
          </p>

          <p className="text-xs sm:text-sm text-slate-500 italic max-w-lg mx-auto px-4 leading-normal">
            By submitting this form, you agree to receive relevant communications from Taylor & Francis.
          </p>
        </div>

        {/* CTA & Time Estimation */}
        <div className="pb-2 sm:pb-4 space-y-3 flex flex-col items-center">
          <Link
            href="/assessment"
            className="w-36 sm:w-44 py-3 bg-[#004bbf] hover:bg-[#003993] active:scale-95 text-white font-bold text-sm sm:text-base rounded-lg shadow-md transition-all text-center"
          >
            Start
          </Link>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Takes 2 minutes</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Access Footer */}
      <div className="text-center mt-6 text-xs text-slate-500">
        <Link
          href="/admin"
          className="hover:text-[#004bbf] font-medium underline underline-offset-4 transition-colors"
        >
          Access Administrator Dashboard →
        </Link>
      </div>
    </div>
  );
}
