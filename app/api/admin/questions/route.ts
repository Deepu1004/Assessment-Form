import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createQuestionSchema } from "@/lib/admin-validation";

// GET /api/admin/questions - List all questions with options and scores
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
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { questions: [], warning: "Database connection unavailable. Set DATABASE_URL in Vercel settings." },
      { status: 200 }
    );
  }
}

// POST /api/admin/questions - Create a new question with optional options
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { questionText, displayOrder, active, options } = parsed.data;

    // Calculate max displayOrder if not provided
    const lastQuestion = await prisma.question.findFirst({
      orderBy: { displayOrder: "desc" },
    });
    const order = displayOrder ?? (lastQuestion ? lastQuestion.displayOrder + 1 : 1);

    const question = await prisma.question.create({
      data: {
        questionText,
        displayOrder: order,
        active: active ?? true,
        options: options
          ? {
              create: options.map((opt, idx) => ({
                optionKey: opt.optionKey,
                optionText: opt.optionText,
                score: opt.score,
                displayOrder: opt.displayOrder ?? idx + 1,
                active: opt.active ?? true,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create question." }, { status: 500 });
  }
}
