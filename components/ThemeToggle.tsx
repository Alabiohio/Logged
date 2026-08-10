"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-border bg-glass/50 p-1">
        <div className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-glass/50 p-1 backdrop-blur-3xl">
      <button
        onClick={() => setTheme("light")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-text-muted hover:text-text"
        }`}
        aria-label="Light theme"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          theme === "system"
            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
            : "text-text-muted hover:text-text"
        }`}
        aria-label="System theme"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          theme === "dark"
            ? "bg-slate-800 text-white shadow-sm"
            : "text-text-muted hover:text-text"
        }`}
        aria-label="Dark theme"
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
