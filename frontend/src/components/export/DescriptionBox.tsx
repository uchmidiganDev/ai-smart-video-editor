import * as React from "react";
import { Copy, Check, FileText } from "lucide-react";
import { GlassCard, Button } from "@/components/ui";

export function DescriptionBox({ description }: { description: string }) {
  const [copied, setCopied] = React.useState(false);

  function copy() {
    void navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <FileText className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">AI Tavsif (SEO)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 text-signal-success" /> : <Copy className="h-3.5 w-3.5" />}
          Nusxalash
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-white/70">{description}</p>
    </GlassCard>
  );
}
