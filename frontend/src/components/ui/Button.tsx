import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-glow-violet hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.1] hover:border-white/20",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/[0.06]",
  outline: "bg-transparent border border-white/15 text-white/85 hover:bg-white/[0.06] hover:border-white/25",
  danger: "bg-signal-danger/15 text-signal-danger border border-signal-danger/30 hover:bg-signal-danger/25",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/60",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
