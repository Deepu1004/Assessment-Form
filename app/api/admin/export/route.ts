import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils";

// GET /api/admin/export - exports all completed submissions as an Excel file
export async function GET() {
  try {
    const sessions = await prisma.assessmentSession.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: {
        result: { include: { resultType: true } },
      },
    });

    const rows = sessions.map((s) => ({
      "Full Name": s.fullName || "",
      Email: s.email || "",
      "Job Title": s.jobTitle || "",
      Organisation: s.organisationName || "",
      "Research Area": s.researchArea || "",
      "Result Type": s.result?.resultType.name || "",
      "Final Score": s.finalScore ?? s.result?.finalScore ?? 0,
      "Started At": formatDateTimeIST(s.startedAt),
      "Completed At": s.completedAt ? formatDateTimeIST(s.completedAt) : "",
      "Session Token": s.sessionToken,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="research-integrity-submissions-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting submissions:", error);
    return NextResponse.json({ error: "Failed to export submissions." }, { status: 500 });
  }
}
