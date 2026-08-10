interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-border-secondary ${className}`}
        />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-28" />
            </div>
        </div>
    );
}

export function LogRowSkeleton() {
    return (
        <div className="flex items-center gap-4 py-3 px-4 border-b border-border/30">
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20 shrink-0" />
        </div>
    );
}

export function ProjectCardSkeleton() {
    return (
        <div className="rounded-3xl border border-border bg-glass p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="border-t border-border pt-4 flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}
