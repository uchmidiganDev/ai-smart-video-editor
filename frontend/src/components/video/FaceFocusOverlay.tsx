import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";
import type { Speaker } from "@/types";

const BOX_POSITIONS = [
  { left: "8%", top: "14%", width: "34%", height: "72%" },
  { left: "60%", top: "10%", width: "32%", height: "78%" },
  { left: "34%", top: "18%", width: "30%", height: "68%" },
  { left: "12%", top: "22%", width: "28%", height: "64%" },
];

export function FaceFocusOverlay({
  activeSpeaker,
  speakerIndex,
}: {
  activeSpeaker?: Speaker;
  speakerIndex: number;
}) {
  if (!activeSpeaker) return null;
  const pos = BOX_POSITIONS[speakerIndex % BOX_POSITIONS.length];

  return (
    <motion.div
      className="pointer-events-none absolute rounded-xl border-2"
      style={{ borderColor: activeSpeaker.color }}
      animate={{ left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <div
        className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-white"
        style={{ backgroundColor: activeSpeaker.color }}
      >
        <ScanFace className="h-3 w-3" />
        {activeSpeaker.name}
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      </div>
    </motion.div>
  );
}
