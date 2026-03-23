import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "surface rounded-[28px] border p-6 text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
