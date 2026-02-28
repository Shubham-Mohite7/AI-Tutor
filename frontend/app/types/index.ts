// types/index.ts

export type Language = "en" | "hi";

export interface QuizQuestion {
  question: string;
  options: string[];          // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correct_answer: string;
  explanation: string;
  difficulty: number;         // 1-10
}

export interface LearnResponse {
  topic: string;
  explanation: string;
  quiz: QuizQuestion[];
}

export interface LearnState {
  step: "input" | "loading" | "quiz" | "results";
  topic: string;
  language: Language;
  explanation: string;
  questions: QuizQuestion[];
  answers: (string | null)[];
  scoreResponse: ScoreResponse | null;
  reasoningTokens: number;
  error: string | null;
}

export interface ScoreRequest {
  quiz: QuizQuestion[];
  answers: (string | null)[];
}

export interface ScoreResult {
  question: string;
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface ScoreResponse {
  score: number;
  total: number;
  percentage: number;
  results: ScoreResult[];
}

// ── Adaptive Quiz ──────────────────────────────────────────────────────────────

export interface AdaptiveQuestionRequest {
  topic: string;
  explanation: string;
  last_question: QuizQuestion;
  was_correct: boolean;
  language?: string;
}

export interface AdaptiveQuestionResponse {
  question: QuizQuestion;
  difficulty_change: "harder" | "easier" | "same";
  new_difficulty: number;
}

// ── True/False Swipe Cards ──────────────────────────────────────────────────────

export interface TrueOrFalseStatement {
  id: number;
  statement: string;
  is_true: boolean;
  explanation: string;
}

export interface TrueOrFalseRequest {
  topic: string;
  explanation: string;
  language?: Language;
}

export interface TrueOrFalseResponse {
  topic: string;
  statements: TrueOrFalseStatement[];
}

export type AdaptiveQuizMode = "idle" | "answering" | "feedback" | "loading" | "finished";

export interface AdaptiveQuizState {
  mode: AdaptiveQuizMode;
  currentQuestion: QuizQuestion | null;
  selectedAnswer: string | null;
  wasCorrect: boolean | null;
  difficultyChange: AdaptiveQuestionResponse["difficulty_change"] | null;
  history: AdaptiveHistoryEntry[];
  questionIndex: number;
}

export interface AdaptiveHistoryEntry {
  question: QuizQuestion;
  userAnswer: string | null;
  wasCorrect: boolean;
  difficultyChange: AdaptiveQuestionResponse["difficulty_change"] | null;
}