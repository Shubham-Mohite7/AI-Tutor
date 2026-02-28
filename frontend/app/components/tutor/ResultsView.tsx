"use client";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import type { ScoreResponse } from "@/app/types";

interface Props {
  result: ScoreResponse;
  onReset: () => void;
}

export function ResultsView({ result, onReset }: Props) {
  const { score, total, percentage, results } = result;

  const scoreColor =
    percentage >= 80
      ? "text-green-600"
      : percentage >= 60
      ? "text-yellow-600"
      : "text-red-500";

  const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : "D";

  return (
    <Card
      step="Step 4"
      title="Your Results"
      description="Question-by-question feedback with explanations so you know exactly what to review."
      className="animate-slideUp"
    >
      {/* Score header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-5 bg-white border-2 border-gray-600 rounded-xl">
        <div>
          <p className={`font-display text-5xl font-black ${scoreColor}`}>
            {score}<span className="text-slate-400 text-3xl">/{total}</span>
          </p>
          <p className="text-[13px] text-slate-500 mt-1">{percentage}% — {grade}</p>
        </div>
        {/* Mini bar */}
        <div className="flex-1 w-full">
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percentage >= 80
                  ? "bg-brand-600"
                  : percentage >= 60
                  ? "bg-brand-500"
                  : "bg-brand-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-question results */}
      <div className="flex flex-col gap-4 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
        {results.map((r, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border text-[14px] ${
              r.is_correct
                ? "bg-brand-50 border-brand-200"
                : "bg-red-50 border-red-200"
            } animate-fadeIn`}
          >
            <div className="flex items-start gap-2.5 mb-1.5">
              <span className={`font-black text-[13px] shrink-0 mt-0.5 ${r.is_correct ? "text-brand-500" : "text-red-500"}`}>
                {r.is_correct ? "Correct" : "Incorrect"}
              </span>
              <p className="font-semibold text-slate-800 leading-snug">
                Q{index + 1}. {r.question}
              </p>
            </div>
            {!r.is_correct && (
              <p className="text-[13px] text-slate-500 ml-5 mb-1">
                Your answer: <span className="font-semibold text-red-500">{r.user_answer ?? "Not answered"}</span>
                {" · "}Correct: <span className="font-semibold text-green-600">{r.correct_answer}</span>
              </p>
            )}
            <p className="text-[13px] text-slate-500 ml-5 leading-relaxed">{r.explanation}</p>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={onReset} className="mt-7">
        Try Another Topic
      </Button>
    </Card>
  );
}
