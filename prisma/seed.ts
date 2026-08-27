import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MongoDB seed for Single-Score Model A...");

  // Clean existing data
  await prisma.assessmentResult.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentSession.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.resultType.deleteMany();

  // 1. Seed Result Types with Score Ranges (Research Integrity Personalities)
  const resultTypesData = [
    {
      name: "Integrity Novice",
      slug: "integrity-novice",
      description: "Developing awareness of research ethics. You benefit from foundational guidance on AI tools, transparency, and data handling.",
      minimumScore: 5,
      maximumScore: 9,
      displayOrder: 1,
      active: true,
    },
    {
      name: "Pragmatic Researcher",
      slug: "pragmatic-researcher",
      description: "Result-focused with emerging integrity standards. Encouraged to prioritize deep validation, attribution, and formal reviewer conflict checks.",
      minimumScore: 10,
      maximumScore: 13,
      displayOrder: 2,
      active: true,
    },
    {
      name: "Conscientious Scholar",
      slug: "conscientious-scholar",
      description: "Strong commitment to transparent data reporting, fair authorship, and balanced public communication of research limitations.",
      minimumScore: 14,
      maximumScore: 17,
      displayOrder: 3,
      active: true,
    },
    {
      name: "Integrity Ambassador",
      slug: "integrity-ambassador",
      description: "Proactive advocate for research transparency, ethical AI usage, collaborative authorship agreements, and rigorous peer review.",
      minimumScore: 18,
      maximumScore: 21,
      displayOrder: 4,
      active: true,
    },
    {
      name: "Research Ethics Champion",
      slug: "research-ethics-champion",
      description: "Highest standard of research integrity. Role model in validating AI models, full data transparency, ethical peer review, and responsible science communication.",
      minimumScore: 22,
      maximumScore: 25,
      displayOrder: 5,
      active: true,
    },
  ];

  for (const rt of resultTypesData) {
    await prisma.resultType.create({ data: rt });
  }

  // 2. Seed Scenario-Based Questions & Options from Taylor & Francis Research Integrity Brief
  const questionsData = [
    {
      displayOrder: 1,
      questionText: "You are analyzing your research results using an AI tool. The tool produces a result that supports your hypothesis. What would you do?",
      options: [
        { optionKey: "A", optionText: "Use it - the results look reliable.", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Avoid AI altogether.", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Use it but mention that AI was involved.", score: 4, displayOrder: 3 },
        { optionKey: "D", optionText: "Validate the results, investigate how the tool works, and assess its limitations.", score: 5, displayOrder: 4 },
      ],
    },
    {
      displayOrder: 2,
      questionText: "While reviewing your dataset, you discover unexpected observations/outliers. Removing them would make your findings much clearer. What would you do?",
      options: [
        { optionKey: "A", optionText: "Remove them because they're probably anomalies.", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Keep them out of the main analysis, but mention them in the discussion if necessary.", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Ask a colleague whether they think the observations should be removed.", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Keep them, investigate why they're different, and ensure you transparently report how you handled them.", score: 5, displayOrder: 4 },
      ],
    },
    {
      displayOrder: 3,
      questionText: "You're preparing a manuscript. One senior researcher made an important contribution early in the project but has had little involvement since. Another researcher did substantial work analyzing data and drafting the manuscript. How would you approach authorship?",
      options: [
        { optionKey: "A", optionText: "Give the senior researcher first authorship because of their position.", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Let the most senior researcher decide.", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Include everyone who was involved in the project, regardless of contribution.", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Discuss authorship transparently based on contributions and agree responsibilities with the team.", score: 5, displayOrder: 4 },
      ],
    },
    {
      displayOrder: 4,
      questionText: "You've been invited to review a manuscript on a topic very close to your own unpublished research. You could potentially benefit from seeing their approach before publishing your own work. What would you do?",
      options: [
        { optionKey: "A", optionText: "Review it quickly and make sure you publish your own work first.", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Accept the review - it could help you understand the field better.", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Accept, but avoid using their ideas directly in your unpublished work.", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Consider the conflict of interest and, if appropriate, inform the editor first, rather than compromising the review process.", score: 5, displayOrder: 4 },
      ],
    },
    {
      displayOrder: 5,
      questionText: "Your research produced an exciting finding that could attract significant attention on social media. However, the study has limitations and could easily be misunderstood without context. What would you do?",
      options: [
        { optionKey: "A", optionText: "Share the most exciting finding first - the full paper contains the limitations.", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Share it but leave the interpretation to the audience.", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Avoid sharing the research publicly until someone else confirms it.", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Communicate the finding clearly while explaining the relevant limitations and context.", score: 5, displayOrder: 4 },
      ],
    },
  ];

  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        questionText: q.questionText,
        displayOrder: q.displayOrder,
        active: true,
      },
    });

    for (const opt of q.options) {
      await prisma.answerOption.create({
        data: {
          questionId: question.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          score: opt.score,
          displayOrder: opt.displayOrder,
          active: true,
        },
      });
    }
  }

  console.log("✅ Taylor & Francis Research Integrity seed completed successfully!");
  console.log(`- Created ${resultTypesData.length} Integrity Personalities (Scores 5..25)`);
  console.log(`- Created ${questionsData.length} Research Integrity Dilemma Scenarios`);
  console.log(`- Created ${questionsData.length} Questions with 5 Options each (Scores 1..5)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
