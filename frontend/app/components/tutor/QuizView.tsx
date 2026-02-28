"use client";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import type { QuizQuestion } from "@/app/types";

interface Props {
  questions: QuizQuestion[];
  answers: (string | null)[];
  onAnswer: (index: number, value: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string | null;
}

export function QuizView({ questions, answers, onAnswer, onSubmit, submitting, error }: Props) {
  const answered = answers.filter(Boolean).length;
  const allAnswered = answered === questions.length;

  return (
    <Card
      step="Step 3"
      title="Take the Mock Test"
      description="10 questions built directly from the explanation above. Answer all, then submit."
      className="animate-slideUp"
    >
      <div className="flex flex-col gap-7">
        {questions.map((q, qi) => (
          <div key={qi} className="animate-fadeIn" style={{ animationDelay: `${qi * 40}ms` }}>
            {/* Question text */}
            <p className="text-[14.5px] font-semibold text-slate-800 leading-snug mb-3">
              <span className="text-brand-500 font-black mr-1.5">Q{qi + 1}.</span>
              {q.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const selected = answers[qi] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onAnswer(qi, opt)}
                    className={`text-left w-full px-4 py-3 rounded-xl text-[14px] font-medium border-2 transition-all duration-150 ${
                      selected
                        ? "border-brand-500 bg-gradient-to-r from-brand-50 to-white text-brand-600 font-semibold"
                        : "border-gray-600 bg-white text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="outline"
          loading={submitting}
          disabled={!allAnswered}
          onClick={onSubmit}
        >
          Submit Mock Test
        </Button>
        <p className="text-[13px] text-slate-400">
          {answered}/{questions.length} answered
        </p>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
    </Card>
  );
}
