import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOptionSchema } from "@/lib/admin-validation";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = updateOptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const currentOpt = await prisma.answerOption.findUnique({ where: { id } });
    if (!currentOpt) {
      return NextResponse.json({ error: "Option not found." }, { status: 404 });
    }

    if (parsed.data.optionKey && parsed.data.optionKey !== currentOpt.optionKey) {
      const existing = await prisma.answerOption.findFirst({
        where: { questionId: currentOpt.questionId, optionKey: parsed.data.optionKey },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Option key '${parsed.data.optionKey}' already exists for this question.` },
          { status: 400 }
        );
      }
    }

    const option = await prisma.answerOption.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ option }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update option." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.answerOption.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete option." }, { status: 500 });
  }
}
