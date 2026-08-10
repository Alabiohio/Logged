import Link from "next/link";
import { FolderKanban, Clock, Activity, ChevronRight } from "lucide-react";
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group block rounded-3xl border border-border bg-glass p-6 transition-all hover:bg-glass-hover hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-text group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-1">
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
            <span>0 Logs</span>
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
