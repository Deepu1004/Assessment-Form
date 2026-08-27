"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  Grid3X3,
  Sliders,
  Wrench,
  LogOut,
  Sparkles,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Questions", href: "/admin/questions", icon: HelpCircle },
    { name: "Scoring Matrix", href: "/admin/scoring", icon: Grid3X3 },
    { name: "Results Config", href: "/admin/results", icon: Sliders },
    { name: "Assessment Builder", href: "/admin/builder", icon: Wrench },
  ];

  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/tf-logo.jpg"
            alt="Taylor & Francis"
            className="h-10 w-auto object-contain"
          />
          <div className="border-l border-slate-300 pl-3">
            <h1 className="font-bold text-slate-900 text-base leading-tight">
              Assessment Admin Studio
            </h1>
            <p className="text-[11px] text-[#004bbf] font-medium">Model A Single-Score Engine</p>
          </div>
        </div>

        {/* Tab links */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#004bbf] text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
