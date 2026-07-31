import { cn } from "@/lib/cn";

const OPTIONS = [
  { sec: 30, label: "30 soniya" },
  { sec: 60, label: "1 daqiqa" },
  { sec: 180, label: "3 daqiqa" },
  { sec: 300, label: "5 daqiqa" },
  { sec: 600, label: "10 daqiqa" },
];

export function LengthSelector({
  value,
  durationSec,
  onChange,
}: {
  value: number;
  durationSec: number;
  onChange: (sec: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const disabled = opt.sec > durationSec + 2;
        const active = value === opt.sec;
        return (
          <button
            key={opt.sec}
            disabled={disabled}
            onClick={() => onChange(opt.sec)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              disabled && "cursor-not-allowed border-white/5 text-white/20",
              !disabled && active && "border-transparent bg-brand-gradient text-white shadow-glow-violet",
              !disabled && !active && "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
