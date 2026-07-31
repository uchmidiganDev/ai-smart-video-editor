import * as React from "react";
import { useProjectsStore } from "@/store/projectsStore";
import { RecentProjectsGrid } from "@/components/dashboard/RecentProjectsGrid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui";
import type { ProjectStatus } from "@/types";

const FILTERS: { id: ProjectStatus | "all"; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "processing", label: "Jarayonda" },
  { id: "ready", label: "Tayyor" },
];

export function Projects() {
  const projects = useProjectsStore((s) => s.projects);
  const [filter, setFilter] = React.useState<ProjectStatus | "all">("all");

  const filtered =
    filter === "all"
      ? projects
      : projects.filter((p) => (filter === "processing" ? p.status === "processing" || p.status === "uploading" : p.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loyihalar</h1>
          <p className="mt-1 text-sm text-white/45">Barcha yuklangan va tahlil qilingan videolaringiz</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ProjectStatus | "all")}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <RecentProjectsGrid projects={filtered} title="" />
    </div>
  );
}
