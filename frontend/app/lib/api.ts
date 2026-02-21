import type { LearnResponse, QuizQuestion, ScoreResponse } from "@/app/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail ?? "Unknown error");
  }
  return res.json() as Promise<T>;
}

export const api = {
  learn: (topic: string, language: string) =>
    req<LearnResponse>("/api/v1/tutor/learn", { topic, language }),

  score: (quiz: QuizQuestion[], answers: (string | null)[]) =>
    req<ScoreResponse>("/api/v1/tutor/score", { quiz, answers }),
};
