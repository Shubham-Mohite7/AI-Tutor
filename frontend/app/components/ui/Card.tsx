import { cn } from "@/app/lib/utils";

interface CardProps {
  step?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ step, title, description, children, className }: CardProps) {
  return (
    <div className={cn("w-full bg-white border border-brand-200 rounded-2xl p-9 shadow-sm", className)}>
      {step && (
        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-widest mb-1">{step}</p>
      )}
      <h2 className="font-display text-[22px] font-black text-slate-900 leading-tight mb-1">{title}</h2>
      {description && (
        <p className="text-[13.5px] text-slate-400 leading-relaxed mb-6">{description}</p>
      )}
      {children}
    </div>
  );
}
