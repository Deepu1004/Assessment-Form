export interface PublicAnswerOptionDTO {
  id: string;
  optionKey: string;
  optionText: string;
}

export type AnswerOptionDTO = PublicAnswerOptionDTO;

export interface AdminAnswerOptionDTO extends PublicAnswerOptionDTO {
  score: number;
  displayOrder: number;
  active: boolean;
}

export interface PublicQuestionDTO {
  id: string;
  questionText: string;
  displayOrder: number;
  options: PublicAnswerOptionDTO[];
}

export type QuestionDTO = PublicQuestionDTO;

export interface AdminQuestionDTO {
  id: string;
  questionText: string;
  displayOrder: number;
  active: boolean;
  options: AdminAnswerOptionDTO[];
}

export interface ResultTypeDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  minimumScore: number;
  maximumScore: number;
  displayOrder: number;
  active: boolean;
}

export interface SubmissionAnswerInput {
  questionId: string;
  answerOptionId: string;
}

export interface SubmissionPayload {
  answers: SubmissionAnswerInput[];
}

export interface SubmissionResponse {
  sessionId: string;
  finalScore: number;
  maxPossibleScore: number;
  result: {
    type: string;
    slug: string;
    description: string;
  };
}

export interface AdminOverviewDTO {
  totalSubmissions: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  distribution: Array<{
    name: string;
    slug: string;
    count: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    sessionToken: string;
    completedAt: string;
    resultType: string;
    resultSlug: string;
    finalScore: number;
  }>;
}

export interface AdminSubmissionDetailDTO {
  sessionId: string;
  sessionToken: string;
  startedAt: string;
  completedAt: string;
  status: string;
  finalScore: number;
  result: {
    type: string;
    slug: string;
    description: string;
  } | null;
  answers: Array<{
    questionId: string;
    questionText: string;
    displayOrder: number;
    selectedOptionId: string;
    selectedOptionKey: string;
    selectedOptionText: string;
    scoreAtSubmission: number;
  }>;
}
