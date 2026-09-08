import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse and manage all your monitored projects on Logged.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
