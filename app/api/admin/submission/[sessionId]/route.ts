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
        answers: {
          include: {
            question: true,
            answerOption: true,
          },
          orderBy: {
            question: {
              displayOrder: "asc",
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Submission session not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        sessionToken: session.sessionToken,
        fullName: session.fullName,
        email: session.email,
        jobTitle: session.jobTitle,
        organisationName: session.organisationName,
        researchArea: session.researchArea,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() || null,
        status: session.status,
        finalScore: session.finalScore ?? session.result?.finalScore ?? 0,
        result: session.result
          ? {
              type: session.result.resultType.name,
              slug: session.result.resultType.slug,
              description: session.result.resultType.description,
            }
          : null,
        answers: session.answers.map((a) => ({
          questionId: a.question.id,
          questionText: a.question.questionText,
          displayOrder: a.question.displayOrder,
          selectedOptionId: a.answerOption.id,
          selectedOptionKey: a.answerOption.optionKey,
          selectedOptionText: a.answerOption.optionText,
          scoreAtSubmission: a.scoreAtSubmission,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return NextResponse.json(
      { error: "Failed to load submission details." },
      { status: 500 }
    );
  }
}
