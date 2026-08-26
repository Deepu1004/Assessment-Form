import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ADMIN_PASSWORD, ADMIN_COOKIE_NAME, ADMIN_TOKEN_SECRET } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (password !== DEFAULT_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: "Admin authenticated successfully." },
      { status: 200 }
    );

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: ADMIN_TOKEN_SECRET,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
