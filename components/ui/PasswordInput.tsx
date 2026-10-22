"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    className?: string;
    inputClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput({ className, inputClassName, ...props }, ref) {
        const [visible, setVisible] = useState(false);

        return (
            <div className={`relative${className ? ` ${className}` : ""}`}>
                <input
                    {...props}
                    ref={ref}
                    type={visible ? "text" : "password"}
                    className={`pr-10 ${inputClassName ?? ""}`}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    aria-label={visible ? "Hide password" : "Show password"}
                    onClick={() => setVisible((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:text-primary"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4 shrink-0" />
                    ) : (
                        <Eye className="h-4 w-4 shrink-0" />
                    )}
                </button>
            </div>
        );
    }
);
