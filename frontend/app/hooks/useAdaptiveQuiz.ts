"use client";

// hooks/useAdaptiveQuiz.ts

import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type {
  QuizQuestion,
  AdaptiveQuizState,
  AdaptiveHistoryEntry,
  LearnResponse,
} from "../types";

const MAX_QUESTIONS = 15; // stop after this many adaptive questions

const initialState = (): AdaptiveQuizState => ({
  mode: "idle",
  currentQuestion: null,
  selectedAnswer: null,
  wasCorrect: null,
  difficultyChange: null,
  history: [],
  questionIndex: 0,
});

export function useAdaptiveQuiz(learnData: LearnResponse | null) {
  const [state, setState] = useState<AdaptiveQuizState>(initialState());

  // Start adaptive mode using the first quiz question as the seed
  const start = useCallback(
    (seedQuestion: QuizQuestion) => {
      setState({
        ...initialState(),
        mode: "answering",
        currentQuestion: seedQuestion,
        questionIndex: 1,
      });
    },
    []
  );

  // User picks an answer
  const selectAnswer = useCallback((answer: string) => {
    setState((prev) => ({ ...prev, selectedAnswer: answer }));
  }, []);

  // User submits their answer → show feedback
  const submitAnswer = useCallback(() => {
    setState((prev) => {
      if (!prev.currentQuestion || !prev.selectedAnswer) return prev;
      const wasCorrect =
        prev.selectedAnswer === prev.currentQuestion.correct_answer;
      return { ...prev, mode: "feedback", wasCorrect };
    });
  }, []);

  // After seeing feedback → load next adaptive question
  const nextQuestion = useCallback(async () => {
    if (!learnData) return;

    setState((prev) => {
      if (!prev.currentQuestion) return prev;

      const historyEntry: AdaptiveHistoryEntry = {
        question: prev.currentQuestion,
        userAnswer: prev.selectedAnswer,
        wasCorrect: prev.wasCorrect ?? false,
        difficultyChange: prev.difficultyChange,
      };

      const newIndex = prev.questionIndex + 1;

      if (newIndex > MAX_QUESTIONS) {
        return {
          ...prev,
          mode: "finished",
          history: [...prev.history, historyEntry],
        };
      }

      return {
        ...prev,
        mode: "loading",
        history: [...prev.history, historyEntry],
        questionIndex: newIndex,
      };
    });

    // We need current state values to call the API — read from a snapshot
    setState((prev) => {
      // Kick off async work outside setState
      if (prev.mode === "loading" && prev.currentQuestion) {
        api
          .adaptiveQuestion({
            topic: learnData.topic,
            explanation: learnData.explanation,
            last_question: prev.currentQuestion,
            was_correct: prev.wasCorrect ?? false,
          })
          .then((resp) => {
            setState((s) => ({
              ...s,
              mode: "answering",
              currentQuestion: resp.question,
              selectedAnswer: null,
              wasCorrect: null,
              difficultyChange: resp.difficulty_change,
            }));
          })
          .catch(() => {
            setState((s) => ({ ...s, mode: "finished" }));
          });
      }
      return prev;
    });
  }, [learnData]);

  const reset = useCallback(() => setState(initialState()), []);

  return { state, start, selectAnswer, submitAnswer, nextQuestion, reset };
}