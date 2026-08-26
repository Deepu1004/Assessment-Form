import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resultTypeSchema } from "@/lib/admin-validation";
import { validateResultRanges } from "@/lib/scoring";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = resultTypeSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const currentResult = await prisma.resultType.findUnique({ where: { id } });
    if (!currentResult) {
      return NextResponse.json({ error: "Result type not found." }, { status: 404 });
    }

    const updatedData = { ...currentResult, ...parsed.data };

    if (parsed.data.slug && parsed.data.slug !== currentResult.slug) {
      const existingSlug = await prisma.resultType.findUnique({
        where: { slug: parsed.data.slug },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: `Result type slug '${parsed.data.slug}' already exists.` },
          { status: 400 }
        );
      }
    }

    const allResults = await prisma.resultType.findMany();
    const candidateResults = allResults.map((r) => (r.id === id ? updatedData : r));

    const rangeCheck = validateResultRanges(candidateResults);
    if (!rangeCheck.valid) {
      return NextResponse.json({ error: rangeCheck.error }, { status: 400 });
    }

    const resultType = await prisma.resultType.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ resultType }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update result type." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.resultType.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete result type." }, { status: 500 });
  }
}
