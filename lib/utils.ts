import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cryptoRandomString(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatQuestionText(text: string): string {
  if (!text) return "";
  return text.replace(/^Theme\s*\d+:\s*(?:.*?[—\-]\s*)?/i, "").trim();
}

export function getOrCreateVisitorId(): string {
  const STORAGE_KEY = "tf_visitor_id";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : cryptoRandomString(24);

  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}

export function formatDateTimeIST(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " IST";
}

