import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateScoreSchema } from "@/lib/admin-validation";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = updateScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const option = await prisma.answerOption.update({
      where: { id },
      data: { score: parsed.data.score },
    });

    return NextResponse.json({ option }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update option score." }, { status: 500 });
  }
}
