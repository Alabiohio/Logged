"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/error-page";

export default function Error({
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
    <ErrorPage
      statusCode={500}
      eyebrow="Server error"
      title="Something went wrong"
      description="We hit an unexpected issue while loading this page. You can try again or head back to the homepage."
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Go home", href: "/" }}
    />
  );
}
