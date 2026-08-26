import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        questionText: true,
        displayOrder: true,
        options: {
          where: { active: true },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            optionKey: true,
            optionText: true,
            // Do NOT expose option score to public API
          },
        },
      },
    });

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public assessment questions:", error);
    return NextResponse.json(
      { error: "Failed to load assessment questions." },
      { status: 500 }
    );
  }
}
