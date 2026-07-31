import type { PipelineStageDef } from "@/types";

export const PIPELINE_STAGES: PipelineStageDef[] = [
  {
    id: "upload",
    label: "Video yuklanmoqda",
    hint: "Fayl serverga xavfsiz uzatilmoqda",
  },
  {
    id: "audio",
    label: "Audio ajratilmoqda",
    hint: "Video traketkasidan tovush qatlami ajratib olinmoqda",
  },
  {
    id: "transcribe",
    label: "Nutq matnga aylantirilmoqda",
    hint: "Whisper modeli yordamida audio transkripsiya qilinmoqda",
  },
  {
    id: "diarize",
    label: "Gapirayotgan odamlar aniqlanmoqda",
    hint: "Har bir spikerning ovozi ajratilib, vaqt oralig'i belgilanmoqda",
  },
  {
    id: "faces",
    label: "Yuzlar aniqlanmoqda",
    hint: "Kadrlar bo'yicha yuzlar aniqlanib, kuzatuv boshlanmoqda",
  },
  {
    id: "emotions",
    label: "Emotsiyalar tahlil qilinmoqda",
    hint: "Ovoz va yuz ifodasi asosida his-tuyg'ular baholanmoqda",
  },
  {
    id: "highlights",
    label: "Eng qiziqarli joylar topilmoqda",
    hint: "Highlight lahzalar aniqlanib, ballar qo'yilmoqda",
  },
  {
    id: "subtitles",
    label: "Subtitle yaratilmoqda",
    hint: "Matn asosida animatsiyali subtitrlar tayyorlanmoqda",
  },
  {
    id: "edit",
    label: "Video montaj qilinmoqda",
    hint: "Tanlangan qismlar kesilib, o'tishlar bilan birlashtirilmoqda",
  },
  {
    id: "finalize",
    label: "Yakunlanmoqda",
    hint: "Yakuniy video render qilinib, tayyorlanmoqda",
  },
];
