"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Facebook, Linkedin, Twitter, MessageCircle, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { getOrCreateVisitorId } from "@/lib/utils";

interface ResultCardProps {
  result: {
    type: string;
    slug: string;
    description: string;
  };
  finalScore: number;
  maxPossibleScore: number;
  sessionId: string;
}

export function ResultCard({
  result,
  finalScore,
  sessionId,
}: ResultCardProps) {
  const [isOwnResult, setIsOwnResult] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOwnResult(window.localStorage.getItem(`own-result:${sessionId}`) === "1");
  }, [sessionId]);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/result/${sessionId}` : "";
  const shareText = `I got "${result.type}" on the Taylor & Francis Research Integrity Challenge! Take the quiz and see your own result:`;
  const whatsappText = shareText + " " + shareUrl;

  const handleDownloadClick = () => {
    fetch("/api/toolkit-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId(), resultSlug: result.slug }),
    }).catch(() => {});
    // Intentionally not preventing default: the browser's native download proceeds
    // in parallel with this fire-and-forget analytics call.
  };

  const handleNativeShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const { toBlob } = await import("html-to-image");
      const blob = shareCardRef.current
        ? await toBlob(shareCardRef.current, { pixelRatio: 2, cacheBust: true })
        : null;
      const file = blob ? new File([blob], "research-integrity-result.png", { type: "image/png" }) : null;

      // Note: browsers reject navigator.share() calls that combine `files` with `url` —
      // when sharing a file we fold the link into `text` instead.
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Research Integrity Challenge",
          text: whatsappText,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Research Integrity Challenge",
          text: shareText,
          url: shareUrl,
        });
      } else if (file) {
        // Desktop fallback: download the snapshot image so it can be attached manually.
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        link.click();
        await navigator.clipboard?.writeText(whatsappText);
      } else {
        await navigator.clipboard?.writeText(whatsappText);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const shareLinks = [
    {
      name: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
      {/* Expanded Result Container */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[580px] sm:min-h-[640px] p-6 sm:p-10 lg:p-12 text-center justify-between transition-all">
        
        {/* Header Logo */}
        <div className="pt-2 flex flex-col items-center">
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis"
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Result Header & Score */}
        <div className="my-auto space-y-6 sm:space-y-8 py-4">
          <div className="space-y-2">
            <h1 className="text-base sm:text-xl font-normal text-slate-700">
              Your Integrity Personality
            </h1>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight">
              {result.type}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-normal text-slate-500">
              Research Integrity Score
            </h2>
            <div className="text-xl sm:text-2xl font-bold text-slate-700 tracking-tight">
              {finalScore * 2} / 50
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto px-4">
            Your responses reveal how you approach integrity when faced with real-world research dilemmas.
          </p>
        </div>

        {/* Bottom CTA matching image 3 */}
        <div className="pb-2 sm:pb-4 flex flex-col items-center space-y-4">
          <a
            href="https://newsroom.taylorandfrancisgroup.com/taylor-francis-launches-free-research-integrity-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md py-3.5 bg-[#004bbf] hover:bg-[#003993] active:scale-95 text-white font-bold text-sm sm:text-base rounded-lg shadow-md transition-all text-center"
          >
            Explore Resources
          </a>

          <a
            href="/Research-integrity-A-toolkit-for-early-career-researchers.pdf"
            download
            onClick={handleDownloadClick}
            className="w-full max-w-md py-3 px-4 border border-[#004bbf] text-[#004bbf] hover:bg-blue-50 active:scale-95 font-bold text-sm sm:text-base rounded-lg transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Download Toolkit (PDF)</span>
              <span className="hidden sm:inline">Download Research Integrity Toolkit (PDF)</span>
            </span>
          </a>

          <div className="w-full max-w-md space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Share your result
            </p>

            <button
              type="button"
              onClick={handleNativeShare}
              disabled={sharing}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm sm:text-base rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 whitespace-nowrap"
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">
                {sharing ? (
                  "Preparing..."
                ) : (
                  <>
                    <span className="sm:hidden">Share Result</span>
                    <span className="hidden sm:inline">Share with image &amp; text</span>
                  </>
                )}
              </span>
            </button>

            <div className="flex items-center justify-center gap-3 pt-1">
              {shareLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${link.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#004bbf] hover:text-white transition-colors border border-slate-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/assessment" className="hover:text-slate-600 underline">
              {isOwnResult ? "Retake Quiz" : "Try it yourself"}
            </Link>
          </div>
        </div>
      </div>

      {/* Off-screen snapshot card used to generate the shareable image */}
      <div
        ref={shareCardRef}
        className="fixed -left-[9999px] top-0 w-[400px] bg-white flex flex-col items-center text-center p-10 gap-6"
      >
        <img src="/tf-logo.jpg" alt="Taylor & Francis" className="h-14 w-auto object-contain" />
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Your Integrity Personality</p>
          <p className="text-3xl font-serif font-bold text-slate-900">{result.type}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Research Integrity Score</p>
          <p className="text-2xl font-bold text-slate-700">{finalScore * 2} / 50</p>
        </div>
        <p className="text-xs text-slate-400 pt-2">
          Take the Research Integrity Challenge at taylorandfrancis.com
        </p>
      </div>
    </div>
  );
}
