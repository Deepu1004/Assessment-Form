import type { Metadata } from "next";
import { Open_Sans, Aleo } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-open-sans",
});

const aleo = Aleo({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-aleo",
});

export const metadata: Metadata = {
  title: "Research Integrity Challenge | Taylor & Francis",
  description:
    "Take the Research Integrity Challenge and discover your integrity personality profile.",
  icons: {
    icon: "/tf-favicon.webp",
    shortcut: "/tf-favicon.webp",
    apple: "/tf-favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} ${aleo.variable}`}>
      <body className="antialiased bg-[#eef3f9] text-slate-900 min-h-screen flex flex-col selection:bg-[#004bbf] selection:text-white relative font-sans text-left">
        {/* Soft light background container */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#f8fafc] via-[#edf2f8] to-[#e2e8f0]" />

        {/* Content container */}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
