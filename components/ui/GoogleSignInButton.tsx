"use client";

import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface GoogleSignInButtonProps {
    onClick: () => void;
    disabled?: boolean;
    label?: string;
    isLoading?: boolean;
}

export function GoogleSignInButton({
    onClick,
    disabled = false,
    label = "Continue with Google",
    isLoading = false,
}: GoogleSignInButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            id="google-sign-in-btn"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm font-medium text-text transition-all hover:bg-background hover:border-primary/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Cardio size="52" color="currentColor" speed="1.5" stroke="5" bgOpacity="0.1" />
            ) : (
                <>
                    {/* Official Google "G" logo SVG — four-color brand mark */}
                    <svg
                        aria-hidden="true"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                            fill="#4285F4"
                        />
                        <path
                            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                            fill="#34A853"
                        />
                        <path
                            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
