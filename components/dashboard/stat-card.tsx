import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    trend?: string;
    trendClass?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    trend,
    trendClass = "bg-text-secondary/10 text-text-secondary",
}: StatCardProps) {
    return (
        <div className="glass rounded-[var(--radius-lg)] p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${trendClass}`}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-black text-text">{value}</p>
                <p className="text-sm text-text-secondary">{label}</p>
            </div>
        </div>
    );
}
