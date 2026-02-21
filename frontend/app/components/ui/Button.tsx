"use client";
import { cn } from "@/app/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-brand-500 text-white px-7 py-3.5 text-[15px] shadow-md shadow-brand-500/30 hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40 active:translate-y-0"
          : "bg-white text-brand-500 border-2 border-brand-500 px-7 py-3.5 text-[15px] hover:bg-brand-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
