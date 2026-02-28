"use client";

// components/tutor/AdaptiveQuizView.tsx

import { useEffect } from "react";
import type { LearnResponse, QuizQuestion } from "../../types";
import { useAdaptiveQuiz } from "../../hooks/useAdaptiveQuiz";

// ── Difficulty badge ───────────────────────────────────────────────────────────

function DifficultyBar({ level }: { level: number }) {
  const pct = (level / 10) * 100;
  const color =
    level <= 3
      ? "#4ade80"   // green – easy
      : level <= 6
      ? "#f59e0b"   // amber – medium
      : "#ef4444";  // red – hard
  const label =
    level <= 3 ? "Easy" : level <= 6 ? "Medium" : "Hard";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-300 font-medium w-16">{label}</span>
      <div className="flex-1 h-2 bg-emerald-950 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-green-300 w-8 text-right">{level}/10</span>
    </div>
  );
}

// ── Difficulty change banner ───────────────────────────────────────────────────

function DifficultyChangePill({
  change,
}: {
  change: "harder" | "easier" | "same" | null;
}) {
  if (!change) return null;
  const map = {
    harder: { label: "⬆ Level Up! Harder question incoming", color: "bg-red-500/20 text-red-300 border-red-500/40" },
    easier: { label: "⬇ Dropping difficulty — you got this!", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
    same: { label: "→ Same difficulty", color: "bg-green-500/20 text-green-300 border-green-500/40" },
  };
  const { label, color } = map[change];
  return (
    <div className={`text-xs px-3 py-1.5 rounded-full border ${color} font-medium`}>
      {label}
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressRow({
  index,
  history,
}: {
  index: number;
  history: { wasCorrect: boolean }[];
}) {
  const MAX = 15;
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: MAX }).map((_, i) => {
        const past = history[i];
        const isCurrent = i === index - 1;
        return (
          <div
            key={i}
            className={[
              "h-2 flex-1 rounded-full transition-all duration-300",
              past
                ? past.wasCorrect
                  ? "bg-green-400"
                  : "bg-red-500"
                : isCurrent
                ? "bg-green-500 animate-pulse"
                : "bg-slate-700",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

// ── Results summary ────────────────────────────────────────────────────────────

function ResultsSummary({
  history,
  onRestart,
}: {
  history: { wasCorrect: boolean; question: QuizQuestion }[];
  onRestart: () => void;
}) {
  const correct = history.filter((h) => h.wasCorrect).length;
  const pct = Math.round((correct / history.length) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-6xl font-black text-white">{pct}%</div>
        <div className="text-green-300">
          {correct} / {history.length} correct
        </div>
        <div className="text-sm text-green-400 font-medium">
          {pct >= 80
            ? "Outstanding performance!"
            : pct >= 60
            ? "Good job! Keep practising."
            : "Review the topic and try again."}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {history.map((entry, i) => (
          <div
            key={i}
            className={[
              "rounded-xl p-3 border text-sm",
              entry.wasCorrect
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-300 line-clamp-2">{entry.question.question}</span>
              <span className="shrink-0">{entry.wasCorrect ? "Correct" : "Incorrect"}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Difficulty: {entry.question.difficulty}/10
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface AdaptiveQuizViewProps {
  learnData: LearnResponse;
}

export default function AdaptiveQuizView({ learnData }: AdaptiveQuizViewProps) {
  const { state, start, selectAnswer, submitAnswer, nextQuestion, reset } =
    useAdaptiveQuiz(learnData);

  // Auto-start with the first quiz question as seed
  useEffect(() => {
    if (state.mode === "idle" && learnData.quiz.length > 0) {
      start(learnData.quiz[0]);
    }
  }, [learnData, state.mode, start]);

  const q = state.currentQuestion;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Adaptive Practice
        </h2>
        {state.mode !== "idle" && state.mode !== "finished" && (
          <span className="text-gray-400 text-sm">
            Q {state.questionIndex} / 15
          </span>
        )}
      </div>

      {/* Progress dots */}
      {state.mode !== "idle" && state.mode !== "finished" && (
        <ProgressRow index={state.questionIndex} history={state.history} />
      )}

      {/* Difficulty change pill */}
      {state.difficultyChange && state.mode === "answering" && (
        <div className="flex justify-center">
          <DifficultyChangePill change={state.difficultyChange} />
        </div>
      )}

      {/* Loading */}
      {state.mode === "loading" && (
        <div className="rounded-2xl bg-emerald-950 border border-emerald-700 p-8 text-center space-y-3">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-green-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-green-300 text-sm">
            Generating your next question…
          </p>
        </div>
      )}

      {/* Question card */}
      {(state.mode === "answering" || state.mode === "feedback") && q && (
        <div className="rounded-2xl bg-emerald-950 border border-emerald-700 p-6 space-y-5">
          {/* Difficulty bar */}
          <DifficultyBar level={q.difficulty} />

          {/* Question text */}
          <p className="text-white text-base font-medium leading-relaxed">
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt) => {
              const isSelected = state.selectedAnswer === opt;
              const isCorrect = opt === q.correct_answer;
              const showResult = state.mode === "feedback";

              let cls =
                "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ";

              if (showResult) {
                if (isCorrect)
                  cls += "bg-green-500/20 border-green-500 text-green-200";
                else if (isSelected && !isCorrect)
                  cls += "bg-red-500/20 border-red-500 text-red-200";
                else
                  cls += "bg-slate-700/40 border-slate-600 text-slate-400 cursor-not-allowed";
              } else {
                cls += isSelected
                  ? "bg-green-600/30 border-green-500 text-green-200"
                  : "bg-slate-700/50 border-slate-600 text-slate-200 hover:border-green-500 hover:bg-green-600/10 cursor-pointer";
              }

              return (
                <button
                  key={opt}
                  className={cls}
                  disabled={state.mode === "feedback"}
                  onClick={() => selectAnswer(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback panel */}
          {state.mode === "feedback" && (
            <div
              className={[
                "rounded-xl p-4 text-sm border",
                state.wasCorrect
                  ? "bg-green-500/10 border-green-500/30 text-green-200"
                  : "bg-red-500/10 border-red-500/30 text-red-200",
              ].join(" ")}
            >
              <div className="font-semibold mb-1">
                {state.wasCorrect ? "Correct!" : "Incorrect!"}
              </div>
              <p className="text-slate-300">{q.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          {state.mode === "answering" && (
            <button
              onClick={submitAnswer}
              disabled={!state.selectedAnswer}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Submit Answer
            </button>
          )}

          {state.mode === "feedback" && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              {state.questionIndex >= 15 ? "See Results" : "Next Question →"}
            </button>
          )}
        </div>
      )}

      {/* Finished */}
      {state.mode === "finished" && (
        <div className="rounded-2xl bg-emerald-950 border border-emerald-700 p-6">
          <ResultsSummary history={state.history} onRestart={reset} />
        </div>
      )}
    </div>
  );
}