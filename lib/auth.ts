import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const ADMIN_TOKEN_SECRET = process.env.ADMIN_SECRET || "super-secret-admin-token-key";

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie || !cookie.value) return false;
  return cookie.value === ADMIN_TOKEN_SECRET;
}
