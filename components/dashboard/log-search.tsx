"use client";

import { useEffect, useRef, useState, startTransition } from "react";
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
        startTransition(() => {
          router.replace(`${pathname}?${newQuery}`, { scroll: false });
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  // Sync state if URL changes externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch((prev) => (prev !== urlSearch ? urlSearch : prev));
  }, [searchParams]);

  return (
    <div className="relative flex-1 group min-w-[240px] h-11">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search className="h-4 w-4 text-text-muted transition-colors group-focus-within:text-primary" aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        type="text"
        aria-label="Search logs"
        placeholder="Search logs... (Press '/' to focus)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-10 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary transition-all placeholder:text-text-muted/70"
      />
      {search ? (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Clear search"
          aria-label="Clear search query"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <div className="pointer-events-none absolute inset-y-0 right-3 hidden sm:flex items-center opacity-50" aria-hidden="true">
          <kbd className="bg-background-tertiary px-1.5 py-0.5 rounded text-[10px] font-mono border border-border/50 text-text-muted leading-none">/</kbd>
        </div>
      )}
    </div>
  );
}
