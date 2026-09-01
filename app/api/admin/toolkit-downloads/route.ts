import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/toolkit-downloads - aggregate analytics for the toolkit PDF download button
export async function GET() {
  try {
    const totalDownloads = await prisma.toolkitDownloadEvent.count();

    const byVisitor = await prisma.toolkitDownloadEvent.groupBy({
      by: ["visitorId"],
      _count: { id: true },
    });

    const uniqueVisitors = byVisitor.length;
    const repeatVisitors = byVisitor.filter((v) => v._count.id > 1).length;

    const recentDownloads = await prisma.toolkitDownloadEvent.findMany({
      orderBy: { downloadedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(
      {
        totalDownloads,
        uniqueVisitors,
        repeatVisitors,
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
      { totalDownloads: 0, uniqueVisitors: 0, repeatVisitors: 0, recentDownloads: [] },
      { status: 200 }
    );
  }
}
