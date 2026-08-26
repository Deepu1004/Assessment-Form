import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        options: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    const matrix = questions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      displayOrder: q.displayOrder,
      options: q.options.map((opt) => ({
        optionId: opt.id,
        optionKey: opt.optionKey,
        optionText: opt.optionText,
        score: opt.score,
        displayOrder: opt.displayOrder,
      })),
    }));

    return NextResponse.json({ matrix }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch scoring matrix." }, { status: 500 });
  }
}

const bulkScoreSchema = z.object({
  scores: z.array(
    z.object({
      optionId: z.string().min(1),
      score: z.number().int("Score must be an integer"),
    })
  ),
});

// PUT /api/admin/scoring - Bulk update option scores at once
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = bulkScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { scores } = parsed.data;

    await Promise.all(
      scores.map((item) =>
        prisma.answerOption.update({
          where: { id: item.optionId },
          data: { score: item.score },
        })
      )
    );

    return NextResponse.json(
      { success: true, message: `Successfully updated ${scores.length} option scores.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk score update error:", error);
    return NextResponse.json({ error: "Failed to update matrix scores." }, { status: 500 });
  }
}
