import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOptionSchema } from "@/lib/admin-validation";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = createOptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { optionKey, optionText, score, displayOrder, active } = parsed.data;

    const existing = await prisma.answerOption.findFirst({
      where: { questionId, optionKey },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Option key '${optionKey}' already exists for this question.` },
        { status: 400 }
      );
    }

    const lastOpt = await prisma.answerOption.findFirst({
      where: { questionId },
      orderBy: { displayOrder: "desc" },
    });
    const order = displayOrder ?? (lastOpt ? lastOpt.displayOrder + 1 : 1);

    const option = await prisma.answerOption.create({
      data: {
        questionId,
        optionKey,
        optionText,
        score,
        displayOrder: order,
        active: active ?? true,
      },
    });

    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add option." }, { status: 500 });
  }
}
