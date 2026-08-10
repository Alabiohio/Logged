const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    log: {
        bg: "bg-text/5",
        text: "text-text-secondary",
        border: "border-border",
    },
    error: {
        bg: "bg-error/10",
        text: "text-error",
        border: "border-error/20",
    },
    warn: {
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning/20",
    },
    warning: {
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning/20",
    },
    success: {
        bg: "bg-success/10",
        text: "text-success",
        border: "border-success/20",
    },
    info: {
        bg: "bg-info/10",
        text: "text-info",
        border: "border-info/20",
    },
    debug: {
        bg: "bg-debug/10",
        text: "text-debug",
        border: "border-debug/20",
    },
};

interface LogLevelBadgeProps {
    level: string;
    size?: "sm" | "md";
}

export function LogLevelBadge({ level, size = "sm" }: LogLevelBadgeProps) {
    const config = LEVEL_CONFIG[level.toLowerCase()] ?? LEVEL_CONFIG.info;

    const sizeClasses =
        size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : "px-3 py-1 text-xs";

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
        >
            {level.toUpperCase()}
        </span>
    );
}
