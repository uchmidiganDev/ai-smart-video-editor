import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderOpen, UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/uiStore";

export function MobileNav() {
  const openUploadModal = useUiStore((s) => s.openUploadModal);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/10 bg-base-950/90 px-2 py-2 backdrop-blur-xl md:hidden">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-medium",
            isActive ? "text-white" : "text-white/40",
          )
        }
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </NavLink>

      <button
        onClick={openUploadModal}
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient shadow-glow-violet"
      >
        <UploadCloud className="h-6 w-6 text-white" />
      </button>

      <NavLink
        to="/projects"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] font-medium",
            isActive ? "text-white" : "text-white/40",
          )
        }
      >
        <FolderOpen className="h-5 w-5" />
        Loyihalar
      </NavLink>
    </nav>
  );
}
