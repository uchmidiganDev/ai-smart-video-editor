import { motion } from "framer-motion";
import { Flame, CheckCircle2 } from "lucide-react";
import type { ViralScoreResult } from "@/types";
import { GlassCard } from "@/components/ui";

function scoreColor(score: number): string {
  if (score >= 85) return "#34d399";
  if (score >= 70) return "#d946ef";
  return "#fbbf24";
}

export function ViralScoreCard({ viralScore }: { viralScore: ViralScoreResult }) {
  const circumference = 2 * Math.PI * 54;
  const color = scoreColor(viralScore.score);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - viralScore.score / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white">{viralScore.score}</span>
            <span className="text-[10px] text-white/40">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white">
            <Flame className="h-4 w-4 text-accent-fuchsia" />
            Viral Score — nega bunday baho?
          </div>
          <ul className="space-y-1.5">
            {viralScore.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-success" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
