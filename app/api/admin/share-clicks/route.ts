import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/share-clicks - aggregate analytics for the "share result" button/links
export async function GET() {
  try {
    const totalClicks = await prisma.shareClickEvent.count();

    const byVisitor = await prisma.shareClickEvent.groupBy({
      by: ["visitorId"],
      _count: { id: true },
    });

    const uniqueVisitors = byVisitor.length;
    const repeatVisitors = byVisitor.filter((v) => v._count.id > 1).length;

    const byMethod = await prisma.shareClickEvent.groupBy({
      by: ["method"],
      _count: { id: true },
    });

    const recentClicks = await prisma.shareClickEvent.findMany({
      orderBy: { clickedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(
      {
        totalClicks,
        uniqueVisitors,
        repeatVisitors,
        byMethod: byMethod.map((m) => ({ method: m.method, count: m._count.id })),
        recentClicks: recentClicks.map((c) => ({
          id: c.id,
          visitorId: c.visitorId,
          resultSlug: c.resultSlug,
          method: c.method,
          clickedAt: c.clickedAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching share click analytics:", error);
    return NextResponse.json(
      { totalClicks: 0, uniqueVisitors: 0, repeatVisitors: 0, byMethod: [], recentClicks: [] },
      { status: 200 }
    );
  }
}
