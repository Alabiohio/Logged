import type { Metadata } from "next";
import { OfflinePage } from "@/components/OfflinePage";

export const metadata: Metadata = {
  title: "Offline",
  description: "Logged is offline. Check your connection and try again.",
};

export default function OfflineRoute() {
  return <OfflinePage />;
}
