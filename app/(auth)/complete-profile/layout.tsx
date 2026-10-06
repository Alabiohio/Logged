import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Profile",
  description: "Finish setting up your Logged profile to get started.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompleteProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
