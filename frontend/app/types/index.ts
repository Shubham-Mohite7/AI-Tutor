export type Language = "en" | "hi";

export interface QuizQuestion {
  type: "mcq" | "tf";
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface LearnResponse {
  topic: string;
  language: string;
  explanation: string;
  questions: QuizQuestion[];
  total_reasoning_tokens: number;
}

export interface QuestionResult {
  question_number: number;
  question: string;
  is_correct: boolean;
  user_answer: string | null;
  correct_answer: string;
  explanation: string;
}

export interface ScoreResponse {
  score: number;
  total: number;
  percentage: number;
  grade: string;
  results: QuestionResult[];
}

export type AppStep = "input" | "loading" | "quiz" | "results";

export interface LearnState {
  step: AppStep;
  topic: string;
  language: Language;
  explanation: string;
  questions: QuizQuestion[];
  answers: (string | null)[];
  scoreResponse: ScoreResponse | null;
  reasoningTokens: number;
  error: string | null;
}
