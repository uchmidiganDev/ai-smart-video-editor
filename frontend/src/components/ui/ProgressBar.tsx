import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  value: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", trackClassName, className)}>
      <div
        className={cn(
          "h-full rounded-full bg-brand-gradient",
          animated && "transition-[width] duration-300 ease-out",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
