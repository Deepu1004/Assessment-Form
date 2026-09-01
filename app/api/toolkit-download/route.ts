import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/toolkit-download - logs a toolkit PDF download event (public, fire-and-forget)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 100) : null;
    const resultSlug = typeof body.resultSlug === "string" ? body.resultSlug.slice(0, 100) : null;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId is required." }, { status: 400 });
    }

    await prisma.toolkitDownloadEvent.create({
      data: { visitorId, resultSlug },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error logging toolkit download:", error);
    return NextResponse.json({ error: "Failed to log download." }, { status: 500 });
  }
}
