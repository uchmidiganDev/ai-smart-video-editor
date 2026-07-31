import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/routes/Dashboard";
import { Projects } from "@/routes/Projects";
import { Processing } from "@/routes/Processing";
import { Workspace } from "@/routes/Workspace";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project/:id/processing" element={<Processing />} />
            <Route path="project/:id" element={<Workspace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
