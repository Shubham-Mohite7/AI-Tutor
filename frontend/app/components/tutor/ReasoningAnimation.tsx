"use client";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { delay: 1,  text: "Parsing topic and identifying core concepts..." },
  { delay: 6,  text: "Retrieving knowledge and structuring the lesson..." },
  { delay: 12, text: "Weaving in relatable Indian examples and context..." },
  { delay: 18, text: "Verifying pedagogical clarity and logical flow..." },
  { delay: 24, text: "Crafting 10 mock test questions from explanation..." },
  { delay: 31, text: "Finalizing and preparing your results..." },
];

export function ReasoningAnimation() {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const sec = (Date.now() - startRef.current) / 1000;
      setElapsed(Math.floor(sec));

      // Eased progress toward 95%
      const raw = Math.min(95, (sec / 38) * 100);
      const eased = raw < 50 ? raw * 1.1 : 50 + (raw - 50) * 0.7;
      setProgress(Math.min(95, eased));

      // Reveal steps
      setVisibleSteps(STEPS.filter((s) => sec >= s.delay).map((_, i) => i));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white border border-brand-200 rounded-2xl p-8 shadow-sm relative overflow-hidden animate-fadeIn">
      {/* Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/5 rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 shrink-0">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <circle cx="20" cy="20" r="19" stroke="#7c6ff7" strokeWidth="1.5" opacity="0.35" />
            <circle
              cx="20" cy="20" r="19" stroke="#7c6ff7" strokeWidth="2"
              strokeDasharray="120" strokeDashoffset="0"
              className="origin-center animate-spin [animation-duration:4s]"
            />
            <circle cx="20" cy="20" r="6" fill="#7c6ff7" opacity="0.8" />
            <circle cx="20" cy="20" r="3" fill="#c4bfff" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-slate-800">Reasoning Engine</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Deep reasoning in progress — approximately 30–40 seconds</p>
        </div>
        {/* Pulsing dots */}
        <div className="flex gap-1.5">
          {[0, 0.4, 0.8].map((d, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <span>Processing</span>
          <span className="text-brand-500">{Math.floor(progress)}%</span>
        </div>
        <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-sm shadow-brand-500/40 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="border-l-2 border-brand-100 pl-5 flex flex-col gap-3 mb-6">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 text-[13.5px] transition-all duration-500 ${
              visibleSteps.includes(i) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            } ${i === STEPS.length - 1 ? "font-semibold text-slate-800" : "text-slate-500"}`}
          >
            <span className="text-brand-500 text-[9px] mt-1 shrink-0">◆</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between text-[11px] text-slate-300 border-t border-brand-100 pt-4">
        <span>Elapsed: <strong className="text-brand-500">{elapsed}s</strong></span>
        <span>Average: 30–40 seconds</span>
      </div>
    </div>
  );
}
