export interface PersonalityType {
  name: string;
  description: string;
}

const PERSONALITY_TYPES: Array<{ min: number; max: number } & PersonalityType> = [
  {
    min: 10,
    max: 18,
    name: "Integrity Explorer",
    description:
      "You're beginning to explore research integrity and build awareness of good practices. Way to go!",
  },
  {
    min: 20,
    max: 26,
    name: "Pragmatic Researcher",
    description:
      "You tend to pause, consider your choices, and think about responsible research practices. Way to go!",
  },
  {
    min: 28,
    max: 34,
    name: "Responsible Researcher",
    description:
      "Integrity and responsible decision-making are clearly part of how you approach research. Way to go!",
  },
  {
    min: 36,
    max: 42,
    name: "Integrity-Minded Researcher",
    description: "You show a strong awareness of integrity considerations in research.",
  },
  {
    min: 44,
    max: 50,
    name: "Integrity-Focused Pro",
    description:
      "You demonstrate consistently strong awareness of responsible research practices.",
  },
];

export function getPersonalityByScore(score: number): PersonalityType {
  const match = PERSONALITY_TYPES.find((p) => score >= p.min && score <= p.max);
  return match ?? PERSONALITY_TYPES[PERSONALITY_TYPES.length - 1];
}
