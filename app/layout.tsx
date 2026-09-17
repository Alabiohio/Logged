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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://logged.oheo.site",
  ),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Logged | Logs & Debugging for Modern Applications",
    template: "%s | Logged",
  },
  description:
    "Track errors, inspect logs, and understand product issues in real time with Logged.",
  applicationName: "Logged",
  authors: [{ name: "Oheo", url: "https://oheo.site" }],
  creator: "Oheo",
  publisher: "Oheo",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  keywords: [
    "error monitoring",
    "application logs",
    "debugging",
    "frontend monitoring",
    "observability",
    "Logged",
    "PWA",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logged",
    startupImage: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Logged | Logs & Debugging for Modern Applications",
    description:
      "Track errors, inspect logs, and understand product issues in real time with Logged.",
    url: "/",
    siteName: "Logged",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/dcim/banner.png",
        width: 1200,
        height: 630,
        alt: "Logged application monitoring logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logged | Logs & Debugging for Modern Applications",
    description:
      "Track errors, inspect logs, and understand product issues in real time with Logged.",
    images: ["/dcim/banner.png"],
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

