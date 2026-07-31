import type { SubtitleLang } from "@/types";
import { LANG_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";

const LANGS: SubtitleLang[] = ["uz", "en", "ru"];

export function LanguageSwitch({
  value,
  onChange,
}: {
  value: SubtitleLang;
  onChange: (lang: SubtitleLang) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === lang ? "bg-white/[0.09] text-white" : "text-white/45 hover:text-white/80",
          )}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
