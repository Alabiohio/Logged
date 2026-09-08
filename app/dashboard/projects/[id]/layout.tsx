import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Details",
  description: "View logs, manage API keys, and configure settings for your Logged project.",
};

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
