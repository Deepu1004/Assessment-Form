import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resultTypeSchema } from "@/lib/admin-validation";
import { validateResultRanges } from "@/lib/scoring";

// GET /api/admin/results
export async function GET() {
  try {
    const results = await prisma.resultType.findMany({
      orderBy: { displayOrder: "asc" },
    });

    const rangeValidation = validateResultRanges(results);

    return NextResponse.json(
      {
        results,
        validation: rangeValidation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch result types." }, { status: 500 });
  }
}

// POST /api/admin/results
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resultTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate slug
    const existingSlug = await prisma.resultType.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: `Result type slug '${data.slug}' already exists.` },
        { status: 400 }
      );
    }

    // Validate score ranges against existing result types
    const existingTypes = await prisma.resultType.findMany();
    const candidateTypes = [
      ...existingTypes,
      { name: data.name, minimumScore: data.minimumScore, maximumScore: data.maximumScore, active: data.active ?? true },
    ];

    const rangeCheck = validateResultRanges(candidateTypes);
    if (!rangeCheck.valid) {
      return NextResponse.json({ error: rangeCheck.error }, { status: 400 });
    }

    const lastResult = await prisma.resultType.findFirst({
      orderBy: { displayOrder: "desc" },
    });
    const order = data.displayOrder ?? (lastResult ? lastResult.displayOrder + 1 : 1);

    const resultType = await prisma.resultType.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        minimumScore: data.minimumScore,
        maximumScore: data.maximumScore,
        displayOrder: order,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ resultType }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create result type." }, { status: 500 });
  }
}
