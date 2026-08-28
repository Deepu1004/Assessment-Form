import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalSubmissions = await prisma.assessmentSession.count({
      where: { status: "COMPLETED" },
    });

    const resultTypes = await prisma.resultType.findMany({
      orderBy: { displayOrder: "asc" },
    });

    const resultsGrouped = await prisma.assessmentResult.groupBy({
      by: ["resultTypeId"],
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    for (const item of resultsGrouped) {
      countMap.set(item.resultTypeId, item._count.id);
    }

    const distribution = resultTypes.map((rt) => ({
      name: rt.name,
      slug: rt.slug,
      count: countMap.get(rt.id) || 0,
    }));

    // Calculate score analytics (Avg, Min, Max)
    const scoreAggregate = await prisma.assessmentResult.aggregate({
      _avg: { finalScore: true },
      _min: { finalScore: true },
      _max: { finalScore: true },
    });

    const averageScore = scoreAggregate._avg.finalScore
      ? Math.round(scoreAggregate._avg.finalScore * 10) / 10
      : 0;
    const minScore = scoreAggregate._min.finalScore ?? 0;
    const maxScore = scoreAggregate._max.finalScore ?? 0;

    const recentSessions = await prisma.assessmentSession.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        result: {
          include: {
            resultType: true,
          },
        },
      },
    });

    const recentSubmissions = recentSessions.map((s) => ({
      id: s.id,
      sessionToken: s.sessionToken,
      fullName: s.fullName,
      email: s.email,
      jobTitle: s.jobTitle,
      organisationName: s.organisationName,
      researchArea: s.researchArea,
      completedAt: s.completedAt?.toISOString() || s.startedAt.toISOString(),
      resultType: s.result?.resultType.name || "Unknown",
      resultSlug: s.result?.resultType.slug || "unknown",
      finalScore: s.finalScore ?? s.result?.finalScore ?? 0,
    }));

    return NextResponse.json(
      {
        totalSubmissions,
        averageScore,
        minScore,
        maxScore,
        distribution,
        recentSubmissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return NextResponse.json(
      {
        totalSubmissions: 0,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        distribution: [],
        recentSubmissions: [],
        warning: "Database not connected or uninitialized. Set DATABASE_URL in environment variables."
      },
      { status: 200 }
    );
  }
}
