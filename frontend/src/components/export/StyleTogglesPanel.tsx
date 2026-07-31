import type { ReactNode } from "react";
import type { ExportSettings, TransitionStyle } from "@/types";
import { GlassCard, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { TRANSITION_LABELS, LANG_LABELS } from "@/lib/labels";
import { MUSIC_TRACKS } from "@/lib/sampleTranscripts";

const TRANSITIONS: TransitionStyle[] = ["fade", "zoom", "slide", "cut"];

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  children,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.06] py-4 last:border-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
      {checked && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function StyleTogglesPanel({
  settings,
  musicTrack,
  onUpdate,
}: {
  settings: ExportSettings;
  musicTrack?: string;
  onUpdate: (patch: Partial<ExportSettings>) => void;
}) {
  return (
    <GlassCard className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">Montaj sozlamalari</p>

      <ToggleRow
        title="Auto Transition"
        description="Kesilgan qismlar orasiga professional o'tish effekti"
        checked={settings.transitions}
        onChange={(v) => onUpdate({ transitions: v })}
      >
        <Select value={settings.transitionStyle} onValueChange={(v) => onUpdate({ transitionStyle: v as TransitionStyle })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSITIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {TRANSITION_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ToggleRow>

      <ToggleRow
        title="Background Music"
        description="Videoga mos fon musiqasi avtomatik qo'shiladi"
        checked={settings.backgroundMusic}
        onChange={(v) => onUpdate({ backgroundMusic: v })}
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60">
          🎵 {musicTrack || MUSIC_TRACKS[0]}
        </div>
      </ToggleRow>

      <ToggleRow
        title="Intro va Outro"
        description="Qisqa AI generatsiya qilingan kirish va yakunlovchi qism"
        checked={settings.introOutro}
        onChange={(v) => onUpdate({ introOutro: v })}
      />

      <ToggleRow
        title="AI Noise Removal"
        description="Fon shovqinlarini olib tashlab, ovoz sifatini yaxshilaydi"
        checked={settings.noiseRemoval}
        onChange={(v) => onUpdate({ noiseRemoval: v })}
      />

      <ToggleRow
        title="Auto Zoom"
        description="Muhim lahzalarda kamera avtomatik yaqinlashadi"
        checked={settings.autoZoom}
        onChange={(v) => onUpdate({ autoZoom: v })}
      />

      <div className="pt-4">
        <p className="mb-2 text-sm font-medium text-white/90">Subtitr tili (video ichida)</p>
        <Select value={settings.subtitleLang} onValueChange={(v) => onUpdate({ subtitleLang: v as ExportSettings["subtitleLang"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(LANG_LABELS) as (keyof typeof LANG_LABELS)[]).map((lang) => (
              <SelectItem key={lang} value={lang}>
                {LANG_LABELS[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </GlassCard>
  );
}
