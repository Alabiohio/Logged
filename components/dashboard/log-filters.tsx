"use client";

import { startTransition } from "react";
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
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("level");
    params.delete("environment");
    params.delete("from");
    params.delete("to");
    params.delete("cursor");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const hasFilters = level !== "all" || environment !== "all" || fromDate || toDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Level Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
        <select
          value={level}
          onChange={(e) => updateFilter("level", e.target.value)}
          aria-label="Filter by log level"
          className="appearance-none rounded-xl border border-border bg-background/50 pl-9 pr-8 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors hover:bg-glass/80"
        >
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="debug">Debug</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" aria-hidden="true" />
      </div>

      {/* Environment Filter */}
      <div className="relative">
        <select
          value={environment}
          onChange={(e) => updateFilter("environment", e.target.value)}
          aria-label="Filter by environment"
          className="appearance-none rounded-xl border border-border bg-background/50 pl-4 pr-8 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors hover:bg-glass/80"
        >
          <option value="all">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" aria-hidden="true" />
      </div>
      
      {/* Date Filter (from) */}
      <div className="relative flex items-center">
        <label htmlFor="log-filter-from" className="text-xs text-text-muted mr-1.5 whitespace-nowrap">From:</label>
        <div className="relative flex items-center">
          <input
            id="log-filter-from"
            type="date"
            placeholder="mm/dd/yy"
            aria-label="Filter from date"
            value={fromDate}
            onChange={(e) => updateFilter("from", e.target.value)}
            className={`rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors hover:bg-glass/80 min-h-[40px] ${
              !fromDate ? "text-transparent [&::-webkit-datetime-edit]:text-transparent" : ""
            }`}
          />
          {!fromDate && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted select-none">
              mm/dd/yy
            </span>
          )}
        </div>
      </div>

      {/* Date Filter (to) */}
      <div className="relative flex items-center">
        <label htmlFor="log-filter-to" className="text-xs text-text-muted mr-1.5 whitespace-nowrap">To:</label>
        <div className="relative flex items-center">
          <input
            id="log-filter-to"
            type="date"
            placeholder="mm/dd/yy"
            aria-label="Filter to date"
            value={toDate}
            onChange={(e) => updateFilter("to", e.target.value)}
            className={`rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors hover:bg-glass/80 min-h-[40px] ${
              !toDate ? "text-transparent [&::-webkit-datetime-edit]:text-transparent" : ""
            }`}
          />
          {!toDate && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted select-none">
              mm/dd/yy
            </span>
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          aria-label="Clear all log filters"
          className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-text-muted hover:text-text hover:bg-glass rounded-xl transition-all border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
