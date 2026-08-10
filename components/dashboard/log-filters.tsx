"use client";

import { Filter, ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function LogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const level = searchParams.get("level") || "all";
  const environment = searchParams.get("environment") || "all";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("cursor"); // Reset pagination
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("level");
    params.delete("environment");
    params.delete("from");
    params.delete("to");
    params.delete("cursor");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const hasFilters = level !== "all" || environment !== "all" || fromDate || toDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Level Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <select
          value={level}
          onChange={(e) => updateFilter("level", e.target.value)}
          className="appearance-none rounded-xl border border-border bg-background/50 pl-9 pr-8 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors hover:bg-glass/80"
        >
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="debug">Debug</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>

      {/* Environment Filter */}
      <div className="relative">
        <select
          value={environment}
          onChange={(e) => updateFilter("environment", e.target.value)}
          className="appearance-none rounded-xl border border-border bg-background/50 pl-4 pr-8 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors hover:bg-glass/80"
        >
          <option value="all">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
      
      {/* Date Filter (from) */}
      <div className="relative flex items-center">
          <span className="text-xs text-text-muted mr-2 hidden sm:inline">From:</span>
          <input
              type="date"
              value={fromDate}
              onChange={(e) => updateFilter("from", e.target.value)}
              className="rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors hover:bg-glass/80"
          />
      </div>

      {/* Date Filter (to) */}
      <div className="relative flex items-center">
          <span className="text-xs text-text-muted mr-2 hidden sm:inline">To:</span>
          <input
              type="date"
              value={toDate}
              onChange={(e) => updateFilter("to", e.target.value)}
              className="rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 cursor-pointer transition-colors hover:bg-glass/80"
          />
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-text-muted hover:text-text hover:bg-glass rounded-xl transition-all border border-transparent hover:border-border"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}
