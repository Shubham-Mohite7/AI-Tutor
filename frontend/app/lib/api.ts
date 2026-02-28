// lib/api.ts

import type {
  LearnResponse,
  ScoreRequest,
  ScoreResponse,
  AdaptiveQuestionRequest,
  AdaptiveQuestionResponse,
  TrueOrFalseRequest,
  TrueOrFalseResponse,
} from "../types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  learn: (topic: string, language = "en") =>
    apiFetch<LearnResponse>("/api/v1/tutor/learn", {
      method: "POST",
      body: JSON.stringify({ topic, language }),
    }),

  score: (body: ScoreRequest) =>
    apiFetch<ScoreResponse>("/api/v1/tutor/score", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adaptiveQuestion: (body: AdaptiveQuestionRequest) =>
    apiFetch<AdaptiveQuestionResponse>("/api/v1/tutor/adaptive-question", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  trueOrFalse: (body: TrueOrFalseRequest) =>
    apiFetch<TrueOrFalseResponse>("/api/v1/tutor/true-false", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};