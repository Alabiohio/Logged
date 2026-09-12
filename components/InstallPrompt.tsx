"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      // Check if already running as installed PWA
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      ) {
        setIsStandalone(true);
        return;
      }

      // Check if user previously dismissed the prompt during this session
      const dismissed = sessionStorage.getItem("logged_pwa_prompt_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      if (isIosDevice) {
        setIsIOS(true);
      }
    });

    // Standard PWA beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("logged_pwa_prompt_dismissed", "true");
  };

  // If already running standalone or user dismissed or not eligible to install, render nothing
  if (isStandalone || isDismissed) {
    return null;
  }

  // Show prompt if event captured or on iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] max-w-md w-full px-4 sm:px-0 transition-all duration-300 transform translate-y-0">
        <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-800 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Logged Icon"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-md"
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                Install Logged
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                Install for quick access, offline mode & real-time monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/50 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Close install prompt"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Install on iOS</h3>
                <p className="text-xs text-slate-400">Safari on iPhone & iPad</p>
              </div>
            </div>
            <ol className="space-y-3 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                Tap the <Share className="w-4 h-4 text-blue-400 inline mx-1" /> <strong>Share</strong> button in Safari&apos;s menu.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                Tap <strong>Add</strong> to launch Logged as a native app!
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl font-medium text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
