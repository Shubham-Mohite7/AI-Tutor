"use client";
import { useState, useCallback } from "react";
import { api } from "@/app/lib/api";
import type { Language, LearnState, QuizQuestion } from "@/app/types";

const INIT: LearnState = {
  step: "input",
  topic: "",
  language: "en",
  explanation: "",
  questions: [],
  answers: Array(10).fill(null) as null[],
  scoreResponse: null,
  reasoningTokens: 0,
  error: null,
};

export function useLearn() {
  const [state, setState] = useState<LearnState>(INIT);

  const startLearning = useCallback(async (topic: string, language: Language) => {
    setState({ ...INIT, step: "loading", topic, language });
    try {
      const data = await api.learn(topic, language);
      setState((s) => ({
        ...s,
        step: "quiz",
        explanation: data.explanation,
        questions: data.quiz,  // ← Fixed: use "quiz" not "questions"
        answers: Array(data.quiz.length).fill(null) as null[],
        reasoningTokens: 0, // Backend doesn't provide this field yet
        error: null,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        step: "input",
        error: e instanceof Error ? e.message : "Something went wrong",
      }));
    }
  }, []);

  const setAnswer = useCallback((index: number, answer: string) => {
    setState((s) => {
      const answers = [...s.answers];
      answers[index] = answer;
      return { ...s, answers };
    });
  }, []);

  const submitQuiz = useCallback(async () => {
    setState((s) => ({ ...s, step: "loading", error: null }));
    try {
      const result = await api.score({
        quiz: state.questions,
        answers: state.answers,
      });
      setState((s) => ({ ...s, step: "results", scoreResponse: result }));
    } catch (e) {
      setState((s) => ({
        ...s,
        step: "quiz",
        error: e instanceof Error ? e.message : "Could not score quiz",
      }));
    }
  }, [state.questions, state.answers]);

  const reset = useCallback(() => setState(INIT), []);

  return { state, startLearning, setAnswer, submitQuiz, reset };
}
