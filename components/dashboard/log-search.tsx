"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function LogSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [search, setSearch] = useState(initialSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return; // Ignore if already typing in an input
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update URL on debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.delete("cursor"); // Reset pagination on search change
      const newQuery = params.toString();
      const currentQuery = searchParams.toString();
      
      // Only push if different to prevent looping
      if (newQuery !== currentQuery) {
          router.replace(`${pathname}?${newQuery}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  return (
    <div className="relative flex-1 group min-w-[250px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors group-focus-within:text-primary" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search logs... (Press '/' to focus)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-10 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted/70"
      />
      {search && (
        <button
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 rounded-md transition-colors"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none opacity-50">
        <kbd className="bg-background-tertiary px-1.5 py-0.5 rounded text-[10px] font-mono border border-border/50 text-text-muted">/</kbd>
      </div>
    </div>
  );
}
