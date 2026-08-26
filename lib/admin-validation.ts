import { z } from "zod";

export const optionInputSchema = z.object({
  optionKey: z.string().min(1, "Option key is required"),
  optionText: z.string().min(1, "Option text is required"),
  score: z.number().int("Score must be an integer"),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const createQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text cannot be empty"),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
  options: z.array(optionInputSchema).optional(),
});

export const updateQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text cannot be empty").optional(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const createOptionSchema = optionInputSchema;

export const updateOptionSchema = z.object({
  optionKey: z.string().min(1).optional(),
  optionText: z.string().min(1).optional(),
  score: z.number().int().optional(),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const updateScoreSchema = z.object({
  score: z.number().int("Score must be an integer"),
});

export const resultTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  minimumScore: z.number().int("Minimum score must be an integer"),
  maximumScore: z.number().int("Maximum score must be an integer"),
  displayOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});
