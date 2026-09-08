import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project",
  description: "Create a new project on Logged to start capturing errors and logs.",
};

export default function NewProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
