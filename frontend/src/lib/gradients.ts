export const THUMBNAIL_GRADIENTS = [
  "bg-[linear-gradient(135deg,#8b5cf6_0%,#3b82f6_100%)]",
  "bg-[linear-gradient(135deg,#d946ef_0%,#8b5cf6_100%)]",
  "bg-[linear-gradient(135deg,#22d3ee_0%,#3b82f6_100%)]",
  "bg-[linear-gradient(135deg,#fb7185_0%,#d946ef_100%)]",
  "bg-[linear-gradient(135deg,#34d399_0%,#22d3ee_100%)]",
  "bg-[linear-gradient(135deg,#fbbf24_0%,#fb7185_100%)]",
];

export function gradientFor(seed: number): string {
  return THUMBNAIL_GRADIENTS[seed % THUMBNAIL_GRADIENTS.length];
}
