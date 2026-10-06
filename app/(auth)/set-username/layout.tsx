import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Username",
  description: "Choose a unique username to personalize your Logged profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetUsernameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
