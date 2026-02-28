"use client";
import { Card } from "@/app/components/ui/Card";

interface Props {
  explanation: string;
  reasoningTokens: number;
}

export function ExplanationView({ explanation, reasoningTokens }: Props) {
  return (
    <>
      {/* Reasoning complete banner */}
      <div className="w-full bg-white border border-brand-400 rounded-2xl px-7 py-4 flex items-center gap-4 shadow-sm shadow-brand-500/10 animate-slideUp">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-600 font-black text-lg shrink-0">
        </div>
        <div>
          <p className="text-[14px] font-bold text-brand-600">Reasoning Complete</p>
          <p className="text-[12px] text-brand-500 mt-0.5">Explanation and mock test are ready below</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display text-2xl font-black text-brand-500">{reasoningTokens.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">reasoning tokens</p>
        </div>
      </div>

      {/* Explanation card */}
      <Card
        step="Step 2"
        title="Read the Explanation"
        description="A clear, step-by-step explanation with relatable examples — generated fresh using deep reasoning."
        className="animate-slideUp"
      >
        <div className="bg-white border-2 border-gray-600 rounded-xl p-5 max-h-80 overflow-y-auto scrollbar-thin">
          <p className="text-[15px] text-slate-700 leading-[1.85] whitespace-pre-wrap">{explanation}</p>
        </div>
      </Card>
    </>
  );
}
