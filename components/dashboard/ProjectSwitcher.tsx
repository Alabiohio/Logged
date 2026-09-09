"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, FolderKanban, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { trackProjectSwitched } from "@/lib/analytics";

interface Project {
  id: string;
  name: string;
  slug?: string;
  environment?: string;
}

interface ProjectSwitcherProps {
  variant?: "navbar" | "sidebar";
  isCollapsed?: boolean;
}

export function ProjectSwitcher({ variant = "navbar" }: ProjectSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentProjectId = typeof params?.id === "string" ? params.id : null;
  const currentProject = projects.find((p) => p.id === currentProjectId);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectProject = (projectId: string) => {
    const selected = projects.find((p) => p.id === projectId);
    if (selected) {
      trackProjectSwitched(projectId, selected.name);
    }
    setDropdownOpen(false);
    if (pathname.includes("/logs")) {
      router.push(`/dashboard/projects/${projectId}/logs`);
    } else {
      router.push(`/dashboard/projects/${projectId}`);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const title = pathname.includes("/activity")
    ? "Activity"
    : pathname.includes("/settings")
    ? "Settings"
    : "Overview";

  const displayLabel = currentProject ? currentProject.name : title;

  if (variant === "sidebar") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label="Switch project"
          className="w-full flex items-center gap-3 rounded-2xl border border-border/60 bg-glass/60 hover:bg-glass transition-colors px-4 py-3 text-sm font-semibold text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <FolderKanban className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden="true" />
          <span className="truncate flex-1">{displayLabel}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              role="listbox"
              aria-label="Projects list"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 w-72 rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-2xl z-50 left-0"
            >
              <div className="px-2 pt-1 pb-2 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search project..."
                    aria-label="Search projects"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-glass/80 pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Projects
                </div>
                {loading ? (
                  <div className="px-3 py-3 text-center text-xs text-text-muted">Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-text-muted">No projects found</div>
                ) : (
                  filteredProjects.map((p) => {
                    const isSelected = p.id === currentProjectId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProject(p.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-glass/60 hover:text-text"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{p.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="pt-1.5 mt-1 border-t border-border/50">
                <Link
                  href="/dashboard/projects/new"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-glass/60 hover:text-text transition-colors"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Create New Project</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex justify-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
        aria-label="Switch project menu"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-glass/60 hover:bg-glass transition-colors max-w-[200px] sm:max-w-[260px] text-text font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="truncate">
          {displayLabel}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            role="listbox"
            aria-label="Projects list"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-72 rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-2xl z-50 left-1/2 -translate-x-1/2"
          >
            <div className="px-2 pt-1 pb-2 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search project..."
                  aria-label="Search projects"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-glass/80 pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Projects
              </div>
              {loading ? (
                <div className="px-3 py-3 text-center text-xs text-text-muted">Loading projects...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-text-muted">No projects found</div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = p.id === currentProjectId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-glass/60 hover:text-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{p.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-1.5 mt-1 border-t border-border/50">
              <Link
                href="/dashboard/projects/new"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-glass/60 hover:text-text transition-colors"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span>Create New Project</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
