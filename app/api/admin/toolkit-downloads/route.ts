import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/toolkit-downloads - aggregate analytics for the toolkit PDF download button
export async function GET() {
  try {
    const totalDownloads = await prisma.toolkitDownloadEvent.count();

    // Unique downloaders are counted per completed response, so this can never exceed total responses.
    const events = await prisma.toolkitDownloadEvent.findMany({ select: { sessionId: true } });
    const perSession = new Map<string, number>();
    let unlinkedDownloads = 0;
    for (const e of events) {
      if (e.sessionId) perSession.set(e.sessionId, (perSession.get(e.sessionId) ?? 0) + 1);
      else unlinkedDownloads++;
    }
    const uniqueVisitors = perSession.size;
    const repeatVisitors = [...perSession.values()].filter((n) => n > 1).length;

    const recentDownloads = await prisma.toolkitDownloadEvent.findMany({
      orderBy: { downloadedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(
      {
        totalDownloads,
        uniqueVisitors,
        repeatVisitors,
        unlinkedDownloads,
        recentDownloads: recentDownloads.map((d) => ({
          id: d.id,
          visitorId: d.visitorId,
          resultSlug: d.resultSlug,
          downloadedAt: d.downloadedAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching toolkit download analytics:", error);
    return NextResponse.json(
      { totalDownloads: 0, uniqueVisitors: 0, repeatVisitors: 0, unlinkedDownloads: 0, recentDownloads: [] },
      { status: 200 }
    );
  }
}
