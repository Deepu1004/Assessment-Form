import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ResultPageClient } from "./ResultPageClient";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sessionId } = await params;

  const session = await prisma.assessmentSession
    .findUnique({
      where: { id: sessionId },
      include: { result: { include: { resultType: true } } },
    })
    .catch(() => null);

  const personaName = session?.result?.resultType.name;
  const finalScore = session?.finalScore ?? session?.result?.finalScore ?? 0;

  const activeQuestions = await prisma.question
    .findMany({ where: { active: true }, include: { options: { where: { active: true } } } })
    .catch(() => []);
  const maxPossibleScore = activeQuestions.reduce((acc, q) => {
    return acc + Math.max(...q.options.map((o) => o.score), 0);
  }, 0);
  const displayScore = maxPossibleScore > 0 ? Math.round((finalScore / maxPossibleScore) * 100) : finalScore;

  const title = personaName
    ? `I'm a "${personaName}" — Research Integrity Challenge | Taylor & Francis`
    : "Research Integrity Challenge | Taylor & Francis";

  const description = personaName
    ? `I scored ${displayScore}/100 and got "${personaName}" on the Taylor & Francis Research Integrity Challenge. Take the quiz and see your own result!`
    : "Take the Research Integrity Challenge and discover your integrity personality profile.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <ResultPageClient sessionId={sessionId} />
    </div>
  );
}
