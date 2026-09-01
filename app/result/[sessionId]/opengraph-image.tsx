import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Research Integrity Challenge Result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.assessmentSession
    .findUnique({
      where: { id: sessionId },
      include: { result: { include: { resultType: true } } },
    })
    .catch(() => null);

  const personaName = session?.result?.resultType.name ?? "Research Integrity Challenge";
  const finalScore = session?.finalScore ?? session?.result?.finalScore ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eef3f9",
          backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: 32,
            padding: "64px 96px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontSize: 28, color: "#004bbf", fontWeight: 700, letterSpacing: 2 }}>
            TAYLOR &amp; FRANCIS
          </div>
          <div style={{ fontSize: 24, color: "#64748b", marginTop: 24, display: "flex" }}>
            Your Integrity Personality
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#0f172a",
              marginTop: 8,
              display: "flex",
              maxWidth: 900,
              textAlign: "center",
            }}
          >
            {personaName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginTop: 40,
              padding: "16px 40px",
              backgroundColor: "#eef3f9",
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: "#004bbf", display: "flex" }}>
              {finalScore}
            </div>
            <div style={{ fontSize: 28, color: "#64748b", display: "flex" }}>/ 50 Score</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
