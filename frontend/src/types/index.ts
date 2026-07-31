export type PipelineStageId =
  | "upload"
  | "audio"
  | "transcribe"
  | "diarize"
  | "faces"
  | "emotions"
  | "highlights"
  | "subtitles"
  | "edit"
  | "finalize";

export interface PipelineStageDef {
  id: PipelineStageId;
  label: string;
  hint: string;
}

export type SubtitleLang = "uz" | "en" | "ru";

export type EmotionType =
  | "laugh"
  | "surprise"
  | "anger"
  | "sad"
  | "joy"
  | "excitement";

export type HighlightCategory =
  | "funny"
  | "important"
  | "emotional"
  | "interesting"
  | "reaction"
  | "insightful";

export type TransitionStyle = "fade" | "zoom" | "slide" | "cut";

export type ProjectStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export interface Speaker {
  id: string;
  name: string;
  color: string;
  segments: { start: number; end: number }[];
  talkTimeSec: number;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  start: number;
  end: number;
  text: string;
}

export interface EmotionPoint {
  id: string;
  t: number;
  type: EmotionType;
  intensity: number;
  speakerId: string;
}

export interface Highlight {
  id: string;
  start: number;
  end: number;
  score: number;
  category: HighlightCategory;
  title: string;
  reason: string;
  included: boolean;
}

export interface SubtitleWord {
  text: string;
  start: number;
  end: number;
}

export interface SubtitleLine {
  id: string;
  start: number;
  end: number;
  text: string;
  speakerId: string;
  words: SubtitleWord[];
}

export interface ViralScoreResult {
  score: number;
  reasons: string[];
}

export interface HashtagSet {
  tiktok: string[];
  instagram: string[];
  youtube: string[];
}

export interface ExportSettings {
  lengthSec: number;
  transitions: boolean;
  transitionStyle: TransitionStyle;
  backgroundMusic: boolean;
  musicTrack: string;
  introOutro: boolean;
  noiseRemoval: boolean;
  autoZoom: boolean;
  subtitleLang: SubtitleLang;
}

export interface AnalysisResult {
  speakers: Speaker[];
  transcript: TranscriptSegment[];
  emotionPoints: EmotionPoint[];
  highlights: Highlight[];
  subtitles: Record<SubtitleLang, SubtitleLine[]>;
  viralScore: ViralScoreResult;
  titles: string[];
  description: string;
  hashtags: HashtagSet;
}

export interface LogEntry {
  id: string;
  t: number;
  message: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  durationSec: number;
  sourceFileName: string;
  sourceSizeBytes: number;
  sourceUrl?: string;
  gradientSeed: number;
  status: ProjectStatus;
  currentStage?: PipelineStageId;
  overallProgress: number;
  exportSettings: ExportSettings;
  result?: AnalysisResult;
  logs: LogEntry[];
}
