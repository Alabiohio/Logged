import type { Metadata } from "next";
import { ErrorPage } from "@/components/error-page";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      eyebrow="404"
      title="Page not found"
      description="The page you were looking for does not exist or may have moved. You can return home or explore the docs."
      primaryAction={{ label: "Back home", href: "/" }}
      secondaryAction={{ label: "Open docs", href: "/docs" }}
    />
  );
}
