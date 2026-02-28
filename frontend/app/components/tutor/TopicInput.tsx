"use client";
import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import type { Language } from "@/app/types";

interface Props {
  onSubmit: (topic: string, language: Language) => void;
  loading?: boolean;
  error?: string | null;
}

export function TopicInput({ onSubmit, loading, error }: Props) {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  return (
    <Card step="Step 1" title="Choose Your Topic" description="Enter any subject, chapter, or concept. The AI will explain it and build a personalised mock test for you.">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        {/* Topic input */}
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && topic.trim() && onSubmit(topic.trim(), language)}
            placeholder="e.g. Photosynthesis, French Revolution, Solar System..."
            className="w-full bg-white border-2 border-gray-600 rounded-xl px-4 py-3 text-[15px] text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
          />
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label="Select language"
            title="Select language"
            className="bg-white border-2 border-gray-600 rounded-xl px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {/* Start button */}
        <Button
          variant="primary"
          loading={loading}
          disabled={!topic.trim()}
          onClick={() => onSubmit(topic.trim(), language)}
          className="shrink-0 h-[50px] sm:self-end"
        >
          Start Learning
        </Button>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium animate-slideUp">
          {error}
        </div>
      )}
    </Card>
  );
}
