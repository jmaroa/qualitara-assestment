import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, type = "button", variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-[var(--color-primary)] px-4 py-2 text-[var(--color-primary-foreground)] hover:opacity-90",
        variant === "outline" &&
          "border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-[var(--color-foreground)] hover:bg-[var(--color-accent)]",
        variant === "ghost" && "px-2 py-1 text-[var(--color-foreground)] hover:bg-[var(--color-accent)]",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
