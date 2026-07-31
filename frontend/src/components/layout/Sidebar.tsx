import { NavLink } from "react-router-dom";
import { Clapperboard, LayoutDashboard, FolderOpen, UploadCloud, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Loyihalar", icon: FolderOpen, end: false },
];

export function Sidebar() {
  const openUploadModal = useUiStore((s) => s.openUploadModal);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-violet">
          <Clapperboard className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">AI Video Editor</p>
          <p className="text-[11px] text-white/40">Smart Montaj Platformasi</p>
        </div>
      </div>

      <div className="px-4">
        <Button className="w-full" onClick={openUploadModal}>
          <UploadCloud className="h-4 w-4" />
          Video yuklash
        </Button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/85",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-brand-gradient-soft p-4">
        <div className="mb-2 flex items-center gap-1.5 text-accent-violet">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">AI Pro rejim</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/50">
          Cloud AI kalitlarini ulang — transkripsiya, highlight va matn generatsiyasi to'liq
          aniqlikda ishlaydi.
        </p>
      </div>
    </aside>
  );
}
