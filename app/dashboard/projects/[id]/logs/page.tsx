"use client";

import { useEffect, useState, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw, Clock, TerminalSquare, Loader2, SearchX, ChevronRight, ChevronDown, Maximize2 } from "lucide-react";
import { LogLevelBadge } from "@/components/dashboard/log-level-badge";
import { LogDetailsDrawer, LogRecord } from "@/components/dashboard/log-details-drawer";
import { LogRowSkeleton } from "@/components/dashboard/skeleton";
import { LogSearch } from "@/components/dashboard/log-search";
import { LogFilters } from "@/components/dashboard/log-filters";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function LogRow({ log, onClick }: { log: LogRecord; onClick: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-0 hover:bg-glass/50 transition-colors">
      <div 
        className="flex items-center gap-4 py-3 px-4 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-5 shrink-0 flex items-center justify-center text-text-muted group-hover:text-text transition-colors">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>

        <div className="w-24 shrink-0 text-xs font-mono text-text-muted">
          {formatTime(log.timestamp || log.createdAt)}
        </div>
        
        <div className="w-24 shrink-0">
          <LogLevelBadge level={log.level} />
        </div>
        
        <div className="flex-1 min-w-0 truncate font-medium text-sm text-text">
          {log.message}
        </div>
        
        <div className="w-24 shrink-0 text-right">
          <span className="text-xs text-text-muted bg-background-tertiary px-2 py-1 rounded">
            {log.environment || "N/A"}
          </span>
        </div>

        <div className="w-8 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={(e) => { e.stopPropagation(); onClick(); }}
             className="p-1.5 hover:bg-background-tertiary rounded-md text-text-muted hover:text-text transition-colors"
             title="Open full details"
           >
             <Maximize2 className="h-4 w-4" />
           </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-14 pr-4 pb-4 pt-1 bg-background-secondary/10">
           <div className="text-sm text-text space-y-2 font-mono whitespace-pre-wrap break-all bg-background-tertiary/50 p-3 rounded-lg border border-border/50">
             <div className="font-semibold">{log.message}</div>
             {log.url && <div className="text-text-muted text-xs mt-2">URL: {log.url}</div>}
             {log.metadata && Object.keys(log.metadata).length > 0 && (
               <div className="text-text-muted text-xs mt-2 overflow-hidden text-ellipsis line-clamp-5">
                 {JSON.stringify(log.metadata, null, 2)}
               </div>
             )}
             {log.stack && (
               <div className="text-text-muted text-xs mt-2 line-clamp-3 opacity-70">
                 {log.stack}
               </div>
             )}
           </div>
           <div className="mt-3 flex justify-end">
             <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors"
             >
               View full details
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

/** Active filter badges — shows which filters are currently applied */
function ActiveFilterBadges() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search");
  const level = searchParams.get("level");
  const environment = searchParams.get("environment");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const badges: { label: string; paramKey: string }[] = [];
  if (search) badges.push({ label: `Search: "${search}"`, paramKey: "search" });
  if (level) badges.push({ label: `Level: ${level}`, paramKey: "level" });
  if (environment) badges.push({ label: `Env: ${environment}`, paramKey: "environment" });
  if (from) badges.push({ label: `From: ${from}`, paramKey: "from" });
  if (to) badges.push({ label: `To: ${to}`, paramKey: "to" });

  if (badges.length === 0) return null;

  const removeBadge = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("cursor");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      {badges.map((b) => (
        <span
          key={b.paramKey}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-2.5 py-1 rounded-full"
        >
          {b.label}
          <button
            onClick={() => removeBadge(b.paramKey)}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}

function LogExplorerContent({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  // Cursor pagination state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  // Build query string from current URL search params
  const buildQuery = useCallback((cursor?: string | null) => {
    const query = new URLSearchParams();
    query.set("limit", "50");

    const search = searchParams.get("search");
    const level = searchParams.get("level");
    const environment = searchParams.get("environment");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (search) query.set("search", search);
    if (level) query.set("level", level);
    if (environment) query.set("environment", environment);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (cursor) query.set("cursor", cursor);

    return query.toString();
  }, [searchParams]);

  // Fetch logs (initial load or filter change)
  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/logs?${buildQuery()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setNextCursor(data.pagination.nextCursor);
        setHasMore(data.pagination.hasMore);
        setTotalLogs(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, buildQuery]);

  // Load more (append)
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/logs?${buildQuery(nextCursor)}`);
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [...prev, ...data.logs]);
        setNextCursor(data.pagination.nextCursor);
        setHasMore(data.pagination.hasMore);
      }
    } catch (err) {
      console.error("Failed to load more logs", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Re-fetch when search params change (filters, search)
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Determine if any filters are active (for empty state logic)
  const hasActiveFilters = !!(
    searchParams.get("search") ||
    searchParams.get("level") ||
    searchParams.get("environment") ||
    searchParams.get("from") ||
    searchParams.get("to")
  );

  const clearAllFilters = () => {
    router.replace(pathname);
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-theme(spacing.32))]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
          <h1 className="text-2xl font-black text-text flex items-center gap-3">
            <TerminalSquare className="h-6 w-6 text-primary" />
            Log Explorer
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {totalLogs > 0 && (
            <span className="text-sm text-text-muted">
              {totalLogs.toLocaleString()} {totalLogs === 1 ? "log" : "logs"}
            </span>
          )}
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-glass px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-glass-hover disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar — Search + Filters */}
      <div className="glass rounded-2xl p-4 space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <LogSearch />
          <LogFilters />
        </div>
        <ActiveFilterBadges />
      </div>

      {/* Main Content Area */}
      <div className="glass rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-4 py-3 px-4 border-b border-border/50 bg-background-secondary/50 text-xs font-semibold text-text-secondary uppercase tracking-wider shrink-0">
          <div className="w-5 shrink-0"></div>
          <div className="w-24 shrink-0">Time</div>
          <div className="w-24 shrink-0">Level</div>
          <div className="flex-1">Message</div>
          <div className="w-24 shrink-0 text-right">Environment</div>
          <div className="w-8 shrink-0"></div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div>
              {[...Array(10)].map((_, i) => (
                <LogRowSkeleton key={i} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-3 p-8 text-center">
              {hasActiveFilters ? (
                <>
                  <SearchX className="h-12 w-12 opacity-20" />
                  <p className="font-medium text-text">No logs found</p>
                  <p className="text-sm max-w-sm">
                    We couldn&apos;t find any logs matching your current search and filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors border border-primary/20"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <Clock className="h-12 w-12 opacity-20" />
                  <p className="font-medium text-text">No logs yet</p>
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl max-w-md text-sm">
                    <p className="font-semibold text-text mb-2">Send your first log</p>
                    <p className="mb-3">Use the API key from your project settings to send logs via POST /api/v1/logs.</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {logs.map((log) => (
                <LogRow key={log.id} log={log} onClick={() => setSelectedLog(log)} />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-text-secondary bg-glass hover:bg-glass-hover border border-border rounded-xl transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load more</>
                    )}
                  </button>
                </div>
              )}

              {/* End of results */}
              {!hasMore && logs.length > 0 && (
                <div className="text-center py-4 text-xs text-text-muted border-t border-border/30">
                  Showing all {logs.length.toLocaleString()} of {totalLogs.toLocaleString()} matching logs
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LogDetailsDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}

export default function LogExplorerPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;

  return (
    <Suspense fallback={
      <div className="space-y-4 flex flex-col h-[calc(100vh-theme(spacing.32))]">
        <div className="h-16 bg-glass rounded-2xl animate-pulse" />
        <div className="h-20 bg-glass rounded-2xl animate-pulse" />
        <div className="flex-1 bg-glass rounded-2xl animate-pulse" />
      </div>
    }>
      <LogExplorerContent projectId={projectId} />
    </Suspense>
  );
}
