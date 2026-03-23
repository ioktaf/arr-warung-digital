import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const toneClasses = {
  neutral:
    "border border-line bg-white/70 text-foreground shadow-[0_6px_20px_rgba(31,34,24,0.06)]",
  brand: "bg-brand text-white",
  accent: "bg-accent text-white",
  success: "bg-success text-white",
  danger: "bg-danger text-white",
} as const;

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof toneClasses;
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
