import React from "react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary text-white font-semibold",
  secondary: "btn-secondary text-text font-medium",
  ghost:
    "bg-transparent border border-border text-text-secondary hover:bg-glass hover:text-text transition-all rounded-full",
  danger:
    "bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all rounded-full font-medium",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
      aria-disabled={disabled || loading ? true : undefined}
      className={`
        inline-flex items-center justify-center gap-2 cursor-pointer
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Cardio size="42" color="currentColor" speed="1.5" stroke="4" bgOpacity="0.1" />
      ) : (
        icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      )}
      {children}
    </button>
  );
}
