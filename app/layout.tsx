import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Personality Blueprint | Weighted Personality Assessment",
  description:
    "Discover your dominant personality archetype through our data-driven, weighted assessment engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased bg-[#eef3f9] text-slate-900 min-h-screen flex flex-col selection:bg-[#004bbf] selection:text-white relative">
        {/* Soft light background container */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#f8fafc] via-[#edf2f8] to-[#e2e8f0]" />

        {/* Content container */}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
