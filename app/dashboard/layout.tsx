import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Logged",
  },
  description: "Manage your projects, view logs, and monitor your applications in real time.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
