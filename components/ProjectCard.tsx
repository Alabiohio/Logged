import Link from "next/link";
import { FolderKanban, Clock, Activity, ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";


interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    isArchived?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    logCount?: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const logCount = project.logCount ?? 0;
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={`group block rounded-3xl border bg-glass p-6 transition-all hover:bg-glass-hover ${
        project.isArchived ? "border-warning/30 bg-warning/5" : "border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            project.isArchived ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
          }`}>
            <FolderKanban className="h-6 w-6 shrink-0" />
          </div>
          <div className="min-w-0 overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              {project.isArchived && (
                <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning uppercase tracking-wider">
                  Archived
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-2 break-words">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>


      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Activity className="h-4 w-4" />
            <span>{logCount.toLocaleString()} {logCount === 1 ? "Log" : "Logs"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>{timeAgo(new Date(project.updatedAt))}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
