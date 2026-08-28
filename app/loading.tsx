"use client";

import LogoLoading from "@/components/LogoLoading";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LogoLoading className="w-64 h-64" />
    </div>
  );
}
