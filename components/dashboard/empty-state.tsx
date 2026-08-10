import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center bg-glass/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-text">{title}</h3>
            <p className="mt-2 text-text-secondary max-w-sm">{description}</p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                    {actionLabel}
                </Link>
            )}

            {actionLabel && onAction && !actionHref && (
                <button
                    onClick={onAction}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
