"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

interface LogoLoadingProps {
  className?: string;
}

export default function LogoLoading({ className }: LogoLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/logo/logo.json",
    });

    return () => {
      animationRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
