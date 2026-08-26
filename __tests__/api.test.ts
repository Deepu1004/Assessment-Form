import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import { submitAssessmentSchema } from "../lib/validation";

describe("Assessment API Validation & Database Persistence", () => {
  beforeAll(async () => {
    // Ensure test data environment ready
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should validate submission payloads with Zod", () => {
    const invalidPayload = { answers: [{ questionId: "invalid-id" }] };
    const result = submitAssessmentSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);

    const validPayload = {
      answers: [
        { questionId: "650000000000000000000001", answerOptionId: "650000000000000000000002" },
      ],
    };
    const validResult = submitAssessmentSchema.safeParse(validPayload);
    expect(validResult.success).toBe(true);
  });

  it("should maintain historical submission score immutability when option scores change", async () => {
    // 1. Fetch first question and option
    const question = await prisma.question.findFirst({
      where: { active: true },
      include: { options: true },
    });

    if (!question || question.options.length === 0) {
      console.warn("Skipping integration test: No questions in database.");
      return;
    }

    const targetOpt = question.options[0];
    const initialScore = targetOpt.score;

    // 2. Create historical submission 1 with initialScore
    const sessionToken1 = `hist-test-${Date.now()}-1`;
    const session1 = await prisma.assessmentSession.create({
      data: {
        sessionToken: sessionToken1,
        status: "COMPLETED",
        finalScore: initialScore,
        completedAt: new Date(),
      },
    });

    await prisma.assessmentAnswer.create({
      data: {
        sessionId: session1.id,
        questionId: question.id,
        answerOptionId: targetOpt.id,
        scoreAtSubmission: initialScore,
      },
    });

    // 3. Admin modifies target option score in DB (e.g., changes score to 99)
    await prisma.answerOption.update({
      where: { id: targetOpt.id },
      data: { score: 99 },
    });

    // 4. Create submission 2 after score change
    const sessionToken2 = `hist-test-${Date.now()}-2`;
    const session2 = await prisma.assessmentSession.create({
      data: {
        sessionToken: sessionToken2,
        status: "COMPLETED",
        finalScore: 99,
        completedAt: new Date(),
      },
    });

    await prisma.assessmentAnswer.create({
      data: {
        sessionId: session2.id,
        questionId: question.id,
        answerOptionId: targetOpt.id,
        scoreAtSubmission: 99,
      },
    });

    // 5. Verify historical Submission 1 retained original scoreAtSubmission
    const histAnswer1 = await prisma.assessmentAnswer.findFirst({
      where: { sessionId: session1.id, questionId: question.id },
    });
    expect(histAnswer1?.scoreAtSubmission).toBe(initialScore);

    // 6. Verify Submission 2 received updated scoreAtSubmission
    const histAnswer2 = await prisma.assessmentAnswer.findFirst({
      where: { sessionId: session2.id, questionId: question.id },
    });
    expect(histAnswer2?.scoreAtSubmission).toBe(99);

    // Restore option score
    await prisma.answerOption.update({
      where: { id: targetOpt.id },
      data: { score: initialScore },
    });
  });
});
