import type { EmotionType, HighlightCategory, SubtitleLang, TransitionStyle } from "@/types";

export const EMOTION_LABELS: Record<EmotionType, string> = {
  laugh: "Kulish",
  surprise: "Hayrat",
  anger: "Jahl",
  sad: "Xafa bo'lish",
  joy: "Quvonch",
  excitement: "Hayajon",
};

export const EMOTION_EMOJI: Record<EmotionType, string> = {
  laugh: "😂",
  surprise: "😮",
  anger: "😠",
  sad: "😢",
  joy: "😊",
  excitement: "🤩",
};

export const EMOTION_COLORS: Record<EmotionType, string> = {
  laugh: "#fbbf24",
  surprise: "#22d3ee",
  anger: "#fb7185",
  sad: "#60a5fa",
  joy: "#34d399",
  excitement: "#d946ef",
};

export const CATEGORY_LABELS: Record<HighlightCategory, string> = {
  funny: "Kulgili",
  important: "Muhim",
  emotional: "Hissiyotli",
  interesting: "Qiziqarli",
  reaction: "Reaksiya",
  insightful: "Foydali",
};

export const CATEGORY_COLORS: Record<HighlightCategory, string> = {
  funny: "#fbbf24",
  important: "#8b5cf6",
  emotional: "#fb7185",
  interesting: "#22d3ee",
  reaction: "#d946ef",
  insightful: "#34d399",
};

export const LANG_LABELS: Record<SubtitleLang, string> = {
  uz: "O'zbek",
  en: "Ingliz",
  ru: "Rus",
};

export const TRANSITION_LABELS: Record<TransitionStyle, string> = {
  fade: "Fade",
  zoom: "Zoom",
  slide: "Slide",
  cut: "Smooth Cut",
};
