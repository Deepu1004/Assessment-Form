import { z } from "zod";

export const answerSubmissionSchema = z.object({
  questionId: z.string({
    required_error: "questionId is required",
  }).min(1, "questionId cannot be empty"),
  answerOptionId: z.string({
    required_error: "answerOptionId is required",
  }).min(1, "answerOptionId cannot be empty"),
});

export const submitAssessmentSchema = z.object({
  answers: z
    .array(answerSubmissionSchema, {
      required_error: "answers must be an array",
    })
    .min(1, "answers array cannot be empty"),
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(1, "Full name is required"),
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email("A valid email address is required"),
  jobTitle: z
    .string({ required_error: "Job title is required" })
    .trim()
    .min(1, "Job title is required"),
  organisationName: z
    .string({ required_error: "Organisation name is required" })
    .trim()
    .min(1, "Organisation name is required"),
  researchArea: z
    .string({ required_error: "Research area is required" })
    .trim()
    .min(1, "Research area is required"),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
