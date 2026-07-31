import { motion } from "framer-motion";
import { FilmIcon } from "lucide-react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui";
import { useUiStore } from "@/store/uiStore";

export function RecentProjectsGrid({ projects, title = "Oxirgi loyihalar" }: { projects: Project[]; title?: string }) {
  const openUploadModal = useUiStore((s) => s.openUploadModal);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center">
        <FilmIcon className="mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm font-medium text-white/70">Hali loyihalar yo'q</p>
        <p className="mt-1 max-w-sm text-xs text-white/40">
          Birinchi videongizni yuklang — AI avtomatik tahlil qilib, professional highlight video
          tayyorlab beradi.
        </p>
        <Button className="mt-5" onClick={openUploadModal}>
          Video yuklash
        </Button>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.25 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
