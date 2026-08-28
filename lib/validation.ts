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
  fullName: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  jobTitle: z.string().optional(),
  organisationName: z.string().optional(),
  researchArea: z.string().optional(),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
