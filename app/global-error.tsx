"use client";

import { useEffect } from "react";
import "./globals.css";
import { ErrorPage } from "@/components/error-page";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text antialiased">
        <ErrorPage
          statusCode={500}
          eyebrow="Application error"
          title="Application error"
          description="The application hit an unexpected issue. Please retry or return to the homepage."
          primaryAction={{ label: "Try again", onClick: reset }}
          secondaryAction={{ label: "Go home", href: "/" }}
        />
      </body>
    </html>
  );
}
