import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitAssessmentSchema } from "@/lib/validation";
import { calculateCumulativeScore } from "@/lib/scoring";
import { cryptoRandomString } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // 1. Validate payload structure with Zod
    const validationResult = submitAssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      const issueMessage = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { error: `Invalid submission payload: ${issueMessage}` },
        { status: 400 }
      );
    }

    const { answers, fullName, email, jobTitle, organisationName, researchArea } = validationResult.data;

    // 2. Fetch active questions & options with scores from DB
    const activeQuestions = await prisma.question.findMany({
      where: { active: true },
      include: {
        options: {
          where: { active: true },
        },
      },
    });

    if (activeQuestions.length === 0) {
      return NextResponse.json(
        { error: "No active assessment questions configured." },
        { status: 500 }
      );
    }

    if (answers.length !== activeQuestions.length) {
      return NextResponse.json(
        {
          error: `Expected ${activeQuestions.length} answers, but received ${answers.length}.`,
        },
        { status: 400 }
      );
    }

    const activeQuestionIds = new Set(activeQuestions.map((q) => q.id));
    const optionMap = new Map<string, { id: string; score: number; questionId: string }>();

    for (const q of activeQuestions) {
      for (const opt of q.options) {
        optionMap.set(opt.id, {
          id: opt.id,
          score: opt.score,
          questionId: q.id,
        });
      }
    }

    const processedQuestionIds = new Set<string>();
    const selectedOptionObjects: Array<{ id: string; score: number; questionId: string }> = [];

    for (const item of answers) {
      if (!activeQuestionIds.has(item.questionId)) {
        return NextResponse.json(
          { error: `Question ID '${item.questionId}' is invalid or inactive.` },
          { status: 400 }
        );
      }

      if (processedQuestionIds.has(item.questionId)) {
        return NextResponse.json(
          { error: `Duplicate answer submitted for question '${item.questionId}'.` },
          { status: 400 }
        );
      }
      processedQuestionIds.add(item.questionId);

      const optionInfo = optionMap.get(item.answerOptionId);
      if (!optionInfo || optionInfo.questionId !== item.questionId) {
        return NextResponse.json(
          {
            error: `Selected option '${item.answerOptionId}' does not belong to question '${item.questionId}'.`,
          },
          { status: 400 }
        );
      }

      selectedOptionObjects.push(optionInfo);
    }

    // 3. Fetch active ResultTypes
    const activeResultTypes = await prisma.resultType.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });

    // 4. Calculate cumulative score & match range using server scoring engine
    const scoreResult = calculateCumulativeScore(selectedOptionObjects, activeResultTypes);

    // 5. Persist submission in DB (storing scoreAtSubmission for audit history)
    const sessionToken = cryptoRandomString(24);

    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.assessmentSession.create({
        data: {
          sessionToken,
          status: "COMPLETED",
          completedAt: new Date(),
          finalScore: scoreResult.finalScore,
          fullName: fullName?.trim() || null,
          email: email?.trim() || null,
          jobTitle: jobTitle?.trim() || null,
          organisationName: organisationName?.trim() || null,
          researchArea: researchArea?.trim() || null,
        },
      });

      // Save AssessmentAnswers with scoreAtSubmission
      await Promise.all(
        selectedOptionObjects.map((opt) =>
          tx.assessmentAnswer.create({
            data: {
              sessionId: newSession.id,
              questionId: opt.questionId,
              answerOptionId: opt.id,
              scoreAtSubmission: opt.score, // Historical audit score!
            },
          })
        )
      );

      // Save AssessmentResult
      await tx.assessmentResult.create({
        data: {
          sessionId: newSession.id,
          resultTypeId: scoreResult.resultType.id,
          finalScore: scoreResult.finalScore,
        },
      });

      return newSession;
    });

    // Calculate max possible score dynamically
    const maxPossibleScore = activeQuestions.reduce((acc, q) => {
      const maxOptScore = Math.max(...q.options.map((o) => o.score), 0);
      return acc + maxOptScore;
    }, 0);

    return NextResponse.json(
      {
        sessionId: session.id,
        finalScore: scoreResult.finalScore,
        maxPossibleScore,
        result: {
          type: scoreResult.resultType.name,
          slug: scoreResult.resultType.slug,
          description: scoreResult.resultType.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
