"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function PWARedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in PWA standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    // If installed PWA is opened at root landing page "/", auto-redirect to "/dashboard"
    if (isStandalone && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  return null;
}
