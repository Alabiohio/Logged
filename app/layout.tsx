import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
  ],
  applicationName: "Logged",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
