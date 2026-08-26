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

  // 1. Seed Result Types with Score Ranges
  const resultTypesData = [
    {
      name: "Explorer",
      slug: "explorer",
      description: "Curious, adaptable, and energized by discovering new possibilities.",
      minimumScore: 5,
      maximumScore: 9,
      displayOrder: 1,
      active: true,
    },
    {
      name: "Builder",
      slug: "builder",
      description: "Practical, creative, and focused on turning ideas into something real.",
      minimumScore: 10,
      maximumScore: 13,
      displayOrder: 2,
      active: true,
    },
    {
      name: "Analyst",
      slug: "analyst",
      description: "Logical, methodical, and driven by understanding evidence and systems.",
      minimumScore: 14,
      maximumScore: 17,
      displayOrder: 3,
      active: true,
    },
    {
      name: "Connector",
      slug: "connector",
      description: "Collaborative, empathetic, and focused on people and shared outcomes.",
      minimumScore: 18,
      maximumScore: 21,
      displayOrder: 4,
      active: true,
    },
    {
      name: "Leader",
      slug: "leader",
      description: "Decisive, goal-oriented, and comfortable taking ownership.",
      minimumScore: 22,
      maximumScore: 25,
      displayOrder: 5,
      active: true,
    },
  ];

  for (const rt of resultTypesData) {
    await prisma.resultType.create({ data: rt });
  }

  // 2. Seed Questions & Options with Single Scores
  const questionsData = [
    {
      displayOrder: 1,
      questionText: "When facing a new problem, what do you usually do first?",
      options: [
        { optionKey: "A", optionText: "Explore different possibilities", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Start building a solution", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Analyze the facts", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Ask people for perspectives", score: 4, displayOrder: 4 },
        { optionKey: "E", optionText: "Take charge and decide", score: 5, displayOrder: 5 },
      ],
    },
    {
      displayOrder: 2,
      questionText: "Which environment suits you best?",
      options: [
        { optionKey: "A", optionText: "A place with constant discovery", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "A place where you can create", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "A place with clear data and structure", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "A collaborative team", score: 4, displayOrder: 4 },
        { optionKey: "E", optionText: "A place where you can lead", score: 5, displayOrder: 5 },
      ],
    },
    {
      displayOrder: 3,
      questionText: "What motivates you most?",
      options: [
        { optionKey: "A", optionText: "Learning something new", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Making something useful", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Understanding how things work", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Helping people succeed", score: 4, displayOrder: 4 },
        { optionKey: "E", optionText: "Achieving a clear goal", score: 5, displayOrder: 5 },
      ],
    },
    {
      displayOrder: 4,
      questionText: "How do you usually make decisions?",
      options: [
        { optionKey: "A", optionText: "Try and learn", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Think about practical execution", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Compare evidence", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Discuss with others", score: 4, displayOrder: 4 },
        { optionKey: "E", optionText: "Choose a direction and act", score: 5, displayOrder: 5 },
      ],
    },
    {
      displayOrder: 5,
      questionText: "What would others most likely say about you?",
      options: [
        { optionKey: "A", optionText: "Curious", score: 1, displayOrder: 1 },
        { optionKey: "B", optionText: "Resourceful", score: 2, displayOrder: 2 },
        { optionKey: "C", optionText: "Logical", score: 3, displayOrder: 3 },
        { optionKey: "D", optionText: "Supportive", score: 4, displayOrder: 4 },
        { optionKey: "E", optionText: "Decisive", score: 5, displayOrder: 5 },
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

  console.log("✅ Model A seed completed successfully!");
  console.log(`- Created ${resultTypesData.length} Result Types (Ranges 5..25)`);
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
