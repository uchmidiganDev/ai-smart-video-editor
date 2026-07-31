import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { UploadModal } from "@/components/upload/UploadModal";
import { useProjectsStore } from "@/store/projectsStore";

export function AppShell() {
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);

  React.useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition />
          </div>
        </main>
      </div>
      <MobileNav />
      <UploadModal />
    </div>
  );
}
