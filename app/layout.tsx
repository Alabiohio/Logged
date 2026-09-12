/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { Inconsolata, Orbitron, PT_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PWARedirect } from "@/components/PWARedirect";
import { GoogleAnalytics } from "@next/third-parties/google";

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"], 
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Logged | Error Monitoring for Modern Apps",
    template: "%s | Logged",
  },
  description:
    "Track errors, inspect logs, and understand product issues in real time with Logged.",
  keywords: [
    "error monitoring",
    "application logs",
    "debugging",
    "frontend monitoring",
    "observability",
    "Logged",
    "PWA",
  ],
  applicationName: "Logged",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logged",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Logged | Error Monitoring for Modern Apps",
    description:
      "Track errors, inspect logs, and understand product issues in real time with Logged.",
    url: "/",
    siteName: "Logged",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logged | Error Monitoring for Modern Apps",
    description:
      "Track errors, inspect logs, and understand product issues in real time with Logged.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inconsolata.variable} ${orbitron.variable} ${ptSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:font-medium focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWARedirect />
          {children}
          <CookieBanner />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}

