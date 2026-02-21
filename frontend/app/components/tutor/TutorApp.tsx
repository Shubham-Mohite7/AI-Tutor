"use client";
import { useLearn } from "@/app/hooks/useLearn";
import { TopicInput } from "./TopicInput";
import { ReasoningAnimation } from "./ReasoningAnimation";
import { ExplanationView } from "./ExplanationView";
import { QuizView } from "./QuizView";
import { ResultsView } from "./ResultsView";

export function TutorApp() {
  const { state, startLearning, setAnswer, submitQuiz, reset } = useLearn();
  const { step, explanation, questions, answers, scoreResponse, reasoningTokens, error } = state;

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

      {step === "quiz" && (
        <QuizView
          questions={questions}
          answers={answers}
          onAnswer={setAnswer}
          onSubmit={submitQuiz}
          error={error}
        />
      )}

      {step === "results" && scoreResponse && (
        <ResultsView result={scoreResponse} onReset={reset} />
      )}
    </div>
  );
}
