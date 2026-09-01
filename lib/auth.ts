import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_TOKEN_SECRET = process.env.ADMIN_SECRET || "super-secret-admin-token-key";

interface AdminAccount {
  username: string;
  password: string;
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: "tnf-admin", password: "T&F-admin@12" },
  { username: "deepu04", password: "ItsmeDeepu@1" },
];

export function findAdminAccount(username: string, password: string): AdminAccount | null {
  return (
    ADMIN_ACCOUNTS.find((acc) => acc.username === username && acc.password === password) ?? null
  );
}

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie || !cookie.value) return false;
  return cookie.value === ADMIN_TOKEN_SECRET;
}
