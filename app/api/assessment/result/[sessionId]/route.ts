import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        result: {
          include: {
            resultType: true,
          },
        },
      },
    });

    if (!session || !session.result) {
      return NextResponse.json(
        { error: "Assessment submission result not found." },
        { status: 404 }
      );
    }

    const activeQuestions = await prisma.question.findMany({
      where: { active: true },
      include: { options: { where: { active: true } } },
    });

    const maxPossibleScore = activeQuestions.reduce((acc, q) => {
      const maxOptScore = Math.max(...q.options.map((o) => o.score), 0);
      return acc + maxOptScore;
    }, 0);

    return NextResponse.json(
      {
        sessionId: session.id,
        completedAt: session.completedAt?.toISOString(),
        finalScore: session.finalScore ?? session.result.finalScore,
        maxPossibleScore: maxPossibleScore || 25,
        result: {
          type: session.result.resultType.name,
          slug: session.result.resultType.slug,
          description: session.result.resultType.description,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching assessment result:", error);
    return NextResponse.json(
      { error: "Failed to retrieve assessment result." },
      { status: 500 }
    );
  }
}
