import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity",
  description: "Monitor all recent activity and events across your projects on Logged.",
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
