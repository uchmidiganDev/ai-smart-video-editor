import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import type { LogEntry } from "@/types";
import { GlassCard } from "@/components/ui";

export function LiveLogFeed({ logs }: { logs: LogEntry[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [logs.length]);

  return (
    <GlassCard className="flex h-full flex-col p-4">
      <div className="mb-2 flex items-center gap-2 text-white/60">
        <Terminal className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">AI jarayoni jurnali</p>
      </div>
      <div ref={scrollRef} className="max-h-72 flex-1 space-y-1.5 overflow-y-auto pr-1 font-mono text-[11.5px] leading-relaxed">
        {logs.length === 0 && <p className="text-white/25">Boshlanmoqda...</p>}
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 text-white/55"
            >
              <span className="shrink-0 text-accent-cyan/70">›</span>
              <span className="text-white/70">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
