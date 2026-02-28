"use client";

import { useState } from "react";
import AdaptiveQuizView from "./AdaptiveQuizView";
import { TrueOrFalseSwipeCards } from "./TrueOrFalseSwipeCards";
import { useLearn } from "@/app/hooks/useLearn";
import { TopicInput } from "./TopicInput";
import { ReasoningAnimation } from "./ReasoningAnimation";
import { ExplanationView } from "./ExplanationView";
import { QuizView } from "./QuizView";
import { ResultsView } from "./ResultsView";

export function TutorApp() {
  const { state, startLearning, setAnswer, submitQuiz, reset } = useLearn();
  const { step, explanation, questions, answers, scoreResponse, reasoningTokens, error } = state;

  const [quizMode, setQuizMode] = useState<"standard" | "adaptive" | "truefalse">("standard");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Step 1 — always visible unless showing results */}
      {step !== "results" && (
        <TopicInput
          onSubmit={startLearning}
          loading={step === "loading"}
          error={step === "input" ? error : null}
        />
      )}

      {/* Loading animation */}
      {step === "loading" && <ReasoningAnimation />}

      {/* After content loads */}
      {(step === "quiz" || step === "results") && (
        <ExplanationView explanation={explanation} reasoningTokens={reasoningTokens} />
      )}

      {/* Mode toggle buttons */}
      {step === "quiz" && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setQuizMode("standard")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              quizMode === "standard"
                ? "bg-brand-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Standard Quiz
          </button>
          <button
            onClick={() => setQuizMode("adaptive")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              quizMode === "adaptive"
                ? "bg-brand-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Adaptive Practice
          </button>
          <button
            onClick={() => setQuizMode("truefalse")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              quizMode === "truefalse"
                ? "bg-brand-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ↔️ Swipe Cards
          </button>
        </div>
      )}

      {step === "quiz" && quizMode === "standard" && (
        <QuizView
          questions={questions}
          answers={answers}
          onAnswer={setAnswer}
          onSubmit={submitQuiz}
          error={error}
        />
      )}

      {step === "quiz" && quizMode === "adaptive" && (
        <AdaptiveQuizView learnData={{
          topic: state.topic,
          explanation: state.explanation,
          quiz: state.questions,
        }} />
      )}

      {step === "quiz" && quizMode === "truefalse" && (
        <TrueOrFalseSwipeCards
          topic={state.topic}
          explanation={explanation}
        />
      )}

      {step === "results" && scoreResponse && (
        <ResultsView result={scoreResponse} onReset={reset} />
      )}
    </div>
  );
}