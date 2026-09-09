import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const result = await prisma.assessmentSession.deleteMany({
      where: {
        OR: [{ fullName: null }, { fullName: "" }],
      },
    });

    return NextResponse.json({ deleted: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error deleting anonymous sessions:", error);
    return NextResponse.json(
      { error: "Failed to delete anonymous participants." },
      { status: 500 }
    );
  }
}
