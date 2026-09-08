import type { Metadata } from "next";
import { Inconsolata, Orbitron, PT_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
