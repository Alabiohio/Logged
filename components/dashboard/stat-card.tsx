import type { ElementType } from "react";
import Link from "next/link";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ElementType<{ className?: string }>;
    iconColor?: string;
    iconBg?: string;
    trend?: string;
    trendClass?: string;
    href?: string;
    onClick?: () => void;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    trend,
    trendClass = "bg-text-secondary/10 text-text-secondary",
    href,
    onClick,
}: StatCardProps) {
    const cardContent = (
        <div className={`rounded-[var(--radius-lg)] border border-border bg-background-secondary p-5 shadow-sm space-y-3 h-full ${
            href || onClick ? "hover:border-primary/40 cursor-pointer group" : ""
        }`}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className={`text-2xl font-black text-text ${href || onClick ? "group-hover:text-primary" : ""}`}>
                        {value}
                    </p>
                    <p className="text-sm text-text-secondary">{label}</p>
                </div>
                <div
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {trend && (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${trendClass}`}
                >
                    {trend}
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} onClick={onClick} className="block h-full">
                {cardContent}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button onClick={onClick} type="button" className="block w-full text-left h-full">
                {cardContent}
            </button>
        );
    }

    return cardContent;
}
