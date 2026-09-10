import { notFound } from "next/navigation";
import { ErrorPage } from "@/components/error-page";

const ERROR_CONTENT: Record<number, { title: string; description: string }> = {
  400: {
    title: "Bad request",
    description: "This request could not be processed because the data supplied was invalid or incomplete.",
  },
  401: {
    title: "Authentication required",
    description: "Please sign in to continue. Your current session is not authorized for this page.",
  },
  403: {
    title: "Access denied",
    description: "You do not have permission to view this resource. Try a different account or return home.",
  },
  404: {
    title: "Page not found",
    description: "The requested page could not be found. It may have been moved or deleted.",
  },
  409: {
    title: "Conflict",
    description: "This action conflicts with the current state of the application. Refresh and try again.",
  },
  429: {
    title: "Too many requests",
    description: "You are making requests too quickly. Please wait a moment and retry.",
  },
  500: {
    title: "Server error",
    description: "The server encountered an unexpected problem while processing this request.",
  },
  503: {
    title: "Service unavailable",
    description: "This service is temporarily unavailable. Please try again shortly.",
  },
};

export function generateStaticParams() {
  return Object.keys(ERROR_CONTENT).map((code) => ({ code }));
}

export default async function ErrorCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const statusCode = Number(code);
  const content = ERROR_CONTENT[statusCode];

  if (!content) {
    notFound();
  }

  return (
    <ErrorPage
      statusCode={statusCode}
      eyebrow={`Error ${statusCode}`}
      title={content.title}
      description={content.description}
      primaryAction={{ label: "Back home", href: "/" }}
      secondaryAction={{ label: "Open docs", href: "/docs" }}
    />
  );
}
