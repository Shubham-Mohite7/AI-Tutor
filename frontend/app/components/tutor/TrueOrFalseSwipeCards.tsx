"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import type { TrueOrFalseStatement } from "@/app/types";
import "./swipe-animations.css";

interface TrueOrFalseSwipeCardsProps {
  topic: string;
  explanation: string;
}

export function TrueOrFalseSwipeCards({
  topic,
  explanation,
}: TrueOrFalseSwipeCardsProps) {
  const [statements, setStatements] = useState<TrueOrFalseStatement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<number, boolean>>(
    new Map()
  );
  const [dragStart, setDragStart] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Load True/False statements
  useEffect(() => {
    async function loadStatements() {
      try {
        setLoading(true);
        const response = await api.trueOrFalse({
          topic,
          explanation,
          language: "en",
        });
        setStatements(response.statements || []);
        setStats({ correct: 0, total: response.statements?.length || 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load statements");
      } finally {
        setLoading(false);
      }
    }
    loadStatements();
  }, [topic, explanation]);

  // Trigger celebration when quiz is complete
  useEffect(() => {
    if (currentIndex >= statements.length && statements.length > 0) {
      triggerCelebration();
    }
  }, [currentIndex, statements.length]);

  const triggerCelebration = () => {
    // Create confetti
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = `confetti ${["green", "cyan", "yellow"][Math.floor(Math.random() * 3)]}`;
      confetti.style.left = Math.random() * 100 + "%";
      (confetti.style as any).animationDelay = Math.random() * 0.3 + "s";
      (confetti.style as any).animation = `confetti-fall ${2 + Math.random() * 1}s ease-in forwards`;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }

    // Create fireworks
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = window.innerWidth / 2 + Math.cos(angle) * 100;
      const y = window.innerHeight / 2 + Math.sin(angle) * 100;

      const firework = document.createElement("div");
      firework.className = "firework green";
      firework.style.left = x + "px";
      firework.style.top = y + "px";
      (firework.style as any).animation = `firework-burst 0.6s ease-out forwards`;
      document.body.appendChild(firework);

      setTimeout(() => firework.remove(), 1000);
    }

    // Create glow flash
    const glowFlash = document.createElement("div");
    glowFlash.className = "glow-flash";
    document.body.appendChild(glowFlash);
    setTimeout(() => glowFlash.remove(), 1000);

    // Create celebration text
    const messages = ["Amazing!", "Perfect!", "Excellent!", "Awesome!"];
    for (let i = 0; i < 3; i++) {
      const text = document.createElement("div");
      text.className = "celebration-text";
      text.textContent = messages[Math.floor(Math.random() * messages.length)];
      text.style.left = Math.random() * 80 + 10 + "%";
      text.style.top = Math.random() * 40 + 20 + "%";
      (text.style as any).animationDelay = i * 0.2 + "s";
      document.body.appendChild(text);
      setTimeout(() => text.remove(), 2000);
    }

    // Create pulse rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div");
      ring.className = "pulse-ring";
      ring.style.left = window.innerWidth / 2 - 50 + "px";
      ring.style.top = window.innerHeight / 2 - 50 + "px";
      (ring.style as any).animationDelay = i * 0.2 + "s";
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 1500);
    }
  };

  const currentStatement = statements[currentIndex];
  const answered = userAnswers.has(currentIndex);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
    setDragX(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStart === 0) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragStart;
    setDragX(Math.max(Math.min(delta, 150), -150));
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (Math.abs(dragX) > 50) {
      const answer = dragX > 0;
      handleAnswer(answer);
    }
    setDragStart(0);
    setDragX(0);
  };

  const handleAnswer = (answer: boolean) => {
    if (!currentStatement || answered) return;

    setUserAnswers(new Map(userAnswers).set(currentIndex, answer));

    const isCorrect = answer === currentStatement.is_true;
    if (isCorrect) {
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }

    setShowExplanation(true);
    setTimeout(() => {
      if (currentIndex < statements.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowExplanation(false);
      }
    }, 2500);
  };

  const handleButtonClick = (answer: boolean) => {
    if (!answered) {
      handleAnswer(answer);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserAnswers(new Map());
    setStats({ correct: 0, total: statements.length });
    setShowExplanation(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="h-96 bg-gradient-to-br from-emerald-950 to-slate-900 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-green-400 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-green-300">Loading swipe cards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || statements.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="h-96 bg-gradient-to-br from-red-900/20 to-slate-900 rounded-2xl flex items-center justify-center border border-red-500/30">
          <div className="text-center">
            <p className="text-red-400 text-lg">
              {error || "No statements loaded"}
            </p>
            <p className="text-slate-400 mt-2 text-sm">
              Please try again or switch to another mode
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= statements.length) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl p-8 text-center text-white shadow-2xl border border-green-400">
          <h3 className="text-3xl font-bold mb-4">Quiz Complete!</h3>
          <div className="text-5xl font-bold mb-2 animate-bounce">
            {stats.correct}/{stats.total}
          </div>
          <p className="text-green-100 mb-6 text-xl">
            {Math.round((stats.correct / stats.total) * 100)}% Correct
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const rotationDeg = (dragX / 150) * 5;
  const opacityLeft = Math.max(0, -dragX / 75);
  const opacityRight = Math.max(0, dragX / 75);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-green-400 font-semibold">True/False Cards</h3>
          <span className="text-green-300 text-sm">
            {currentIndex + 1}/{statements.length}
          </span>
        </div>
        <div className="w-full bg-emerald-900 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / statements.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="relative h-96 perspective">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 font-bold text-2xl transition-opacity duration-200"
            style={{ opacity: opacityLeft }}
          >
            FALSE
          </div>
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 font-bold text-2xl transition-opacity duration-200"
            style={{ opacity: opacityRight }}
          >
            TRUE
          </div>
        </div>

        <div
          className="swipe-card absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-8 shadow-2xl cursor-grab active:cursor-grabbing border border-emerald-700/50 flex flex-col justify-between"
          style={{
            transform: `translateX(${dragX}px) rotateY(${rotationDeg}deg) rotateZ(${rotationDeg * 0.5}deg)`,
            transition: dragStart === 0 ? "transform 0.3s ease-out" : "none",
            opacity: showExplanation ? 0.5 : 1,
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex-1 flex items-center justify-center mb-6">
            <p className="text-2xl font-bold text-white text-center leading-relaxed">
              {currentStatement?.statement}
            </p>
          </div>

          {showExplanation && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
              <p className="text-sm text-green-100">
                <span className="font-semibold">
                  {userAnswers.get(currentIndex) === currentStatement.is_true
                    ? "Correct!"
                    : "Incorrect"}
                </span>
                <br />
                {currentStatement?.explanation}
              </p>
            </div>
          )}

          <p className="text-center text-emerald-300 text-sm">
            {answered
              ? "Loading next question..."
              : "Swipe → for True, ← for False (or use buttons)"}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => handleButtonClick(false)}
          disabled={answered}
          className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="text-2xl">X</span>
          FALSE
        </button>

        <button
          onClick={() => handleButtonClick(true)}
          disabled={answered}
          className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="text-2xl">Check</span>
          TRUE
        </button>
      </div>

      <div className="mt-8 p-4 bg-emerald-950/50 rounded-lg border border-emerald-700">
        <div className="flex justify-between items-center">
          <span className="text-emerald-300">Correct Answers:</span>
          <span className="text-2xl font-bold text-green-400">
            {stats.correct}/{stats.total}
          </span>
        </div>
      </div>
    </div>
  );
}
