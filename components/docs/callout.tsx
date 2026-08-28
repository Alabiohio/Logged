type CalloutVariant = "info" | "warning" | "tip";

type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
};

const variantStyles: Record<CalloutVariant, { bg: string; border: string; icon: string; title: string }> = {
  info: {
    bg: "bg-info/5",
    border: "border-info/20",
    icon: "text-info",
    title: "text-info",
  },
  warning: {
    bg: "bg-warning/5",
    border: "border-warning/20",
    icon: "text-warning",
    title: "text-warning",
  },
  tip: {
    bg: "bg-success/5",
    border: "border-success/20",
    icon: "text-success",
    title: "text-success",
  },
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`my-6 rounded-2xl border ${styles.bg} ${styles.border} p-5`}>
      {title && (
        <p className={`mb-2 text-sm font-semibold ${styles.title}`}>{title}</p>
      )}
      <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}
